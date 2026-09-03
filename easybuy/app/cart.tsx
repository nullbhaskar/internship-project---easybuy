import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../services/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { FloatLoop, StaggerIn } from '../components/ui/motion';

const { width: W } = Dimensions.get('window');

// ─── Premium warm neutral colour tokens ────────────────────────
const C = {
  bg:         '#F0EDE6',   // warm parchment – background
  card:       '#E8E4DC',   // slightly darker card surface
  border:     '#D5D0C6',   // divider
  ink:        '#1A1A18',   // near-black text
  muted:      '#7A7668',   // muted label
  accent:     '#4A5240',   // olive-green accent
  accentBg:   '#DDE3D5',   // light olive chip bg
  red:        '#A0281C',   // danger / red status
  redBg:      '#F5DDD9',
  green:      '#2A5C3A',   // DELIVERED green
  greenBg:    '#D6EAD9',
  amber:      '#7A5B18',
  amberBg:    '#F5E8C8',
  white:      '#FFFFFF',
  shadow:     '#1A1A18',
};

export default function CartScreen() {
  const router = useRouter();
  const { isGuest, isAuthenticated, user, requireAuth } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, totalAmount, totalItems } = useCart();

  React.useEffect(() => {
    if (isGuest || !isAuthenticated) {
      requireAuth('proceed to checkout');
      router.replace('/home');
    }
  }, [isGuest, isAuthenticated]);

  const [ordered, setOrdered] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
    ]).start();
  };

  const handlePlaceOrder = async () => {
    if (!requireAuth('place an order')) {
      return;
    }
    if (cartItems.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    pulse();
    setOrdering(true);

    try {
      const ref = doc(collection(db, 'orders'));
      const orderId = `#EB-${Math.floor(100000 + Math.random() * 900000)}`;
      const activeUser = user || auth.currentUser;
      const orderData = {
        id: ref.id,
        orderId,
        userEmail: activeUser?.email || 'guest@easybuy.com',
        userId: activeUser?.uid || 'guest',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        itemCount: totalItems,
        totalAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
        status: 'Processing',
        products: cartItems.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, image: i.image })),
      };
      await setDoc(ref, orderData);
    } catch (_) {}

    setTimeout(() => {
      clearCart();
      setOrdering(false);
      setOrdered(true);
      setTimeout(() => setOrdered(false), 4000);
    }, 1400);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out my EasyBuy cart! ${totalItems} items totalling ₹${totalAmount.toLocaleString('en-IN')}` });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={S.root} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* ══ HEADER ════════════════════════════════════════ */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={C.ink} />
        </TouchableOpacity>

        <View style={S.headerTitleContainer}>
          <Text style={S.headerTitle}>Checkout</Text>
        </View>

        <TouchableOpacity onPress={handleShare} style={S.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color={C.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>

        {/* ══ SECTION HEADER ════════════════════════════════ */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Your Cart</Text>
          <Text style={S.sectionCount}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</Text>
        </View>

        {/* ── Cart Items List ── */}
        {cartItems.length === 0 ? (
          <View style={S.emptyBox}>
            <FloatLoop distance={9} rotate>
              <Ionicons name="bag-handle-outline" size={44} color={C.muted} style={{ marginBottom: 12 }} />
            </FloatLoop>
            <Text style={S.emptyTitle}>Your cart is empty</Text>
            <Text style={S.emptySub}>Discover our curated collections and fill your cart.</Text>
            <TouchableOpacity style={S.exploreBtn} onPress={() => router.push('/home')} activeOpacity={0.85}>
              <Text style={S.exploreBtnTxt}>START SHOPPING</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={S.itemsList}>
            {cartItems.map((item, itemIdx) => (
              <StaggerIn key={item.id} index={Math.min(itemIdx, 8)} distance={22}>
                <View style={S.itemCard}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={S.itemImg} resizeMode="cover" />
                ) : (
                  <View style={[S.itemImg, { backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="cube-outline" size={24} color={C.muted} />
                  </View>
                )}

                <View style={S.itemDetails}>
                  <View style={S.itemHeaderRow}>
                    <Text style={S.itemTitle} numberOfLines={2}>{(item.title || item.name || 'Unknown Item').toUpperCase()}</Text>
                    <TouchableOpacity
                      style={S.removeBtn}
                      onPress={() => { removeFromCart(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={C.muted} />
                    </TouchableOpacity>
                  </View>

                  <View style={S.itemFooterRow}>
                    <Text style={S.itemPrice}>
                      {typeof item.price === 'number' ? `₹${item.price}` : (String(item.price || '').startsWith('₹') ? item.price : `₹${item.price}`)}
                    </Text>

                    {/* Quantity Stepper */}
                    <View style={S.stepperBox}>
                      <TouchableOpacity
                        style={S.stepperBtn}
                        onPress={() => { updateQuantity(item.id, -1); Haptics.selectionAsync().catch(() => {}); }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={14} color={C.ink} />
                      </TouchableOpacity>
                      <Text style={S.stepperVal}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={S.stepperBtn}
                        onPress={() => { updateQuantity(item.id, 1); Haptics.selectionAsync().catch(() => {}); }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={14} color={C.ink} />
                      </TouchableOpacity>
                    </View>
                    </View>
                  </View>
                </View>
              </StaggerIn>
            ))}
          </View>
        )}

        {/* ── Price Summary ── */}
        {cartItems.length > 0 && (
          <View style={S.summaryCard}>
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>Subtotal</Text>
              <Text style={S.summaryVal}>₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>Logistics / Delivery</Text>
              <Text style={[S.summaryVal, deliveryFee === 0 && { color: C.green, fontWeight: '700' }]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </Text>
            </View>
            <View style={[S.summaryRow, S.summaryTotalRow]}>
              <Text style={S.summaryTotalLabel}>Total Amount</Text>
              <Text style={S.summaryTotalVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* ══ STICKY PLACE ORDER BUTTON ══════════════════════ */}
      {cartItems.length > 0 && (
        <View style={S.actionMenuBar}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }], flex: 1 }}>
            <TouchableOpacity
              style={S.actionBtn}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push('/checkout');
              }}
              activeOpacity={0.88}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={C.white} style={{ marginRight: 8 }} />
              <Text style={S.actionBtnTxt}>
                {`PROCEED TO CHECKOUT  •  ₹${totalAmount.toLocaleString('en-IN')}`}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    zIndex: 10,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  scrollContent: {
    paddingBottom: 110,
    paddingTop: 8,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.ink,
    letterSpacing: -0.5,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },

  // Cart Items List
  itemsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  itemCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImg: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: C.card,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 4,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  removeBtn: {
    padding: 2,
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: C.ink,
  },

  // Quantity Stepper
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperVal: {
    fontSize: 14,
    fontWeight: '700',
    color: C.ink,
    paddingHorizontal: 12,
    minWidth: 32,
    textAlign: 'center',
  },

  // Summary Card
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: C.muted,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '600',
    color: C.ink,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 8,
    paddingTop: 12,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  summaryTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: C.ink,
  },

  // Empty State
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: C.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: C.ink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnTxt: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: C.white,
  },

  // Action Menu Sticky Bar (PLACE ORDER)
  actionMenuBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 14,
    backgroundColor: 'rgba(240,237,230,0.97)',
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  actionBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: C.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  actionBtnTxt: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    color: C.white,
  },
});
