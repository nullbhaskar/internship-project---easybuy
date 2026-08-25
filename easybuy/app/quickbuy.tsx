import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';
import { QuickAddModal, QuickAddProduct } from '../components/cart/QuickAddModal';
import { SearchModal } from '../components/search/SearchModal';
import { LocationPickerModal } from '../components/location';
import { useAddress } from '../context/AddressContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { QBProduct, QBCategory, QB_CATEGORIES } from '../constants/quickbuyData';

const { width } = Dimensions.get('window');
const RIGHT_WIDTH = width - 105; // right panel width
const COL = (RIGHT_WIDTH - 48) / 3;  // 3 columns with gaps

// ─── OSM TILE HELPER ─────────────────────────────────────────────────────────
// Computes a direct OpenStreetMap tile URL (same CDN as full-screen map)
function getOSMTileUrl(lat: number, lng: number, zoom = 15): string {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function QuickBuyScreen() {
  const router = useRouter();
  const { openCart, totalItems: cartCount, addToCart } = useCart();
  const { openWishlist, totalWishlistItems } = useWishlist();
  const { selectedAddress, openLocationModal } = useAddress();

  const [activeTabId, setActiveTabId]       = useState('popular');
  const [searchVisible, setSearchVisible]   = useState(false);
  const [drawerVisible, setDrawerVisible]   = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<QuickAddProduct | null>(null);

  // ── Tab Switch Animation ──────────────────────────────────────────────────
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;

  const handleTabChange = (catId: string) => {
    if (catId === activeTabId) return;
    Haptics.selectionAsync().catch(() => {});

    // Quick fade out + slide down
    Animated.parallel([
      Animated.timing(contentFadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 12, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setActiveTabId(catId);
      contentTranslateY.setValue(16);
      // Smooth fade in + slide up
      Animated.parallel([
        Animated.timing(contentFadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(contentTranslateY, { toValue: 0, friction: 7, tension: 140, useNativeDriver: true }),
      ]).start();
    });
  };

  // ── Swipe-right-to-dismiss ──────────────────────────────────────────────────
  const slideX       = useRef(new Animated.Value(0)).current;
  const splashOpacity= useRef(new Animated.Value(0)).current;
  const splashScale  = useRef(new Animated.Value(0.82)).current;
  const dot1         = useRef(new Animated.Value(0.3)).current;
  const dot2         = useRef(new Animated.Value(0.3)).current;
  const dot3         = useRef(new Animated.Value(0.3)).current;
  const barWidth     = useRef(new Animated.Value(0)).current;

  const startLoadingAnim = () => {
    const pulseDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(dot, { toValue: 0.3, duration: 200, useNativeDriver: false }),
        Animated.delay(400 - delay),
      ]));
    pulseDot(dot1, 0).start();
    pulseDot(dot2, 120).start();
    pulseDot(dot3, 240).start();
    Animated.timing(barWidth, { toValue: 100, duration: 440, useNativeDriver: false }).start();
  };

  const triggerSplashAndBack = () => {
    barWidth.setValue(0);
    startLoadingAnim();
    Animated.parallel([
      Animated.timing(splashOpacity, { toValue: 1, duration: 160, useNativeDriver: false }),
      Animated.spring(splashScale, { toValue: 1, friction: 6, tension: 200, useNativeDriver: false }),
    ]).start();
    setTimeout(() => {
      router.back();
      setTimeout(() => {
        splashOpacity.setValue(0); splashScale.setValue(0.82);
        barWidth.setValue(0); dot1.setValue(0.3); dot2.setValue(0.3);
        dot3.setValue(0.3); slideX.setValue(0);
      }, 300);
    }, 500);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.timing(slideX, { toValue: width, duration: 220, useNativeDriver: false })
      .start(triggerSplashAndBack);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => gs.dx > 12 && Math.abs(gs.dy) < Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => { if (gs.dx > 0) slideX.setValue(gs.dx); },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > width * 0.35 || gs.vx > 0.5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          Animated.timing(slideX, { toValue: width, duration: 180, useNativeDriver: false })
            .start(triggerSplashAndBack);
        } else {
          Animated.spring(slideX, { toValue: 0, friction: 6, tension: 100, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const activeCategory = QB_CATEGORIES.find(c => c.id === activeTabId) || QB_CATEGORIES[0];

  const handleAddPress = (product: QBProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    } as any);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <Animated.View
        style={[styles.root, { transform: [{ translateX: slideX }] }]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <StatusBar style="dark" />

          {/* ── 1. FLOATING TOP HEADER CARD ── */}
          <View style={styles.headerCard}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                setDrawerVisible(true);
              }}
              style={styles.headerMenuBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="menu-outline" size={22} color="#1E293B" />
            </TouchableOpacity>

            <View style={styles.headerCenterColumn}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerTitle}>QuickBuy</Text>
              </View>

              <View style={styles.headerMetaRow}>
                <View style={styles.deliveryPill}>
                  <Ionicons name="flash" size={10} color="#15803D" />
                  <Text style={styles.deliveryPillTxt}>10–15 min delivery</Text>
                </View>
                <Text style={styles.metaDivider}>|</Text>
                <TouchableOpacity
                  style={styles.locationPill}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    openLocationModal();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={12} color="#334155" />
                  <Text style={styles.locationTxt}>
                    {selectedAddress?.city || 'Patna'}, {selectedAddress?.state || 'Bihar'}
                  </Text>
                  <Ionicons name="chevron-down" size={12} color="#334155" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerRightGroup}>
              <TouchableOpacity
                style={styles.headerCircleBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setSearchVisible(true); }}
                activeOpacity={0.8}
              >
                <Ionicons name="search-outline" size={19} color="#1E293B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerCircleBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); router.push("/cart" as any); }}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={19} color="#1E293B" />
                {cartCount > 0 && (
                  <View style={styles.badgeGreen}>
                    <Text style={styles.badgeGreenTxt}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── SPLIT BODY ── */}
          <View style={styles.splitBody}>

            {/* LEFT SIDEBAR */}
            <View style={styles.sidebar}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                {QB_CATEGORIES.map(cat => {
                  const isActive = cat.id === activeTabId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.sideTab, isActive && styles.sideTabActive]}
                      onPress={() => handleTabChange(cat.id)}
                      activeOpacity={0.85}
                    >
                      {isActive && <View style={styles.activeBar} />}
                      <View style={{ marginBottom: 4, transform: [{ scale: isActive ? 1.12 : 1 }] }}>
                        <Ionicons
                          name={(isActive && cat.iconName === 'star-outline' ? 'star' : cat.iconName) as any}
                          size={24}
                          color={isActive ? '#16A34A' : '#334155'}
                        />
                      </View>
                      <Text style={[styles.sideTabText, isActive && styles.sideTabTextActive]} numberOfLines={2}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 110 }} />
              </ScrollView>
            </View>

            {/* RIGHT CONTENT */}
            <ScrollView style={styles.rightPanel} showsVerticalScrollIndicator={false}>

              <Animated.View
                style={{
                  opacity: contentFadeAnim,
                  transform: [{ translateY: contentTranslateY }],
                }}
              >
                <View style={styles.emeraldBanner}>
                  <View style={styles.bannerLeftContent}>
                    <View style={styles.superFastTag}>
                      <Text style={styles.superFastTxt}>SUPER FAST</Text>
                    </View>

                    <Text style={styles.emeraldBannerTitle}>
                      10-MIN EXPRESS{'\n'}DELIVERY <Text style={{ color: '#FACC15' }}>⚡</Text>
                    </Text>

                    <Text style={styles.emeraldBannerSub}>
                      Essentials at your door in a flash!
                    </Text>
                  </View>

                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' }}
                    style={styles.bannerBagImg}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.grid}>
                  {activeCategory.products.map((product: QBProduct) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.circleWrap}>
                        <Image source={{ uri: product.image }} style={styles.productImg} resizeMode="cover" />
                      </View>

                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

                      <Text style={styles.productWeight}>{product.weight}</Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.price}>{product.price}</Text>
                        {product.originalPrice && (
                          <Text style={styles.originalPrice}>{product.originalPrice}</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddPress(product)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addBtnTxt}>Add</Text>
                        <Ionicons name="add" size={14} color="#22C55E" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </Animated.View>

              <View style={{ height: 120 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Animated.View>

      <ExperimentalNavigation
        activeTab="quickbuy"
        onTabChange={(tabId) => { if (tabId !== 'quickbuy') router.replace(`/${tabId}` as any); }}
      />

      {/* SPLASH OVERLAY */}
      <Animated.View style={[styles.splashOverlay, { opacity: splashOpacity, pointerEvents: 'none' } as any]}>
        <Animated.Image
          source={require('../assets/images/easybuy_logo.png')}
          style={[styles.splashLogo, { transform: [{ scale: splashScale }] }]}
          resizeMode="contain"
        />
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: dot, transform: [{ scale: dot }] }]} />
          ))}
        </View>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
        </View>
      </Animated.View>

      {/* ── EXACT REPLICA QUICKBUY MENU DRAWER MODAL ── */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          />

          <View style={styles.menuSheetContainer}>
            {/* Top Mint Header Section with Drag Handle & User Greeting */}
            <View style={styles.menuTopMintSection}>
              {/* Drag Handle Indicator */}
              <View style={styles.dragHandle} />

              {/* User Profile Greeting Row */}
              <View style={styles.menuGreetingHeader}>
                <View style={styles.menuAvatarWrap}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' }}
                    style={styles.menuAvatarImg}
                    resizeMode="cover"
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.greetingTitle}>Hey Bhaskar! 👋</Text>
                  <Text style={styles.greetingSub}>Welcome to QuickBuy</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setDrawerVisible(false)}
                  style={styles.menuCloseBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 10 }}>

              {/* 1. Delivery Location Card with Map Graphic */}
              <TouchableOpacity
                style={styles.locationMapCard}
                onPress={() => {
                  setDrawerVisible(false);
                  openLocationModal();
                }}
                activeOpacity={0.88}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={styles.greenPinWrap}>
                      <Ionicons name="location-sharp" size={14} color="#16A34A" />
                    </View>
                    <Text style={styles.deliveryLocationLabel}>DELIVERY LOCATION</Text>
                  </View>

                  <Text style={styles.deliveryAddressMain}>
                    {selectedAddress?.city || 'Patna'}, {selectedAddress?.state || 'Bihar'} - {selectedAddress?.pincode || '800001'}
                  </Text>

                  <View style={styles.changeAddressLink}>
                    <Text style={styles.changeAddressLinkTxt}>Change Address</Text>
                    <Ionicons name="chevron-forward" size={12} color="#16A34A" />
                  </View>
                </View>

                {/* Right Mini Map Preview — OSM Tile */}
                <TouchableOpacity
                  style={styles.miniMapWrap}
                  onPress={() => { setDrawerVisible(false); openLocationModal(); }}
                  activeOpacity={0.85}
                >
                  <Image
                    style={styles.miniMapImg}
                    resizeMode="cover"
                    source={{
                      uri: getOSMTileUrl(
                        selectedAddress?.latitude ?? 25.5941,
                        selectedAddress?.longitude ?? 85.1376,
                        15
                      )
                    }}
                  />
                  {/* Green location dot overlay */}
                  <View style={styles.miniMapPinCenter} pointerEvents="none">
                    <View style={styles.miniMapDot} />
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* 2. My Wishlist Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  openWishlist();
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#FFE4E6' }]}>
                  <Ionicons name="heart" size={18} color="#F43F5E" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>My Wishlist</Text>
                  <Text style={styles.menuRowSub}>
                    {totalWishlistItems > 0 ? `${totalWishlistItems} saved items` : 'No saved items yet'}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 3. Explore All Categories Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/all-items' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="grid" size={18} color="#D97706" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>Explore All Categories</Text>
                  <Text style={styles.menuRowSub}>All items in categorized manner</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 4. My Orders Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/profile' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="bag-handle" size={18} color="#0284C7" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>My Orders</Text>
                  <Text style={styles.menuRowSub}>View your past orders & tracking</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 5. My Profile Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/profile' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="person" size={18} color="#7C3AED" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>My Profile</Text>
                  <Text style={styles.menuRowSub}>Account details & preferences</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* 6. Help & Support Card */}
              <TouchableOpacity
                style={styles.menuRowItem}
                onPress={() => {
                  setDrawerVisible(false);
                  router.push('/profile' as any);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.menuRowIconWrap, { backgroundColor: '#CCFBF1' }]}>
                  <Ionicons name="headset" size={18} color="#0D9488" />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.menuRowTitle}>Help & Support</Text>
                  <Text style={styles.menuRowSub}>FAQs, chat support & more</Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

            </ScrollView>

            {/* Bottom Quick Bar */}
            <View style={styles.bottomFooterBar}>
              <TouchableOpacity style={styles.footerBarItem} activeOpacity={0.7}>
                <Ionicons name="share-social-outline" size={14} color="#64748B" />
                <Text style={styles.footerBarTxt}>Share App</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity style={styles.footerBarItem} activeOpacity={0.7}>
                <Ionicons name="star-outline" size={14} color="#64748B" />
                <Text style={styles.footerBarTxt}>Rate Us</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity style={styles.footerBarItem} activeOpacity={0.7}>
                <Ionicons name="settings-outline" size={14} color="#64748B" />
                <Text style={styles.footerBarTxt}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
      <QuickAddModal
        visible={quickAddVisible}
        product={quickAddProduct}
        onClose={() => setQuickAddVisible(false)}
        onAddToCart={(prod, size, color, qty) => {
          addToCart({
            id: prod.id,
            title: prod.title,
            price: prod.price,
            originalPrice: prod.originalPrice,
            image: prod.image,
            selectedVariant: `${size} / ${color}`,
            quantity: qty,
          } as any);
          setQuickAddVisible(false);
        }}
      />
      <LocationPickerModal />
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // 1. Floating Top Header Card
  headerCard: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerMenuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCenterColumn: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  deliveryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deliveryPillTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  metaDivider: {
    fontSize: 11,
    color: '#94A3B8',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  wishlistPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    position: 'relative',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  wishlistPillTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  wishlistBadge: {
    backgroundColor: '#EF4444',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  wishlistBadgeTxt: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeGreen: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#16A34A',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeGreenTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Split body
  splitBody: { flex: 1, flexDirection: 'row' },

  // Left Sidebar
  sidebar: { width: 105, backgroundColor: '#F1F5F9' },
  sideTab: {
    paddingVertical: 14, paddingHorizontal: 6,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    borderTopLeftRadius: 18, borderBottomLeftRadius: 18,
    marginVertical: 2, marginLeft: 4,
  },
  sideTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activeBar: {
    position: 'absolute', left: 0, top: 12, bottom: 12,
    width: 4, backgroundColor: '#16A34A',
    borderTopRightRadius: 4, borderBottomRightRadius: 4,
  },
  sideTabEmoji: { fontSize: 24, marginBottom: 4 },
  sideTabText: {
    fontSize: 11, fontWeight: '600', color: '#475569',
    textAlign: 'center', lineHeight: 14,
  },
  sideTabTextActive: { fontWeight: '800', color: '#16A34A' },

  // Right Panel
  rightPanel: { flex: 1, backgroundColor: '#FFFFFF' },

  // 2. Emerald 10-Min Express Banner
  emeraldBanner: {
    margin: 10,
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#047857',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerLeftContent: {
    flex: 1,
    paddingRight: 8,
  },
  superFastTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  superFastTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emeraldBannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  emeraldBannerSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#A7F3D0',
    marginTop: 4,
  },
  bannerBagImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },

  // Product Grid (3 columns)
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 10, gap: 12,
  },
  productCard: {
    width: COL, alignItems: 'center',
    paddingVertical: 8,
  },
  circleWrap: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    borderWidth: 1, borderColor: '#F1F5F9',
    marginBottom: 6,
  },
  productImg: { width: 76, height: 76 },
  productName: {
    fontSize: 11, fontWeight: '700', color: '#1E293B',
    textAlign: 'center', lineHeight: 14, marginBottom: 2,
  },
  productWeight: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  price: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  originalPrice: { fontSize: 10, color: '#94A3B8', textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    borderWidth: 1.5, borderColor: '#22C55E', borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
  },
  addBtnTxt: { fontSize: 12, fontWeight: '700', color: '#22C55E' },

  // Splash
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  splashLogo: { width: 160, height: 60, marginBottom: 20 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9C27B0' },
  barTrack: { width: 100, height: 3, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#9C27B0', borderRadius: 2 },
  // Drawer Modal Styles (Exact Replica of User Mockup)
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuSheetContainer: {
    backgroundColor: '#FAFCFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 24,
  },
  menuTopMintSection: {
    backgroundColor: '#ECFDF5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    alignSelf: 'center',
    marginBottom: 10,
  },
  menuGreetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D1FAE5',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  menuAvatarImg: {
    width: 52,
    height: 52,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  greetingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  locationMapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  greenPinWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryLocationLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  deliveryAddressMain: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  changeAddressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeAddressLinkTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  miniMapWrap: {
    width: 90,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  miniMapImg: {
    width: '100%',
    height: '100%',
  },
  miniMapPinCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -5,
    marginLeft: -5,
  },
  miniMapDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  menuRowItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuRowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuRowSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  bottomFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  footerBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  footerBarTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  footerDivider: {
    color: '#CBD5E1',
    fontSize: 12,
  },
});
