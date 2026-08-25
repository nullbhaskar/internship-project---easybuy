import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { useAddress, DeliveryAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import { sendOrderConfirmationEmail } from '../services/emailService';

const { width } = Dimensions.get('window');

// ─── BRAND DESIGN TOKENS ───
const BRAND_THEME = {
  PRIMARY: '#2F6E49', // Deep Green
  SECONDARY: '#89B882', // Mint Accent
  ACCENT: '#F6CC63', // Warm Amber Gold
  BG_CREAM: '#FAF7F2', // Champagne Ivory
  BG_DARK: '#090D16', // Obsidian Black
  CARD_WHITE: '#FFFFFF',
  CARD_DARK: '#121927',
  BORDER_LIGHT: '#D5D0C6', // Warm divider
  BORDER_DARK: '#1F293D',
  TEXT_DARK: '#1A1A18',
  TEXT_MUTED: '#7A7668',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const isDark = isDarkMode;
  const { isGuest, isAuthenticated, user, requireAuth } = useAuth();

  React.useEffect(() => {
    if (isGuest || !isAuthenticated) {
      requireAuth('proceed with checkout');
      router.replace('/home');
    }
  }, [isGuest, isAuthenticated]);

  const {
    cartItems,
    subtotal,
    deliveryFee,
    totalAmount,
    totalItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { selectedAddress, openLocationModal, saveAddress } = useAddress();

  // Physical Address Modal State
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [receiverNameInput, setReceiverNameInput] = useState(user?.fullName || auth.currentUser?.displayName || 'User');
  const [phoneInput, setPhoneInput] = useState('+91 9876543210');
  const [houseNoInput, setHouseNoInput] = useState('');
  const [buildingInput, setBuildingInput] = useState('');
  const [streetInput, setStreetInput] = useState('Area Road');
  const [areaInput, setAreaInput] = useState('Dinapur-Cum-Khagaul');
  const [cityInput, setCityInput] = useState('Patna');
  const [stateInput, setStateInput] = useState('Bihar');
  const [pincodeInput, setPincodeInput] = useState('801503');
  const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Hostel' | 'Other'>('Home');

  const handleSavePhysicalAddress = async () => {
    if (!houseNoInput.trim() && !buildingInput.trim()) {
      Alert.alert('Required Field', 'Please enter your Flat / House Number or Building Name.');
      return;
    }
    if (!areaInput.trim() || !pincodeInput.trim()) {
      Alert.alert('Required Field', 'Please enter Area / Street and Pincode.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const newAddress: DeliveryAddress = {
      addressId: `addr_${Date.now()}`,
      receiverName: receiverNameInput.trim() || 'User',
      phoneNumber: phoneInput.trim() || '+91 9876543210',
      houseNumber: houseNoInput.trim(),
      building: buildingInput.trim(),
      street: streetInput.trim(),
      landmark: '',
      locality: areaInput.trim(),
      city: cityInput.trim() || 'Patna',
      state: stateInput.trim() || 'Bihar',
      pincode: pincodeInput.trim() || '801503',
      country: 'India',
      type: addressType,
      isDefault: true,
    };

    await saveAddress(newAddress);
    setAddAddressModalVisible(false);
  };

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Placing Order State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);

  const handleApplyCoupon = () => {
    Haptics.selectionAsync().catch(() => {});
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === 'WELCOME100') {
      setDiscountAmount(100);
      setCouponApplied(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (cleanCode === 'EASY50') {
      setDiscountAmount(50);
      setCouponApplied(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Invalid Coupon', 'Try using WELCOME100 or EASY50.');
    }
  };

  const finalPayable = Math.max(0, totalAmount - discountAmount);

  // Format delivery address display text
  const getFormattedAddress = () => {
    if (selectedAddress.addressId === 'empty') {
      return 'No delivery address selected. Tap Change to configure.';
    }
    const rawParts = [
      selectedAddress.houseNumber,
      selectedAddress.building,
      selectedAddress.street,
      selectedAddress.landmark,
      selectedAddress.locality,
      selectedAddress.city,
      selectedAddress.state,
    ];
    
    const uniqueParts: string[] = [];
    rawParts.forEach((part) => {
      if (!part) return;
      const clean = part.trim();
      if (!clean) return;
      
      // Prevent duplicating parts in formatting
      const alreadyExists = uniqueParts.some(
        (u) => u.toLowerCase() === clean.toLowerCase() || clean.toLowerCase().includes(u.toLowerCase())
      );
      const isContained = uniqueParts.some(
        (u) => u.toLowerCase().includes(clean.toLowerCase())
      );

      if (!alreadyExists && !isContained) {
        uniqueParts.push(clean);
      }
    });

    return `${uniqueParts.join(', ')} - ${selectedAddress.pincode}`;
  };

  // Place Order Action
  const handlePlaceOrder = async () => {
    if (!requireAuth('place an order')) {
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsSubmitting(true);

    try {
      const newOrderRef = doc(collection(db, 'orders'));
      const orderId = `#EB-${Math.floor(100000 + Math.random() * 900000)}`;
      const activeUser: any = user || auth.currentUser;

      const orderData = {
        id: newOrderRef.id,
        orderId,
        userEmail: activeUser?.email || 'guest@easybuy.com',
        userName: activeUser?.fullName || selectedAddress.receiverName || 'Guest Customer',
        userId: activeUser?.uid || 'guest',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        itemCount: totalItems > 0 ? totalItems : (cartItems.length || 1),
        totalAmount: `₹${finalPayable.toLocaleString('en-IN')}`,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentDetails: {
          method: 'cod',
          status: 'Pay on Delivery',
        },
        status: 'Processing',
        currentStepIndex: 0,
        shippingAddress: `${selectedAddress.receiverName} (${selectedAddress.phoneNumber})\n${getFormattedAddress()}`,
        products: cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
        })),
      };

      await setDoc(newOrderRef, orderData);

      // Send Order Confirmation Email
      try {
        await sendOrderConfirmationEmail(
          activeUser?.email || 'guest@easybuy.com',
          activeUser?.fullName || selectedAddress.receiverName || 'Guest Customer',
          orderId,
          cartItems,
          {
            shipping: deliveryFee,
            tax: 0,
            total: finalPayable
          }
        );
      } catch (err) {
        console.error('Order email error:', err);
      }

      setIsSubmitting(false);
      setOrderSuccessModal(true);

      setTimeout(() => {
        clearCart();
        setOrderSuccessModal(false);
        router.replace('/orders');
      }, 2000);
    } catch (e) {
      console.error('Error placing order:', e);
      setIsSubmitting(false);
      Alert.alert('Error', 'Could not complete transaction. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[S.root, isDark ? S.rootDark : S.rootLight]} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ─── HEADER ─── */}
      <View style={[S.header, isDark && S.headerDark]}>
        <TouchableOpacity
          style={[S.backBtn, isDark && S.backBtnDark]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            router.back();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#F8FAFC' : '#1A1A18'} />
        </TouchableOpacity>

        <Text style={[S.headerTitle, isDark && S.textLight]}>Checkout</Text>

        <TouchableOpacity
          style={[S.backBtn, isDark && S.backBtnDark]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            Alert.alert('Share', 'Share checkout summary.');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color={isDark ? '#F8FAFC' : '#1A1A18'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
        {/* ─── 1. DELIVERY ADDRESS CARD ─── */}
        <View style={[S.card, isDark ? S.cardDark : S.cardLight]}>
          <View style={S.cardHeaderRow}>
            <View style={S.cardHeaderLeft}>
              <Ionicons name="location" size={16} color={BRAND_THEME.PRIMARY} />
              <Text style={[S.cardHeaderTitle, isDark && S.textLight]}>Delivery Address</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setAddAddressModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[S.changeLinkText, { color: BRAND_THEME.PRIMARY, fontWeight: '800' }]}>+ Add / Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  openLocationModal();
                }}
                activeOpacity={0.7}
              >
                <Text style={S.changeLinkText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[S.addressBox, isDark && S.addressBoxDark]}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setAddAddressModalVisible(true);
            }}
            activeOpacity={0.88}
          >
            {selectedAddress.addressId !== 'empty' && (
              <Text style={[S.addressName, isDark && S.textLight]}>
                {selectedAddress.receiverName} • {selectedAddress.phoneNumber}
              </Text>
            )}
            <Text style={S.addressStreet}>{getFormattedAddress()}</Text>
            <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="create-outline" size={13} color={BRAND_THEME.PRIMARY} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: BRAND_THEME.PRIMARY }}>
                Tap to enter Flat No, Area, Pincode details
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── 2. ORDER ITEMS PREVIEW ─── */}
        <View style={S.sectionHeader}>
          <Text style={[S.sectionTitle, isDark && S.textLight]}>Your Cart</Text>
          <Text style={S.sectionCount}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</Text>
        </View>

        {cartItems.map((item) => (
          <View key={item.id} style={[S.itemCard, isDark ? S.itemCardDark : S.itemCardLight]}>
            <Image source={{ uri: item.image }} style={S.itemImg} resizeMode="cover" />
            <View style={S.itemDetails}>
              <View style={S.itemHeaderRow}>
                <Text style={[S.itemTitle, isDark && S.textLight]} numberOfLines={2}>
                  {(item.title || item.name || "Unknown Item").toUpperCase()}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    removeFromCart(item.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={S.itemFooterRow}>
                <Text style={[S.itemPrice, isDark && S.textLight]}>
                  {typeof item.price === 'number' ? `₹${item.price}` : (String(item.price).startsWith('₹') ? item.price : `₹${item.price}`)}
                </Text>

                {/* Stepper */}
                <View style={[S.stepperBox, isDark && S.stepperBoxDark]}>
                  <TouchableOpacity
                    style={S.stepperBtn}
                    onPress={() => {
                      updateQuantity(item.id, -1);
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={12} color={isDark ? '#F8FAFC' : '#1A1A18'} />
                  </TouchableOpacity>
                  <Text style={[S.stepperVal, isDark && S.textLight]}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={S.stepperBtn}
                    onPress={() => {
                      updateQuantity(item.id, 1);
                      Haptics.selectionAsync().catch(() => {});
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={12} color={isDark ? '#F8FAFC' : '#1A1A18'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* ─── 3. SELECT PAYMENT METHOD ─── */}
        <View style={[S.card, isDark ? S.cardDark : S.cardLight, { marginTop: 8 }]}>
          <Text style={[S.cardHeaderTitle, isDark && S.textLight, { marginBottom: 12 }]}>
            Select Payment Method
          </Text>

          <View style={S.paymentOptionsColumn}>
            {/* CASH ON DELIVERY ONLY */}
            <TouchableOpacity
              style={[
                S.methodPill,
                isDark ? S.methodPillDark : S.methodPillLight,
                S.methodPillSelected,
                isDark && S.methodPillSelectedDark,
              ]}
              activeOpacity={0.9}
            >
              <View style={S.methodPillLeft}>
                <View style={[S.radioDot, S.radioDotSelected]}>
                  <View style={S.radioInnerDot} />
                </View>
                <Ionicons name="cash-outline" size={16} color={BRAND_THEME.PRIMARY} style={{ marginHorizontal: 8 }} />
                <Text style={[S.methodPillLabel, isDark && S.textLight]}>
                  Cash on Delivery (COD)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 4. PROMO CODE / COUPON ─── */}
        <View style={[S.card, isDark ? S.cardDark : S.cardLight]}>
          <Text style={[S.cardHeaderTitle, isDark && S.textLight, { marginBottom: 10 }]}>
            Promo Code / Coupon
          </Text>

          <View style={S.couponRow}>
            <TextInput
              style={[S.couponInput, isDark && S.couponInputDark]}
              placeholder="Try WELCOME100 or EASY50"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[S.applyBtn, couponApplied && S.applyBtnDisabled]}
              onPress={handleApplyCoupon}
              disabled={couponApplied}
            >
              <Text style={S.applyBtnText}>{couponApplied ? 'Applied ✓' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
          {couponApplied && (
            <Text style={S.couponSuccessText}>🎉 Coupon applied! Saved ₹{discountAmount}</Text>
          )}
        </View>

        {/* ─── 5. BILL SUMMARY ─── */}
        <View style={[S.card, isDark ? S.cardDark : S.cardLight]}>
          <Text style={[S.cardHeaderTitle, isDark && S.textLight, { marginBottom: 12 }]}>
            Bill Summary
          </Text>

          <View style={S.billRow}>
            <Text style={S.billLabel}>Subtotal</Text>
            <Text style={[S.billVal, isDark && S.textLight]}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>

          <View style={S.billRow}>
            <Text style={S.billLabel}>Logistics / Delivery</Text>
            <Text style={{ color: BRAND_THEME.PRIMARY, fontWeight: '800', fontSize: 12.5 }}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={S.billRow}>
              <Text style={S.billLabel}>Coupon Discount</Text>
              <Text style={{ color: BRAND_THEME.PRIMARY, fontWeight: '800', fontSize: 12.5 }}>-₹{discountAmount}</Text>
            </View>
          )}

          <View style={[S.billDivider, isDark && S.billDividerDark]} />

          <View style={S.billRow}>
            <Text style={[S.grandTotalLabel, isDark && S.textLight]}>Total Amount</Text>
            <Text style={[S.grandTotalValue, isDark && S.textLight]}>
              ₹{finalPayable.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── STICKY BOTTOM PLACE ORDER CTA ─── */}
      <View style={[S.bottomBar, isDark && S.bottomBarDark]}>
        <TouchableOpacity
          style={[S.payCtaBtn, isSubmitting && { opacity: 0.8 }]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={S.payCtaText}>
              ✓ PLACE ORDER  •  ₹{finalPayable.toLocaleString('en-IN')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ─── PHYSICAL ADDRESS ENTRY MODAL ─── */}
      <Modal
        visible={addAddressModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddAddressModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalCard, isDark && S.modalCardDark]}>
            <View style={S.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="location-outline" size={20} color={BRAND_THEME.PRIMARY} />
                <Text style={[S.modalTitle, isDark && S.textLight]}>Add Physical Address</Text>
              </View>
              <TouchableOpacity
                style={S.closeModalBtn}
                onPress={() => setAddAddressModalVisible(false)}
              >
                <Ionicons name="close" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
              {/* Receiver Info */}
              <View style={S.formRow}>
                <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>Recipient Name *</Text>
                <TextInput
                  style={[S.formInput, isDark && S.formInputDark]}
                  placeholder="e.g. Bhaskar"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={receiverNameInput}
                  onChangeText={setReceiverNameInput}
                />
              </View>

              <View style={S.formRow}>
                <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>Phone Number *</Text>
                <TextInput
                  style={[S.formInput, isDark && S.formInputDark]}
                  placeholder="+91 9876543210"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  keyboardType="phone-pad"
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                />
              </View>

              {/* Physical Address Specific Fields */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[S.formRow, { flex: 1 }]}>
                  <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>Flat / House No. *</Text>
                  <TextInput
                    style={[S.formInput, isDark && S.formInputDark]}
                    placeholder="e.g. Flat 402, Door 12"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={houseNoInput}
                    onChangeText={setHouseNoInput}
                  />
                </View>
                <View style={[S.formRow, { flex: 1 }]}>
                  <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>Building / Apartment</Text>
                  <TextInput
                    style={[S.formInput, isDark && S.formInputDark]}
                    placeholder="e.g. Sunshine Heights"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={buildingInput}
                    onChangeText={setBuildingInput}
                  />
                </View>
              </View>

              <View style={S.formRow}>
                <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>Street / Road / Area *</Text>
                <TextInput
                  style={[S.formInput, isDark && S.formInputDark]}
                  placeholder="e.g. Area Road, Near Main Road"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={streetInput}
                  onChangeText={setStreetInput}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[S.formRow, { flex: 1.2 }]}>
                  <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>Locality / Area *</Text>
                  <TextInput
                    style={[S.formInput, isDark && S.formInputDark]}
                    placeholder="e.g. Dinapur-Cum-Khagaul"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={areaInput}
                    onChangeText={setAreaInput}
                  />
                </View>
                <View style={[S.formRow, { flex: 0.8 }]}>
                  <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>Pincode *</Text>
                  <TextInput
                    style={[S.formInput, isDark && S.formInputDark]}
                    placeholder="e.g. 801503"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincodeInput}
                    onChangeText={setPincodeInput}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[S.formRow, { flex: 1 }]}>
                  <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>City *</Text>
                  <TextInput
                    style={[S.formInput, isDark && S.formInputDark]}
                    placeholder="e.g. Patna"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={cityInput}
                    onChangeText={setCityInput}
                  />
                </View>
                <View style={[S.formRow, { flex: 1 }]}>
                  <Text style={[S.fieldLabel, isDark && S.fieldLabelDark]}>State *</Text>
                  <TextInput
                    style={[S.formInput, isDark && S.formInputDark]}
                    placeholder="e.g. Bihar"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={stateInput}
                    onChangeText={setStateInput}
                  />
                </View>
              </View>

              {/* Address Type Tag */}
              <Text style={[S.fieldLabel, isDark && S.fieldLabelDark, { marginTop: 4, marginBottom: 6 }]}>
                Address Type
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {(['Home', 'Office', 'Hostel', 'Other'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      S.typeChip,
                      addressType === t && S.typeChipActive,
                      isDark && S.typeChipDark,
                    ]}
                    onPress={() => setAddressType(t)}
                  >
                    <Text
                      style={[
                        S.typeChipTxt,
                        addressType === t && S.typeChipActiveTxt,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={S.saveAddressBtn}
              onPress={handleSavePhysicalAddress}
              activeOpacity={0.88}
            >
              <Text style={S.saveAddressBtnTxt}>Save Address & Deliver Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── ORDER SUCCESS MODAL ─── */}
      {orderSuccessModal && (
        <View style={S.successOverlay}>
          <View style={[S.successBox, isDark && S.successBoxDark]}>
            <View style={S.successIconCircle}>
              <Ionicons name="checkmark" size={30} color="#FFFFFF" />
            </View>
            <Text style={[S.successTitle, isDark && S.textLight]}>Order Placed Successfully! 🎉</Text>
            <Text style={S.successSub}>
              Your live delivery tracking is ready. Redirecting to your Orders page...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ───
const S = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLight: {
    backgroundColor: BRAND_THEME.BG_CREAM, // Warm champagne background
  },
  rootDark: {
    backgroundColor: BRAND_THEME.BG_DARK, // Obsidian Black
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderBottomColor: BRAND_THEME.BORDER_DARK,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnDark: {
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
  },
  textLight: {
    color: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // CARD DESIGN
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: BRAND_THEME.BORDER_LIGHT,
  },
  cardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
  },
  changeLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
  },
  addressBox: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
  },
  addressBoxDark: {
    backgroundColor: '#090D16',
  },
  addressName: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
  },
  addressStreet: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
  },
  sectionCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  // ITEM CARDS
  itemCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: BRAND_THEME.BORDER_LIGHT,
  },
  itemCardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  itemImg: {
    width: 68,
    height: 68,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
    flex: 1,
    marginRight: 8,
    lineHeight: 15,
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
  },

  // STEPPER BOX
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBoxDark: {
    backgroundColor: '#090D16',
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  stepperBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperVal: {
    fontSize: 12,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  // PAYMENT METHODS
  paymentOptionsColumn: {
    gap: 8,
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  methodPillLight: {
    backgroundColor: '#FAF7F2',
    borderColor: '#E2E8F0',
  },
  methodPillDark: {
    backgroundColor: '#090D16',
    borderColor: '#1E293B',
  },
  methodPillSelected: {
    borderColor: BRAND_THEME.PRIMARY,
    borderWidth: 1.5,
    backgroundColor: '#EBF5EE',
  },
  methodPillSelectedDark: {
    borderColor: BRAND_THEME.SECONDARY,
    backgroundColor: 'rgba(47, 110, 73, 0.15)',
  },
  methodPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotSelected: {
    borderColor: BRAND_THEME.PRIMARY,
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_THEME.PRIMARY,
  },
  methodPillLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
  },

  // COUPON
  couponRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1A1A18',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  couponInputDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
    color: '#F8FAFC',
  },
  applyBtn: {
    backgroundColor: BRAND_THEME.PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: BRAND_THEME.SECONDARY,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  couponSuccessText: {
    fontSize: 11,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
    marginTop: 6,
  },

  // BILL SUMMARY
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  billVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A18',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  billDividerDark: {
    backgroundColor: BRAND_THEME.BORDER_DARK,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A18',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: BRAND_THEME.PRIMARY,
  },

  // BOTTOM STICKY BAR
  bottomBar: {
    backgroundColor: 'rgba(250, 247, 242, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBarDark: {
    backgroundColor: 'rgba(9, 13, 22, 0.95)',
    borderTopColor: BRAND_THEME.BORDER_DARK,
  },
  payCtaBtn: {
    backgroundColor: '#1A1A18',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  payCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // SUCCESS OVERLAY
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 20,
  },
  successBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: width * 0.85,
    elevation: 20,
  },
  successBoxDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
  },
  successIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_THEME.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  // PHYSICAL ADDRESS MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
  },
  modalCardDark: {
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 5,
  },
  fieldLabelDark: {
    color: '#CBD5E1',
  },
  formInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  formInputDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    color: '#F8FAFC',
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeChipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  typeChipActive: {
    backgroundColor: '#2F6E49',
    borderColor: '#2F6E49',
  },
  typeChipTxt: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  typeChipActiveTxt: {
    color: '#FFFFFF',
  },
  saveAddressBtn: {
    backgroundColor: '#2F6E49',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#2F6E49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveAddressBtnTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
