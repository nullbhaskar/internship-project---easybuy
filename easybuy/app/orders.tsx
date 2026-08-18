import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, doc, deleteDoc, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Linking,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';

const { width, height } = Dimensions.get('window');

type OrderStatus = string;

interface OrderItemProduct {
  id: string;
  title: string;
  image: string;
  price?: string;
  quantity?: number;
}

interface OrderRecord {
  id: string;
  orderId: string;
  date: string;
  itemCount: number;
  totalAmount: string;
  paymentMethod: 'Online' | 'COD';
  status: OrderStatus;
  deliveredDate?: string;
  products: OrderItemProduct[];
  currentStepIndex: number;
}

// ─── BRAND DESIGN TOKENS (Shared with Home Screen) ───
const BRAND_THEME = {
  PRIMARY: '#2F6E49', // Deep Green
  SECONDARY: '#89B882', // Mint Accent
  ACCENT: '#F6CC63', // Warm Amber Gold
  BG_CREAM: '#FAF7F2', // Warm Champagne Ivory Ambient Background
  BG_DARK: '#090D16', // Pitch obsidian black
  CARD_WHITE: '#FFFFFF',
  CARD_DARK: '#121927', // Card background dark
  BORDER_DARK: '#1F293D', // Muted dark border
  TEXT_DARK: '#0F172A',
  TEXT_MUTED: '#64748B',
  CORAL: '#FF6B6B',
};

const STEPS_LIST = [
  { label: 'Order Placed', icon: 'document-text-outline', desc: 'We have received your order.' },
  { label: 'Confirmed', icon: 'shield-checkmark-outline', desc: 'Merchant verified and confirmed the order.' },
  { label: 'Packed', icon: 'cube-outline', desc: 'Item packed securely at regional facility.' },
  { label: 'Shipped', icon: 'bus-outline', desc: 'Dispatched via our delivery fleet.' },
  { label: 'Delivered', icon: 'home-outline', desc: 'Delivered to your doorstep.' },
];

const FAQS_LIST = [
  { q: 'How can I get refund for a cancelled item?', a: 'Refunds are automatically processed to your original payment method or EasyBuy Wallet within 1-2 business days.' },
  { q: 'Where can I see live delivery partner location?', a: 'Once the order status is "Shipped", you can view the contact information above to call the delivery partner directly for coordinate tracking.' },
  { q: 'Can I change my delivery address after placing?', a: 'You can update address details until the status reaches "Packed" by calling support immediately.' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const isDark = isDarkMode;
  const { isGuest, isAuthenticated, user, requireAuth } = useAuth();

  useEffect(() => {
    if (isGuest || !isAuthenticated) {
      requireAuth('view your orders');
      router.replace('/home');
    }
  }, [isGuest, isAuthenticated]);

  const [activeTab, setActiveTab] = useState<string>('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderRecord | null>(null);

  // Ratings & Review states inside the detail modal
  const [productRatings, setProductRatings] = useState<Record<string, number>>({});
  const [productComments, setProductComments] = useState<Record<string, string>>({});
  const [submittedReviews, setSubmittedReviews] = useState<Record<string, boolean>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);

  // FAQ Accordion states
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Real-time Firestore Order Listener
  useEffect(() => {
    if (!isAuthenticated || isGuest) return;
    setLoading(true);
    const activeUser = user || auth.currentUser;
    const activeEmail = activeUser?.email;
    const collRef = collection(db, 'orders');

    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        const fetched: OrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let stepIndex = data.currentStepIndex ?? 0;
          if (data.status === 'Processing') stepIndex = 0;
          if (data.status === 'Confirmed') stepIndex = 1;
          if (data.status === 'Packed') stepIndex = 2;
          if (data.status === 'Shipped') stepIndex = 3;
          if (data.status === 'Delivered') stepIndex = 4;

          const matchUser = activeEmail && data.userEmail && data.userEmail.toLowerCase() === activeEmail.toLowerCase();
          const isAdmin = activeEmail === 'admineasybuy@gmail.com';

          if (matchUser || isAdmin || !data.userEmail) {
            fetched.push({
              id: docSnap.id,
              orderId: data.orderId || `#EB-${docSnap.id.substring(0, 6).toUpperCase()}`,
              date: data.date || data.createdAt || 'Recent',
              itemCount: data.itemCount || (data.products ? data.products.length : 1),
              totalAmount: data.totalAmount || '₹0.00',
              paymentMethod: data.paymentMethod || 'Online',
              status: data.status || 'Processing',
              deliveredDate: data.deliveredDate,
              products: data.products || [],
              currentStepIndex: stepIndex,
            });
          }
        });

        // Sort newest first
        fetched.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(fetched);
        setLoading(false);
      },
      (err) => {
        console.warn('Firestore orders listener:', err);
        setOrders([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Dynamic Metrics
  const totalCount = orders.length;
  const processingCount = orders.filter((o) => o.status === 'Processing' || o.status === 'Order Placed' || o.status === 'Confirmed' || o.status === 'Packed').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped' || o.status === 'Out for Delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Delete Order Handler
  const handleDeleteOrder = async (orderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (e) {
      console.error('Error deleting order:', e);
    }
  };

  // Cancel Order Handler
  const handleCancelOrder = (orderToCancel: any) => {
    if (!orderToCancel) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    const performCancellation = async () => {
      try {
        if (orderToCancel.id) {
          await updateDoc(doc(db, 'orders', orderToCancel.id), {
            status: 'Cancelled',
            cancelledAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.log('Firestore cancellation update error:', e);
      }

      // Update local state so UI instantly reflects cancellation
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel.id || o.orderId === orderToCancel.orderId
            ? { ...o, status: 'Cancelled' }
            : o
        )
      );

      // Update modal state if open
      setSelectedOrderForModal((prev: any) =>
        prev ? { ...prev, status: 'Cancelled' } : null
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      if (Platform.OS === 'web') {
        window.alert('Your order has been cancelled successfully.');
      } else {
        Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmOk = window.confirm(`Are you sure you want to cancel Order ${orderToCancel.orderId || ''}?`);
      if (confirmOk) {
        performCancellation();
      }
    } else {
      Alert.alert(
        'Cancel Order',
        `Are you sure you want to cancel Order ${orderToCancel.orderId || ''}?`,
        [
          { text: 'Keep Order', style: 'cancel' },
          {
            text: 'Yes, Cancel Order',
            style: 'destructive',
            onPress: performCancellation,
          },
        ]
      );
    }
  };

  // Submit Rating & Reviews to Firestore
  const handleSubmitReview = async (productId: string, itemTitle: string) => {
    const rating = productRatings[productId] || 5;
    const comment = productComments[productId] || '';
    const activeUser: any = user || auth.currentUser;
    const reviewer = activeUser?.fullName || activeUser?.displayName || activeUser?.email?.split('@')[0] || 'EasyBuy Customer';

    setSubmittingReviewId(productId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    try {
      // 1. Add review under sub-collection products/{productId}/reviews
      const reviewsColl = collection(db, 'products', productId, 'reviews');
      await addDoc(reviewsColl, {
        rating,
        comment,
        reviewerName: reviewer,
        createdAt: new Date().toISOString(),
      });

      // 2. Update average rating and reviewsCount in the main product doc
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const prodData = productSnap.data();
        const currentCount = Number(prodData.reviewsCount || prodData.reviewCount || 0);
        const currentRating = Number(prodData.rating || 0);

        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;

        await updateDoc(productRef, {
          rating: Number(newRating.toFixed(1)),
          reviewsCount: newCount,
          reviewCount: newCount,
        });
      }

      setSubmittedReviews((prev) => ({ ...prev, [productId]: true }));
    } catch (e) {
      console.warn('Error saving review to Firestore:', e);
      // Save local fallback status
      setSubmittedReviews((prev) => ({ ...prev, [productId]: true }));
    } finally {
      setSubmittingReviewId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesTab =
      activeTab === 'All Orders' ||
      (activeTab === 'Processing' && (ord.status === 'Processing' || ord.status === 'Order Placed' || ord.status === 'Confirmed' || ord.status === 'Packed')) ||
      (activeTab === 'Shipped' && (ord.status === 'Shipped' || ord.status === 'Out for Delivery')) ||
      (activeTab === 'Delivered' && ord.status === 'Delivered') ||
      (activeTab === 'Cancelled' && ord.status === 'Cancelled');

    const matchesSearch =
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.products && ord.products.some((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={[S.root, isDark ? S.rootDark : S.rootLight]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ══ HEADER ════════════════════════════════════════ */}
      <View style={[S.header, isDark && S.headerDark]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[S.headerTitle, isDark && S.textLight]}>My Orders</Text>
            <Text style={{ fontSize: 18 }}>📦</Text>
          </View>
          <Text style={[S.headerSubTitle, isDark && { color: '#94A3B8' }]}>
            Track, manage and reorder seamlessly
          </Text>
        </View>

        <TouchableOpacity
          style={[S.actionCircleBtn, isDark && S.actionCircleBtnDark]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setShowSearch(!showSearch);
          }}
          activeOpacity={0.75}
        >
          <Ionicons name={showSearch ? "close" : "search-outline"} size={18} color={isDark ? '#F8FAFC' : '#1E293B'} />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      {showSearch && (
        <View style={[S.searchContainer, isDark && S.searchContainerDark]}>
          <Ionicons name="search" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={[S.searchInput, isDark && S.textLight]}
            placeholder="Search by Order ID or item..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
        {/* ══ CATEGORY TABS (SLEEK PILLS WITH DOTS) ═════════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.tabsScrollContainer}
          style={{ marginBottom: 16 }}
        >
          {[
            { label: 'All Orders', dotColor: null },
            { label: 'Processing', dotColor: BRAND_THEME.ACCENT },
            { label: 'Shipped', dotColor: BRAND_THEME.PRIMARY },
            { label: 'Delivered', dotColor: BRAND_THEME.PRIMARY },
            { label: 'Cancelled', dotColor: BRAND_THEME.CORAL },
          ].map((tab) => {
            const isSelected = activeTab === tab.label;
            return (
              <TouchableOpacity
                key={tab.label}
                style={[
                  S.tabPill,
                  isDark ? S.tabPillDark : S.tabPillLight,
                  isSelected && (isDark ? S.tabPillSelectedDark : S.tabPillSelectedLight),
                ]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveTab(tab.label);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    S.tabPillText,
                    isDark ? S.textLight : { color: '#475569' },
                    isSelected && S.tabPillTextSelected,
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.dotColor && (
                  <View style={[S.tabDot, { backgroundColor: tab.dotColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ══ METRICS CARDS ROW ════════════════════════════ */}
        <View style={S.metricsGrid}>
          {/* Total Orders */}
          <View style={[S.metricCard, isDark ? S.metricCardDark : S.metricCardLight]}>
            <View style={[S.metricIconBox, { backgroundColor: isDark ? 'rgba(47, 110, 73, 0.15)' : '#EBF5EE' }]}>
              <Ionicons name="bag-handle-outline" size={14} color={BRAND_THEME.PRIMARY} />
            </View>
            <Text style={S.metricLabel}>Total</Text>
            <Text style={[S.metricValue, isDark && S.textLight]}>{totalCount}</Text>
          </View>

          {/* Processing */}
          <View style={[S.metricCard, isDark ? S.metricCardDark : S.metricCardLight]}>
            <View style={[S.metricIconBox, { backgroundColor: isDark ? 'rgba(246, 204, 99, 0.15)' : '#FEF3C7' }]}>
              <Ionicons name="time-outline" size={14} color={BRAND_THEME.ACCENT} />
            </View>
            <Text style={S.metricLabel}>Processing</Text>
            <Text style={[S.metricValue, isDark && S.textLight]}>{processingCount}</Text>
          </View>

          {/* Shipped */}
          <View style={[S.metricCard, isDark ? S.metricCardDark : S.metricCardLight]}>
            <View style={[S.metricIconBox, { backgroundColor: isDark ? 'rgba(47, 110, 73, 0.15)' : '#EBF5EE' }]}>
              <Ionicons name="bus-outline" size={14} color={BRAND_THEME.PRIMARY} />
            </View>
            <Text style={S.metricLabel}>Shipped</Text>
            <Text style={[S.metricValue, isDark && S.textLight]}>{shippedCount}</Text>
          </View>

          {/* Delivered */}
          <View style={[S.metricCard, isDark ? S.metricCardDark : S.metricCardLight]}>
            <View style={[S.metricIconBox, { backgroundColor: isDark ? 'rgba(47, 110, 73, 0.15)' : '#EBF5EE' }]}>
              <Ionicons name="checkmark-circle-outline" size={14} color={BRAND_THEME.PRIMARY} />
            </View>
            <Text style={S.metricLabel}>Delivered</Text>
            <Text style={[S.metricValue, isDark && S.textLight]}>{deliveredCount}</Text>
          </View>
        </View>

        {/* ══ ORDERS LIST ══════════════════════════════════ */}
        {filteredOrders.length === 0 ? (
          <View style={[S.emptyOrdersCard, isDark && S.emptyOrdersCardDark]}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>🛍️</Text>
            <Text style={[S.emptyOrdersTitle, isDark && S.textLight]}>
              No Orders Placed Yet
            </Text>
            <Text style={[S.emptyOrdersSub, isDark && { color: '#94A3B8' }]}>
              When you place an order, live status tracking and step progress will appear here!
            </Text>
            <TouchableOpacity
              style={S.shopNowBtn}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push('/home');
              }}
              activeOpacity={0.8}
            >
              <Text style={S.shopNowBtnText}>Start Shopping →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const isProcessing = order.status === 'Processing' || order.status === 'Order Placed' || order.status === 'Confirmed' || order.status === 'Packed';
            const isShipped = order.status === 'Shipped' || order.status === 'Out for Delivery';
            const isDelivered = order.status === 'Delivered';
            const isCancelled = order.status === 'Cancelled';

            let statusThemeColor = BRAND_THEME.PRIMARY;
            let statusBgColor = '#EBF5EE';
            if (isProcessing) {
              statusThemeColor = BRAND_THEME.ACCENT;
              statusBgColor = '#FEF3C7';
            } else if (isDelivered) {
              statusThemeColor = BRAND_THEME.PRIMARY;
              statusBgColor = '#EBF5EE';
            } else if (isCancelled) {
              statusThemeColor = BRAND_THEME.CORAL;
              statusBgColor = '#FEE2E2';
            }

            return (
              <View
                key={order.id}
                style={[S.orderCard, isDark ? S.orderCardDark : S.orderCardLight]}
              >
                {/* Header Info */}
                <View style={S.orderCardHeader}>
                  <View>
                    <Text style={[S.orderIdText, isDark && S.textLight]}>
                      Order {order.orderId}
                    </Text>
                    <Text style={S.orderDateText}>{order.date}</Text>
                  </View>

                  <View style={S.orderCardHeaderRight}>
                    {!isCancelled ? (
                      <View style={[S.statusPill, { backgroundColor: statusBgColor }]}>
                        <View style={[S.statusDot, { backgroundColor: statusThemeColor }]} />
                        <Text style={[S.statusText, { color: statusThemeColor }]}>
                          {order.status}
                        </Text>
                      </View>
                    ) : (
                      <Text style={S.cancelledText}>Cancelled</Text>
                    )}

                    {/* Delete Icon */}
                    <TouchableOpacity
                      style={S.deleteOrderBtn}
                      onPress={() => handleDeleteOrder(order.id)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={14} color={BRAND_THEME.CORAL} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Inner product details box */}
                <TouchableOpacity
                  style={[S.productBlock, isDark && S.productBlockDark]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedOrderForModal(order);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={S.imagesStackContainer}>
                    {order.products[0]?.image ? (
                      <Image source={{ uri: order.products[0].image }} style={S.productImageMain} />
                    ) : (
                      <View style={[S.productImageMain, { backgroundColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="cube-outline" size={20} color="#94A3B8" />
                      </View>
                    )}
                    {order.itemCount > 1 && (
                      <View style={S.moreBadge}>
                        <Text style={S.moreBadgeText}>+{order.itemCount - 1}</Text>
                      </View>
                    )}
                  </View>

                  <View style={S.productDetailsCol}>
                    <Text style={[S.itemCountText, isDark && S.textLight]} numberOfLines={1}>
                      {order.products[0]?.title || `${order.itemCount} Items`}
                    </Text>
                    <Text style={[S.totalAmountText, isDark && S.textLight]}>
                      {order.totalAmount}
                    </Text>
                    <View style={S.paymentTagRow}>
                      <Ionicons
                        name={order.paymentMethod === 'Online' ? 'card-outline' : 'cash-outline'}
                        size={12}
                        color="#64748B"
                      />
                      <Text style={S.paymentTagText} numberOfLines={1}>
                        Payment: {order.paymentMethod === 'Online' ? 'UPI / Online' : 'Cash on Delivery (COD)'}
                      </Text>
                    </View>
                  </View>

                  {/* Circular Chevron Button */}
                  <View style={[S.arrowCircleBtn, isDark && S.arrowCircleBtnDark]}>
                    <Ionicons name="chevron-forward" size={15} color="#64748B" />
                  </View>
                </TouchableOpacity>

                {/* Step Progress Tracker */}
                <View style={[S.progressTrackContainer, isDark && S.progressTrackContainerDark]}>
                  {STEPS_LIST.map((step, idx) => {
                    const isCompleted = !isCancelled && idx <= order.currentStepIndex;
                    const isFirstNode = idx === 0;

                    const nodeActive = isCancelled ? isFirstNode : isCompleted;
                    const nodeColor = isCancelled ? BRAND_THEME.CORAL : BRAND_THEME.PRIMARY;

                    return (
                      <React.Fragment key={idx}>
                        <View style={S.trackStepNode}>
                          <View
                            style={[
                              S.nodeCircle,
                              nodeActive && { backgroundColor: nodeColor, borderColor: 'transparent' },
                              isDark && !nodeActive && { backgroundColor: '#121927', borderColor: '#1F293D' },
                            ]}
                          >
                            <Ionicons
                              name={step.icon as any}
                              size={11}
                              color={nodeActive ? '#FFFFFF' : '#64748B'}
                            />
                          </View>
                          <Text
                            style={[
                              S.nodeStepLabel,
                              nodeActive && { color: isDark ? '#F8FAFC' : BRAND_THEME.TEXT_DARK, fontWeight: '800' },
                            ]}
                            numberOfLines={1}
                          >
                            {step.label}
                          </Text>
                        </View>

                        {idx < STEPS_LIST.length - 1 && (
                          <View
                            style={[
                              S.trackConnectingLine,
                              (!isCancelled && idx < order.currentStepIndex) && { backgroundColor: nodeColor },
                              isDark && (!isCancelled && idx >= order.currentStepIndex) && { backgroundColor: '#1F293D' },
                            ]}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </View>

                {/* Delivered on banner */}
                {isDelivered && (
                  <View style={S.deliveredBanner}>
                    <View style={S.deliveredBannerLeft}>
                      <Ionicons name="checkmark-circle" size={15} color={BRAND_THEME.PRIMARY} />
                      <Text style={S.deliveredBannerText}>
                        Delivered on {order.deliveredDate || 'May 14, 2025'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={S.rateBtn}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setSelectedOrderForModal(order);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={S.rateBtnText}>Rate & Review</Text>
                      <Ionicons name="chevron-forward" size={12} color={BRAND_THEME.PRIMARY} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* ══ NEED HELP BANNER (Inspired by Kit Card design) ═════════════════════════════ */}
        <View style={[S.helpBanner, isDark && S.helpBannerDark]}>
          <View style={S.helpBannerLeft}>
            <View style={S.helpIconCircle}>
              <Text style={{ fontSize: 20 }}>🎧</Text>
            </View>
            <View style={S.helpTextContainer}>
              <Text style={[S.helpTitle, isDark && { color: '#89B882' }]}>Need help with an order?</Text>
              <Text style={[S.helpSubtitle, isDark && { color: '#94A3B8' }]}>Support team is available 24/7</Text>
            </View>
          </View>
          <TouchableOpacity
            style={S.supportBtn}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              Linking.openURL('tel:+919876543210').catch(() => {});
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={12} color={BRAND_THEME.PRIMARY} />
            <Text style={S.supportBtnText}>Support</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ══ DETAILS MODAL SHEET ══════════════════════════ */}
      <Modal
        visible={!!selectedOrderForModal}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedOrderForModal(null)}
      >
        <View style={S.modalBackdrop}>
          <TouchableOpacity
            style={S.modalDismissArea}
            onPress={() => setSelectedOrderForModal(null)}
            activeOpacity={1}
          />

          <View style={[S.modalSheet, isDark && S.modalSheetDark]}>
            <View style={[S.modalHandle, isDark && { backgroundColor: '#1F293D' }]} />

            <View style={S.modalHeaderRow}>
              <View>
                <Text style={[S.modalTitle, isDark && S.textLight]}>
                  Order Details
                </Text>
                <Text style={S.modalSubTitle}>
                  {selectedOrderForModal?.orderId} • {selectedOrderForModal?.date}
                </Text>
              </View>

              <TouchableOpacity
                style={[S.closeModalBtn, isDark && S.closeModalBtnDark]}
                onPress={() => setSelectedOrderForModal(null)}
              >
                <Ionicons name="close" size={18} color={isDark ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.72 }}>
              
              {/* Dynamic Status Tag */}
              <View style={[S.modalStatusBanner, isDark && S.modalStatusBannerDark]}>
                <Ionicons name="information-circle-outline" size={16} color={BRAND_THEME.PRIMARY} />
                <Text style={[S.modalStatusText, isDark && S.textLight]}>
                  Status: <Text style={{ color: BRAND_THEME.PRIMARY, fontWeight: '900' }}>{selectedOrderForModal?.status}</Text>
                </Text>
              </View>

              {/* ── VERTICAL ORDER TRACKING TIMELINE ── */}
              <Text style={[S.modalSectionTitle, isDark && S.textLight]}>Order Tracking Timeline</Text>
              <View style={[S.timelineCard, isDark && S.timelineCardDark]}>
                {STEPS_LIST.map((step, idx) => {
                  const isCompleted = selectedOrderForModal?.status !== 'Cancelled' && idx <= (selectedOrderForModal?.currentStepIndex || 0);
                  const isFirst = idx === 0;
                  const isLast = idx === STEPS_LIST.length - 1;
                  const isActiveNode = selectedOrderForModal?.status === 'Cancelled' ? isFirst : isCompleted;
                  const nodeColor = selectedOrderForModal?.status === 'Cancelled' ? BRAND_THEME.CORAL : BRAND_THEME.PRIMARY;

                  return (
                    <View key={idx} style={S.timelineRow}>
                      <View style={S.timelineLeftCol}>
                        <View style={[S.timelineNode, isActiveNode && { backgroundColor: nodeColor, borderColor: 'transparent' }]}>
                          <Ionicons name={step.icon as any} size={11} color={isActiveNode ? '#FFFFFF' : '#64748B'} />
                        </View>
                        {!isLast && (
                          <View style={[S.timelineLine, isActiveNode && idx < (selectedOrderForModal?.currentStepIndex || 0) && { backgroundColor: nodeColor }]} />
                        )}
                      </View>
                      <View style={S.timelineRightCol}>
                        <Text style={[S.timelineLabel, isActiveNode && { color: BRAND_THEME.PRIMARY, fontWeight: '800' }, isDark && S.textLight]}>
                          {step.label}
                        </Text>
                        <Text style={S.timelineDesc}>{step.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* ── CUSTOMER & DELIVERY ADDRESS DETAILS ── */}
              <Text style={[S.modalSectionTitle, isDark && S.textLight]}>Delivery Details</Text>
              <View style={[S.detailsInfoBox, isDark && S.detailsInfoBoxDark]}>
                <View style={S.infoRowItem}>
                  <Text style={S.infoRowLabel}>Recipient Owner:</Text>
                  <Text style={[S.infoRowVal, isDark && S.textLight]}>
                    {user?.fullName || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Bhaskar Das'}
                  </Text>
                </View>
                <View style={S.infoRowItem}>
                  <Text style={S.infoRowLabel}>Registered Email:</Text>
                  <Text style={[S.infoRowVal, isDark && S.textLight]}>
                    {user?.email || auth.currentUser?.email || 'bhaskar@example.com'}
                  </Text>
                </View>
                <View style={S.infoRowItem}>
                  <Text style={S.infoRowLabel}>Delivery Address:</Text>
                  <Text style={[S.infoRowVal, isDark && S.textLight, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                    Hostel 3, Room 402, IIT Patna, Bihta, Bihar - 801103
                  </Text>
                </View>
              </View>

              {/* ── DELIVERY PARTNER DETAILS ── */}
              {selectedOrderForModal?.status !== 'Cancelled' && (
                <>
                  <Text style={[S.modalSectionTitle, isDark && S.textLight]}>Delivery Partner Assignment</Text>
                  <View style={[S.partnerCard, isDark && S.partnerCardDark]}>
                    <View style={S.partnerLeft}>
                      <View style={S.partnerAvatarContainer}>
                        <Image
                          source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' }}
                          style={S.partnerAvatar}
                        />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[S.partnerName, isDark && S.textLight]}>Rohan Sharma</Text>
                        <Text style={S.partnerVeh}>Hero Splendor • BR-01-EE-1234</Text>
                        <Text style={S.partnerStatus}>
                          {selectedOrderForModal?.status === 'Delivered' ? '✓ Delivered your order' : '⚡ Dispatched & arriving soon'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={S.partnerCallBtn}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        Linking.openURL('tel:+919876543210').catch(() => {});
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* ── ITEMS IN ORDER & PRODUCT RATING ── */}
              <Text style={[S.modalSectionTitle, isDark && S.textLight]}>
                Items in Order ({selectedOrderForModal?.products?.length || selectedOrderForModal?.itemCount || 1})
              </Text>

              {(selectedOrderForModal?.products || []).map((item, idx) => {
                const isDeliveredStatus = selectedOrderForModal?.status === 'Delivered';
                const hasSubmitted = submittedReviews[item.id];
                const activeRating = productRatings[item.id] || 0;
                const activeComment = productComments[item.id] || '';

                return (
                  <View key={item.id || idx} style={[S.modalItemRowGroup, isDark && S.modalItemRowGroupDark]}>
                    <View style={[S.modalItemRow, isDark && S.modalItemRowDark, { borderBottomWidth: 0 }]}>
                      <Image source={{ uri: item.image }} style={S.modalItemThumb} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[S.modalItemTitle, isDark && S.textLight]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={S.modalItemQty}>Qty: {item.quantity || 1}</Text>
                      </View>
                      <Text style={[S.modalItemPrice, isDark && S.textLight]}>
                        {item.price || selectedOrderForModal?.totalAmount}
                      </Text>
                    </View>

                    {/* Interactive Product Rating Box (Visible if Delivered) */}
                    {isDeliveredStatus && (
                      <View style={[S.ratingBox, isDark && S.ratingBoxDark]}>
                        <View style={S.ratingDivider} />
                        
                        {hasSubmitted ? (
                          <View style={S.reviewSuccessRow}>
                            <Ionicons name="checkmark-circle" size={16} color={BRAND_THEME.PRIMARY} />
                            <Text style={S.reviewSuccessText}>Your review & rating submitted successfully!</Text>
                          </View>
                        ) : (
                          <View style={{ marginTop: 8 }}>
                            <Text style={S.ratingBoxTitle}>Enjoying this product? Rate it below:</Text>
                            
                            {/* Stars row */}
                            <View style={S.starsRow}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                  key={star}
                                  onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                                    setProductRatings((prev) => ({ ...prev, [item.id]: star }));
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons
                                    name={star <= activeRating ? "star" : "star-outline"}
                                    size={20}
                                    color={star <= activeRating ? BRAND_THEME.ACCENT : '#94A3B8'}
                                  />
                                </TouchableOpacity>
                              ))}
                              {activeRating > 0 && (
                                <Text style={S.starFeedbackLabel}>({activeRating} / 5 Stars)</Text>
                              )}
                            </View>

                            {/* Comment Input */}
                            <TextInput
                              style={[S.ratingTextInput, isDark && S.ratingTextInputDark]}
                              placeholder="Write a quick comment/review (optional)..."
                              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                              value={activeComment}
                              onChangeText={(txt) => setProductComments((prev) => ({ ...prev, [item.id]: txt }))}
                            />

                            {/* Submit review button */}
                            <TouchableOpacity
                              style={[S.submitReviewBtn, activeRating === 0 && { opacity: 0.6 }]}
                              disabled={activeRating === 0 || submittingReviewId === item.id}
                              onPress={() => handleSubmitReview(item.id, item.title)}
                              activeOpacity={0.8}
                            >
                              {submittingReviewId === item.id ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <Text style={S.submitReviewBtnTxt}>Submit Product Review</Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}

              {/* ── BILL BOX SUMMARY ── */}
              <View style={[S.billBox, isDark && S.billBoxDark]}>
                <Text style={[S.billTitle, isDark && S.textLight]}>Bill Summary</Text>

                <View style={S.billRow}>
                  <Text style={S.billLabel}>Payment Method</Text>
                  <Text style={[S.billValue, isDark && S.textLight]}>
                    {selectedOrderForModal?.paymentMethod || 'Online'}
                  </Text>
                </View>

                <View style={S.billRow}>
                  <Text style={S.billLabel}>Delivery Fee</Text>
                  <Text style={{ color: BRAND_THEME.PRIMARY, fontWeight: '800', fontSize: 12 }}>FREE Express</Text>
                </View>

                <View style={S.billDivider} />

                <View style={S.billRow}>
                  <Text style={[S.grandTotalLabel, isDark && S.textLight]}>Grand Total</Text>
                  <Text style={[S.grandTotalValue, isDark && S.textLight]}>
                    {selectedOrderForModal?.totalAmount}
                  </Text>
                </View>
              </View>

              {/* ── FAQ & HELP CARD (Inspired by Home Kit Banner) ── */}
              <View style={[S.kitCardSupport, isDark && S.kitCardSupportDark]}>
                <Text style={S.kitCardTitle}>Help & Support FAQ</Text>
                <Text style={S.kitCardSubtitle}>
                  Quick questions answered immediately, or contact our support team.
                </Text>

                <View style={S.faqContainer}>
                  {FAQS_LIST.map((faq, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <View key={idx} style={S.faqItem}>
                        <TouchableOpacity
                          style={S.faqHeader}
                          onPress={() => {
                            Haptics.selectionAsync().catch(() => {});
                            setExpandedFaq(isOpen ? null : idx);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={S.faqQuestion} numberOfLines={1}>{faq.q}</Text>
                          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={13} color={BRAND_THEME.PRIMARY} />
                        </TouchableOpacity>
                        {isOpen && (
                          <Text style={S.faqAnswer}>{faq.a}</Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={S.kitSupportBtn}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    Linking.openURL('tel:+919876543210').catch(() => {});
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubbles-outline" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={S.kitSupportBtnTxt}>Connect Live Support</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>

            <View style={S.modalFooterActions}>
              {selectedOrderForModal?.status === 'Cancelled' ? (
                <View style={S.modalCancelledPill}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                  <Text style={S.modalCancelledPillTxt}>This Order has been Cancelled</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={S.modalCancelBtn}
                  onPress={() => handleCancelOrder(selectedOrderForModal)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={S.modalCancelBtnText}>Cancel Order</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Navigation Dock */}
      <ExperimentalNavigation
        activeTab="orders"
        onTabChange={(tabId) => {
          if (tabId === 'home') router.push('/home');
          if (tabId === 'profile') router.push('/profile');
        }}
        isDarkMode={isDark}
      />
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const S = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLight: {
    backgroundColor: BRAND_THEME.BG_CREAM, // Matches home screen champagne warm ivory
  },
  rootDark: {
    backgroundColor: BRAND_THEME.BG_DARK, // Matches home screen obsidian dark
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF', // Header background white
  },
  headerDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  headerSubTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  textLight: {
    color: '#F8FAFC',
  },

  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionCircleBtnDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchContainerDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: BRAND_THEME.TEXT_DARK,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // Pills Tabs
  tabsScrollContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
    borderWidth: 1,
  },
  tabPillLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  tabPillDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  tabPillSelectedLight: {
    borderColor: BRAND_THEME.PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  tabPillSelectedDark: {
    borderColor: BRAND_THEME.SECONDARY,
    backgroundColor: 'rgba(47, 110, 73, 0.15)',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabPillTextSelected: {
    color: BRAND_THEME.PRIMARY,
    fontWeight: '800',
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  metricCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  metricCardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  metricIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    marginTop: 2,
  },

  // Order Card
  orderCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  orderCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderCardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderWidth: 1,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteOrderBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
  },
  orderDateText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 16,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  cancelledText: {
    fontSize: 12,
    fontWeight: '900',
    color: BRAND_THEME.CORAL,
  },

  // Product Block
  productBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  productBlockDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  imagesStackContainer: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  productImageMain: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  moreBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: BRAND_THEME.PRIMARY,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  moreBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  productDetailsCol: {
    flex: 1,
    marginLeft: 12,
  },
  itemCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
  },
  totalAmountText: {
    fontSize: 15,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    marginTop: 2,
  },
  paymentTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  paymentTagText: {
    fontSize: 10,
    color: '#64748B',
  },
  arrowCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  arrowCircleBtnDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
  },

  // Progress Tracker Nodes
  progressTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  progressTrackContainerDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  trackStepNode: {
    alignItems: 'center',
    width: 52,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  nodeStepLabel: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'center',
  },
  trackConnectingLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },

  // Delivered Banner
  deliveredBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  deliveredBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveredBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_THEME.PRIMARY,
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rateBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
  },

  // Help & Support Card
  helpBanner: {
    backgroundColor: '#F0ECE1',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  helpBannerDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
  },
  helpBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
  },
  helpSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: BRAND_THEME.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  supportBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
    marginLeft: 4,
  },

  // Empty State
  emptyOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyOrdersCardDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  emptyOrdersTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
    marginTop: 6,
  },
  emptyOrdersSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  shopNowBtn: {
    backgroundColor: BRAND_THEME.PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    elevation: 1,
  },
  shopNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // Order Details Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    elevation: 20,
  },
  modalSheetDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
  },
  modalSubTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtnDark: {
    backgroundColor: '#334155',
  },
  modalStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 14,
    gap: 7,
  },
  modalStatusBannerDark: {
    backgroundColor: 'rgba(47, 110, 73, 0.18)',
  },
  modalStatusText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_DARK,
  },
  modalSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
    marginTop: 18,
    marginBottom: 9,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Vertical Timeline tracking list
  timelineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
  },
  timelineCardDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLeftCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    height: 34,
    backgroundColor: '#E2E8F0',
    marginTop: -2,
    zIndex: 1,
  },
  timelineRightCol: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  timelineDesc: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },

  // Details Info Box
  detailsInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
  },
  detailsInfoBoxDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  infoRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoRowLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  infoRowVal: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_DARK,
  },

  // Partner Card
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },
  partnerCardDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  partnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#CBD5E1',
  },
  partnerAvatar: {
    width: '100%',
    height: '100%',
  },
  partnerName: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
  },
  partnerVeh: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  partnerStatus: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BRAND_THEME.PRIMARY,
    marginTop: 2,
  },
  partnerCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_THEME.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal item row group (allows embedding reviews)
  modalItemRowGroup: {
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    overflow: 'hidden',
  },
  modalItemRowGroupDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  modalItemRowDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  modalItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 9,
    backgroundColor: '#CBD5E1',
  },
  modalItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_DARK,
  },
  modalItemQty: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  modalItemPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
  },

  // Rating Box
  ratingBox: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  ratingBoxDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
  },
  ratingDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  ratingBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  starFeedbackLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
  },
  ratingTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
    marginBottom: 8,
  },
  ratingTextInputDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
    color: '#F8FAFC',
  },
  submitReviewBtn: {
    backgroundColor: BRAND_THEME.PRIMARY,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewBtnTxt: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  reviewSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  reviewSuccessText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: BRAND_THEME.PRIMARY,
  },

  // Bill Box
  billBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billBoxDark: {
    backgroundColor: BRAND_THEME.BG_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  billTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_DARK,
    marginBottom: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  billLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  billValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_DARK,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 7,
  },
  grandTotalLabel: {
    fontSize: 13.5,
    fontWeight: '900',
    color: BRAND_THEME.TEXT_DARK,
  },
  grandTotalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: BRAND_THEME.PRIMARY,
  },

  // Premium FAQ support kit card (Home kit card inspiration)
  kitCardSupport: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#E6DFD3',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  kitCardSupportDark: {
    backgroundColor: BRAND_THEME.CARD_DARK,
    borderColor: BRAND_THEME.BORDER_DARK,
  },
  kitCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  kitCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
    marginBottom: 12,
  },
  faqContainer: {
    marginBottom: 12,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6DFD3',
    paddingVertical: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_DARK,
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 15,
  },
  kitSupportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND_THEME.PRIMARY,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  kitSupportBtnTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  modalFooterActions: {
    marginTop: 14,
  },
  modalCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626', // Crimson Red Cancel Button
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalCancelBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  modalCancelledPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  modalCancelledPillTxt: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
});
