import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { useEasyBuyTheme } from '../../constants/ThemeContext';
import { EmptyStateView } from '../EmptyStateView';
import { useAuth } from '../../context/AuthContext';

import { auth, db } from '../../services/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const { height, width } = Dimensions.get('window');

export const CartDrawerModal: React.FC = () => {
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const { requireAuth } = useAuth();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    totalAmount,
    totalItems,
  } = useCart();

  const [checkoutModal, setCheckoutModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCheckout = () => {
    if (!requireAuth('proceed to checkout')) {
      closeCart();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    closeCart();
    router.push('/cart' as any);
  };

  const handlePay = async () => {
    if (!requireAuth('place an order')) {
      closeCart();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setOrderSuccess(true);

    try {
      const newOrderRef = doc(collection(db, 'orders'));
      const orderId = `#EB-${Math.floor(100000 + Math.random() * 900000)}`;
      const currentUser = auth.currentUser;
      
      const orderData = {
        id: newOrderRef.id,
        orderId,
        userEmail: currentUser?.email || 'guest@easybuy.com',
        userName: currentUser?.displayName || 'Customer',
        userId: currentUser?.uid || 'guest',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        itemCount: totalItems,
        totalAmount: `₹${totalAmount.toLocaleString('en-IN')}`,
        paymentMethod: 'Online',
        status: 'Processing',
        currentStepIndex: 0,
        products: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
        })),
      };

      await setDoc(newOrderRef, orderData);
    } catch (e) {
      console.error('Error saving order to Firestore:', e);
    }

    setTimeout(() => {
      setOrderSuccess(false);
      setCheckoutModal(false);
      clearCart();
      closeCart();
    }, 2500);
  };

  return (
    <Modal
      visible={isCartOpen}
      animationType="slide"
      transparent
      onRequestClose={closeCart}
    >
      <View style={styles.backdropOverlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={closeCart} activeOpacity={1} />

        <View style={[styles.drawerSheetCard, isDarkMode && styles.drawerSheetCardDark]}>
          {/* Handle bar */}
          <View style={[styles.handleBar, isDarkMode && { backgroundColor: '#334155' }]} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cart" size={22} color={isDarkMode ? '#C084FC' : '#2F6E49'} />
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Your Cart
              </Text>
              {totalItems > 0 && (
                <View style={[styles.itemCountBadge, isDarkMode && { backgroundColor: '#7C3AED' }]}>
                  <Text style={styles.itemCountTxt}>{totalItems}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.closeCircleBtn, isDarkMode && { backgroundColor: '#1E293B' }]}
              onPress={closeCart}
            >
              <Ionicons name="close" size={18} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          </View>

          {/* Free Shipping Progress Indicator */}
          {subtotal > 0 && (
            <View style={[styles.shippingPillCard, isDarkMode && { backgroundColor: '#1E1438', borderColor: 'rgba(192, 132, 252, 0.3)' }]}>
              <Ionicons name="bus" size={16} color={subtotal > 499 ? '#22C55E' : '#C084FC'} />
              <Text style={[styles.shippingPillTxt, isDarkMode && { color: '#F8FAFC' }]}>
                {subtotal > 499
                  ? '🎉 You unlocked FREE Express Delivery!'
                  : `Add ₹${(500 - subtotal).toLocaleString('en-IN')} more for FREE Delivery`}
              </Text>
            </View>
          )}

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <EmptyStateView
              isDark={isDarkMode}
              iconName="bag-handle-outline"
              title="Your cart is empty"
              subtitle="Discover trending items and add them to your cart!"
              actionText="Start Shopping →"
              onAction={closeCart}
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginVertical: 10 }}>
              {cartItems.map((item) => (
                <View key={item.id} style={[styles.cartItemRow, isDarkMode && styles.cartItemRowDark]}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                    onPress={() => {
                      closeCart();
                      router.push({
                        pathname: '/product/[id]',
                        params: {
                          id: item.id,
                          title: item.title,
                          price: item.price,
                          originalPrice: item.originalPrice,
                          image: item.image,
                        },
                      } as any);
                    }}
                    activeOpacity={0.85}
                  >
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemThumbImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.placeholderThumb}>
                        <Ionicons name="cube-outline" size={24} color="#94A3B8" />
                      </View>
                    )}

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Text style={[styles.itemTitleTxt, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      {item.selectedVariant && (
                        <Text style={styles.itemVariantTxt}>{item.selectedVariant}</Text>
                      )}
                      <Text style={[styles.itemPriceTxt, isDarkMode && { color: '#C084FC' }]}>
                        {item.price}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Quantity Stepper [- count +] */}
                  <View style={[styles.qtyStepperBox, isDarkMode && { backgroundColor: '#1E293B' }]}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={14} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyTxt, isDarkMode && { color: '#F8FAFC' }]}>
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={14} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
                    </TouchableOpacity>
                  </View>

                  {/* Trash Remove Button */}
                  <TouchableOpacity style={{ padding: 4 }} onPress={() => removeFromCart(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Footer Checkout Bar */}
          {cartItems.length > 0 && (
            <View style={[styles.footerBar, isDarkMode && styles.footerBarDark]}>
              <View style={styles.priceBreakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={[styles.breakdownVal, isDarkMode && { color: '#F8FAFC' }]}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.priceBreakdownRow}>
                <Text style={styles.breakdownLabel}>Delivery Fee</Text>
                <Text style={deliveryFee === 0 ? styles.freeDeliveryTxt : [styles.breakdownVal, isDarkMode && { color: '#F8FAFC' }]}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </Text>
              </View>

              <View style={[styles.priceBreakdownRow, { marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
                <Text style={[styles.totalLabelTxt, isDarkMode && { color: '#F8FAFC' }]}>Total Amount</Text>
                <Text style={styles.totalPriceTxt}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>

              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.88}>
                <Ionicons name="flash" size={18} color="#FFFFFF" />
                <Text style={styles.checkoutBtnTxt}>Proceed to Checkout • ₹{totalAmount.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Express Checkout Modal */}
      <Modal visible={checkoutModal} animationType="fade" transparent onRequestClose={() => setCheckoutModal(false)}>
        <View style={styles.backdropOverlay}>
          <View style={[styles.checkoutModalCard, isDarkMode && { backgroundColor: '#111827', borderColor: '#1F2937' }]}>
            {orderSuccess ? (
              <View style={{ alignItems: 'center', paddingVertical: 20, gap: 12 }}>
                <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
                <Text style={[styles.checkoutTitle, isDarkMode && { color: '#F8FAFC' }]}>Order Confirmed! 🎉</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>Your order has been placed successfully and will be delivered shortly.</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.checkoutTitle, isDarkMode && { color: '#F8FAFC' }]}>Express Checkout ⚡</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8' }}>{totalItems} items in your cart</Text>

                <View style={{ marginVertical: 10, padding: 12, backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderRadius: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>Total Amount: ₹{totalAmount.toLocaleString('en-IN')}</Text>
                  <Text style={{ fontSize: 10, color: '#22C55E', fontWeight: '700', marginTop: 2 }}>{deliveryFee === 0 ? 'FREE Express Shipping' : 'Standard Delivery'}</Text>
                </View>

                <TouchableOpacity style={styles.payUpiBtn} onPress={handlePay} activeOpacity={0.88}>
                  <Text style={styles.payUpiTxt}>Pay via UPI →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 6 }} onPress={() => setCheckoutModal(false)}>
                  <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 10, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  drawerSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
    maxHeight: height * 0.82,
    minHeight: height * 0.5,
  },
  drawerSheetCardDark: {
    backgroundColor: '#0B0F19',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  itemCountBadge: {
    backgroundColor: '#2F6E49',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  itemCountTxt: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shippingPillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  shippingPillTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  exploreBtn: {
    marginTop: 10,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  exploreBtnTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 18,
    marginBottom: 10,
    gap: 10,
  },
  cartItemRowDark: {
    backgroundColor: '#111827',
  },
  itemThumbImg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  placeholderThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleTxt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemVariantTxt: {
    fontSize: 10,
    color: '#94A3B8',
  },
  itemPriceTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2F6E49',
  },
  qtyStepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyTxt: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  footerBar: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 4,
  },
  footerBarDark: {
    borderTopColor: '#1F2937',
  },
  priceBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  freeDeliveryTxt: {
    fontSize: 11,
    fontWeight: '900',
    color: '#22C55E',
  },
  totalLabelTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalPriceTxt: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7C3AED',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  checkoutBtnTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  checkoutModalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: height * 0.25,
    borderRadius: 24,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  payUpiBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  payUpiTxt: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
