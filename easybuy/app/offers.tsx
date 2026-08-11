import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { generateFullIndianCatalog, ProductItem } from '../constants/catalogGenerator';
import { SearchModal } from '../components/search/SearchModal';
import { ProductTransitionWrapper } from '../components/transition/ProductTransitionWrapper';

const { width } = Dimensions.get('window');

// Dynamic 12-Hour Flash Sale Coupons
const DYNAMIC_COUPONS = [
  {
    code: 'FLASH60',
    title: 'FLAT 60% OFF',
    sub: 'Valid on Gen-Z Apparel & Kicks',
    bg: ['#8B5CF6', '#6D28D9'],
    badge: '12-HR SPECIAL',
  },
  {
    code: 'MEGA500',
    title: 'FLAT ₹500 OFF',
    sub: 'Min order ₹1,999 on Tech & Audio',
    bg: ['#EC4899', '#DB2777'],
    badge: 'HOT DEAL',
  },
  {
    code: 'B1G1BEAUTY',
    title: 'BUY 1 GET 1 FREE',
    sub: 'On K-Beauty Serums & Lip Tints',
    bg: ['#10B981', '#059669'],
    badge: 'LIMITED TIME',
  },
  {
    code: 'FREESHIP',
    title: 'FREE EXPRESS SHIPPING',
    sub: 'No min order on 10-Min Grocery',
    bg: ['#F59E0B', '#D97706'],
    badge: 'SUPERFAST',
  },
];

export default function OffersScreen() {
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const { addToCart, totalItems, openCart } = useCart();
  const { openWishlist } = useWishlist();

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // ─── DYNAMIC 12-HOUR COUNTDOWN TIMER ───
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [slotIndex, setSlotIndex] = useState<number>(0);

  useEffect(() => {
    function calculate12HourRemaining() {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSecs = now.getSeconds();

      // Determine 12-hour slot (Slot 0: 00:00 - 11:59, Slot 1: 12:00 - 23:59)
      const isSlotB = currentHours >= 12;
      setSlotIndex(isSlotB ? 1 : 0);

      // Target hours: 12 PM for Slot 0, 24 PM (00:00) for Slot 1
      const targetHours = isSlotB ? 24 : 12;
      const totalPassedSecs = (currentHours % 12) * 3600 + currentMinutes * 60 + currentSecs;
      const totalSlotSecs = 12 * 3600;
      const remaining = totalSlotSecs - totalPassedSecs;

      setSecondsRemaining(remaining > 0 ? remaining : 0);
    }

    calculate12HourRemaining();
    const interval = setInterval(calculate12HourRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatHHMMSS = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // ─── LOAD 12-HOUR ROTATING OFFERS PRODUCTS ───
  const allCatalog = generateFullIndianCatalog();
  
  // Rotate selection based on 12-hour slot index + date
  const dateSeed = new Date().getDate();
  const startIdx = ((dateSeed * 7 + slotIndex * 13) % 50) * 12;
  const rawOffers = allCatalog.slice(startIdx, startIdx + 48);

  const offersList = rawOffers.filter((p) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'fashion') return p.categoryId === 'fashion';
    if (selectedFilter === 'tech') return p.categoryId === 'electronics' || p.categoryId === 'gaming';
    if (selectedFilter === 'beauty') return p.categoryId === 'beauty';
    if (selectedFilter === 'quickbuy') return p.categoryId === 'quickbuy' || p.categoryId === 'grocery';
    return true;
  });

  const handleCopyCoupon = (code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setToastMsg(`Coupon "${code}" copied! Flat discount applied at checkout 🎟️`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddToCart = (prod: ProductItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    addToCart({
      id: prod.id,
      title: prod.title || prod.name,
      price: prod.price,
      image: prod.thumbnail || prod.image || '',
    });
    setToastMsg(`Claimed 12-HR Deal on "${prod.title || prod.name}"! 🏷️`);
    setTimeout(() => setToastMsg(null), 2800);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top']}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ─── HEADER BAR ─── */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          style={[styles.backBtn, isDarkMode && styles.iconBtnDark]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
            Flash Sale & Offers 🏷️
          </Text>
          <Text style={styles.headerSubTitle}>
            Refreshes every 12 Hours
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, isDarkMode && styles.iconBtnDark]}
            onPress={() => setSearchModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={18} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, isDarkMode && styles.iconBtnDark]}
            onPress={openCart}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={18} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ─── 12-HOUR COUNTDOWN TIMER BANNER ─── */}
        <View style={styles.timerBanner}>
          <View style={styles.timerLeft}>
            <Ionicons name="time" size={22} color="#FFFFFF" />
            <View>
              <Text style={styles.timerBannerTitle}>12-Hour Flash Sale</Text>
              <Text style={styles.timerBannerSub}>Next rotation in:</Text>
            </View>
          </View>

          <View style={styles.timerClockBox}>
            <Text style={styles.timerClockTxt}>{formatHHMMSS(secondsRemaining)}</Text>
          </View>
        </View>

        {/* ─── DYNAMIC COUPON CODES CAROUSEL ─── */}
        <View style={styles.couponsSection}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
            EXCLUSIVE COUPONS & PROMOS
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.couponsScroll}>
            {DYNAMIC_COUPONS.map((coupon) => (
              <View key={coupon.code} style={[styles.couponCard, { backgroundColor: coupon.bg[0] }]}>
                <View style={styles.couponBadgePill}>
                  <Text style={styles.couponBadgeTxt}>{coupon.badge}</Text>
                </View>
                
                <Text style={styles.couponTitle}>{coupon.title}</Text>
                <Text style={styles.couponSub}>{coupon.sub}</Text>
                
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleCopyCoupon(coupon.code)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.copyBtnTxt}>{coupon.code}</Text>
                  <Ionicons name="copy-outline" size={14} color="#0F172A" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ─── FILTER TABS ─── */}
        <View style={styles.filterTabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
            {[
              { id: 'all', label: 'All 12-HR Deals 🔥' },
              { id: 'fashion', label: 'Fashion Deals 👖' },
              { id: 'tech', label: 'Tech Flash 🎧' },
              { id: 'beauty', label: 'Beauty Offers 💄' },
              { id: 'quickbuy', label: '10-Min Groceries ⚡' },
            ].map((tab) => {
              const isActive = selectedFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.filterPill,
                    isDarkMode && styles.filterPillDark,
                    isActive && styles.filterPillActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedFilter(tab.id);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.filterPillTxt, isActive && styles.filterPillTxtActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── TOAST NOTIFICATION ─── */}
        {toastMsg && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastTxt}>{toastMsg}</Text>
          </View>
        )}

        {/* ─── 12-HOUR FLASH OFFERS GRID ─── */}
        <View style={styles.gridSection}>
          <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
            CURRENT 12-HOUR FLASH DEALS ({offersList.length})
          </Text>

          <View style={styles.gridWrapper}>
            {offersList.map((item, idx) => {
              const claimedPct = 65 + ((idx * 7) % 30);
              const imageUrl = item.thumbnail || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
              return (
                <ProductTransitionWrapper
                  key={item.id}
                  productId={item.id}
                  imageUrl={imageUrl}
                  style={[styles.productCard, isDarkMode && styles.productCardDark]}
                  activeOpacity={0.88}
                >
                  <View style={styles.imgWrapper}>
                    <Image
                      source={{
                        uri: failedImages[item.id]
                          ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
                          : (item.thumbnail || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
                      }}
                      style={styles.prodImg}
                      resizeMode="cover"
                      onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
                    />
                    <View style={styles.offerBadgeTag}>
                      <Text style={styles.offerBadgeTxt}>SAVE {item.discountPercentage || 50}%</Text>
                    </View>
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.brandTxt} numberOfLines={1}>
                      {item.brand || 'EasyBuy Deals'}
                    </Text>
                    <Text style={[styles.prodTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
                      {item.title || item.name}
                    </Text>

                    {/* Stock Urgency Progress Bar */}
                    <View style={styles.urgencyBox}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${claimedPct}%` }]} />
                      </View>
                      <Text style={styles.urgencyTxt}>🔥 {claimedPct}% Claimed</Text>
                    </View>

                    <View style={styles.priceRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.priceTxt}>{item.price}</Text>
                        <Text style={styles.mrpTxt}>{item.originalPrice || `₹${(item.priceNumber || 1000) * 2}`}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddToCart(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="flash" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ProductTransitionWrapper>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* ─── SEARCH MODAL ─── */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnDark: {
    backgroundColor: '#334155',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubTitle: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // 12-Hour Timer Banner
  timerBanner: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  timerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  timerBannerSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  timerClockBox: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timerClockTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Coupons
  couponsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  couponsScroll: {
    gap: 12,
  },
  couponCard: {
    width: 220,
    borderRadius: 14,
    padding: 14,
    position: 'relative',
  },
  couponBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  couponBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  couponTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  couponSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  copyBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  copyBtnTxt: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },

  // Filter Tabs
  filterTabsWrapper: {
    marginBottom: 16,
  },
  filterTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  filterPillActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  filterPillTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTxtActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 99,
    elevation: 8,
  },
  toastTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Products Grid
  gridSection: {
    paddingHorizontal: 16,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  productCard: {
    width: (width - 44) / 2,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  imgWrapper: {
    width: '100%',
    height: 150,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  prodImg: {
    width: '100%',
    height: '100%',
  },
  offerBadgeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offerBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  cardInfo: {
    padding: 10,
  },
  brandTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  prodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    height: 34,
    lineHeight: 17,
  },
  urgencyBox: {
    marginTop: 6,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EF4444',
  },
  urgencyTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  mrpTxt: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
