import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';
import { SearchModal } from '../components/search/SearchModal';
import { QuickAddModal, QuickAddProduct } from '../components/cart/QuickAddModal';
import { ProductTransitionWrapper } from '../components/transition/ProductTransitionWrapper';

const { width } = Dimensions.get('window');

const SPICE_CHIPS = [
  { id: 'all', label: 'All Spices 🌶️' },
  { id: 'bihar', label: 'Bihar Specials 🌾' },
  { id: 'kerala', label: 'Kerala Spices 🍃' },
  { id: 'rajasthan', label: 'Rajasthan Masalas 🌶️' },
  { id: 'punjab', label: 'Punjab Specials 🌾' },
  { id: 'bengal', label: 'Bengal Harvest 🫖' },
  { id: 'whole', label: 'Whole Spices 🌰' },
  { id: 'ground', label: 'Ground Powders 🧂' },
];

export interface SpiceProduct {
  id: string;
  title: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviews: number;
  stateTag: string;
  stateCode: string;
  category: 'bihar' | 'kerala' | 'rajasthan' | 'punjab' | 'bengal' | 'whole' | 'ground';
  image: string;
  description: string;
}

const REGIONAL_SPICES_CATALOG: SpiceProduct[] = [
  {
    id: 'sp_br_1',
    title: 'Mithila Litti Chokha Special Spice & Ajwain Mix',
    weight: '250g Pack',
    price: 129,
    originalPrice: 179,
    discount: '28% OFF',
    rating: 4.9,
    reviews: 420,
    stateTag: 'Bihar Heritage',
    stateCode: 'bihar',
    category: 'bihar',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    description: 'Authentic Ajwain, Kalonji & Mustard-infused traditional spice blend for homemade Litti Chokha.',
  },
  {
    id: 'sp_br_2',
    title: 'Organic Patna Roasted Chana Sattu',
    weight: '1kg Pouch',
    price: 189,
    originalPrice: 249,
    discount: '24% OFF',
    rating: 4.8,
    reviews: 380,
    stateTag: 'Patna Special',
    stateCode: 'bihar',
    category: 'bihar',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    description: '100% natural protein-rich roasted gram flour ground in traditional mills of Patna.',
  },
  {
    id: 'sp_br_3',
    title: 'Premium Darbhanga Roasted Jumbo Makhana',
    weight: '500g Jumbo Pack',
    price: 449,
    originalPrice: 599,
    discount: '25% OFF',
    rating: 4.9,
    reviews: 510,
    stateTag: 'Darbhanga Wetlands',
    stateCode: 'bihar',
    category: 'bihar',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
    description: 'Grade-A crunchy lotus seeds sourced directly from the pristine Darbhanga wetland ponds.',
  },
  {
    id: 'sp_kl_1',
    title: 'Wayanad Organic Whole Black Peppercorns',
    weight: '250g Glass Jar',
    price: 349,
    originalPrice: 449,
    discount: '22% OFF',
    rating: 4.9,
    reviews: 290,
    stateTag: 'Kerala High Ranges',
    stateCode: 'kerala',
    category: 'whole',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
    description: 'Sun-dried aromatic Tellicherry black pepper harvested from hill plantations of Wayanad.',
  },
  {
    id: 'sp_kl_2',
    title: 'Idukki Green Cardamom / Elaichi Pods',
    weight: '100g Zip Pack',
    price: 399,
    originalPrice: 520,
    discount: '23% OFF',
    rating: 4.9,
    reviews: 315,
    stateTag: 'Kerala Spice Coast',
    stateCode: 'kerala',
    category: 'kerala',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    description: '8mm extra jumbo aromatic green cardamom pods handpicked from Idukki spice gardens.',
  },
  {
    id: 'sp_rj_1',
    title: 'Rajasthani Mathania Ground Red Chilli Powder',
    weight: '250g Pack',
    price: 219,
    originalPrice: 299,
    discount: '26% OFF',
    rating: 4.8,
    reviews: 340,
    stateTag: 'Rajasthan Mathania',
    stateCode: 'rajasthan',
    category: 'ground',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    description: 'Vibrant crimson-red spice powder renowned for deep rich color and balanced authentic heat.',
  },
  {
    id: 'sp_jk_1',
    title: 'Kashmiri Mogra Pure Saffron (Kesar)',
    weight: '1g Gift Box',
    price: 799,
    originalPrice: 1099,
    discount: '27% OFF',
    rating: 5.0,
    reviews: 620,
    stateTag: 'Kashmir Pampore',
    stateCode: 'whole',
    category: 'whole',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
    description: 'GI-tagged pure Pampore saffron threads known for intense aroma and natural golden color.',
  },
  {
    id: 'sp_pb_1',
    title: 'Amritsari Sun-Dried Black Pepper Urad Papad',
    weight: '400g Pack',
    price: 199,
    originalPrice: 279,
    discount: '28% OFF',
    rating: 4.7,
    reviews: 310,
    stateTag: 'Punjab Heritage',
    stateCode: 'punjab',
    category: 'punjab',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    description: 'Traditional handcrafted urad dal papad seasoned with crushed black pepper & asafoetida.',
  },
  {
    id: 'sp_ap_1',
    title: 'Guntur Teja Hot Whole Dried Red Chillies',
    weight: '500g Pack',
    price: 279,
    originalPrice: 350,
    discount: '20% OFF',
    rating: 4.8,
    reviews: 240,
    stateTag: 'Andhra Guntur',
    stateCode: 'whole',
    category: 'whole',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    description: 'Sun-cured fiery Guntur Teja red chillies for authentic South Indian curries & tadka.',
  },
  {
    id: 'sp_wb_1',
    title: 'Darjeeling First Flush Whole Leaf Black Tea',
    weight: '250g Tin',
    price: 699,
    originalPrice: 899,
    discount: '22% OFF',
    rating: 4.9,
    reviews: 180,
    stateTag: 'Darjeeling Estate',
    stateCode: 'bengal',
    category: 'bengal',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
    description: 'Exquisite light-bodied black tea with signature muscatel flavor profiles from high altitude estates.',
  },
];

export default function RegionalSpicesScreen() {
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const { addToCart, openCart, totalItems: cartCount } = useCart();
  const { toggleWishlist, isInWishlist, totalWishlistItems, openWishlist } = useWishlist();

  const [activeChip, setActiveChip] = useState('all');
  const [searchVisible, setSearchVisible] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<QuickAddProduct | null>(null);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [cartCounts, setCartCounts] = useState<Record<string, number>>({});

  // Filter products by selected chip
  const filteredSpices = useMemo(() => {
    if (activeChip === 'all') return REGIONAL_SPICES_CATALOG;
    return REGIONAL_SPICES_CATALOG.filter(
      (p) => p.category === activeChip || p.stateCode === activeChip
    );
  }, [activeChip]);

  const handleQuickAddToCart = (product: QuickAddProduct, size: string, color: string, qty: number) => {
    addToCart({
      id: product.id,
      title: product.title,
      name: product.title,
      price: parseFloat(product.price.replace('₹', '')),
      image: product.image,
      thumbnail: product.image,
      quantity: qty,
    } as any);

    setCartCounts((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + qty
    }));
  };

  const handleAddSpice = (spice: SpiceProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const currentQty = cartCounts[spice.id] || 0;
    const newQty = currentQty + 1;
    setCartCounts((prev) => ({ ...prev, [spice.id]: newQty }));

    addToCart({
      id: spice.id,
      title: spice.title,
      name: spice.title,
      price: spice.price,
      image: spice.image,
      thumbnail: spice.image,
      quantity: 1,
    } as any);
  };

  const handleRemoveSpice = (spiceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const currentQty = cartCounts[spiceId] || 0;
    if (currentQty > 0) {
      setCartCounts((prev) => ({ ...prev, [spiceId]: currentQty - 1 }));
    }
  };

  // Render product card inside staggered masonry columns
  const renderSpiceCard = (spice: SpiceProduct, index: number) => {
    const qty = cartCounts[spice.id] || 0;
    const isFav = isInWishlist(spice.id);
    
    // Stagger image height: alternate 175px and 125px for visual rhythm
    const imageHeight = index % 2 === 0 ? 175 : 125;

    return (
      <ProductTransitionWrapper
        key={spice.id}
        productId={spice.id}
        imageUrl={spice.image}
        style={[styles.card, isDarkMode && styles.cardDark]}
        activeOpacity={0.92}
      >
        {/* Image wrapper with alternating height */}
        <View style={[styles.cardImgWrapper, { height: imageHeight }]}>
          <Image source={{ uri: spice.image }} style={styles.cardImg} resizeMode="cover" />

          {/* Wishlist Button Overlay */}
          <TouchableOpacity
            style={[styles.favBtn, isFav && styles.favBtnActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              toggleWishlist({
                id: spice.id,
                title: spice.title,
                price: spice.price,
                image: spice.image,
              } as any);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={15}
              color={isFav ? '#FF4757' : '#64748B'}
            />
          </TouchableOpacity>

          {/* Discount Badge Overlay */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountTxt}>{spice.discount}</Text>
          </View>

          {/* State Tag Overlay */}
          <View style={styles.stateTag}>
            <Ionicons name="location-sharp" size={8} color="#EA580C" style={{ marginRight: 2 }} />
            <Text style={styles.stateTagTxt}>{spice.stateTag}</Text>
          </View>
        </View>

        {/* Content details block */}
        <View style={styles.cardBody}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={[styles.ratingTxt, isDarkMode && { color: '#F8FAFC' }]}>
              {spice.rating}
            </Text>
            <Text style={[styles.reviewTxt, isDarkMode && { color: '#94A3B8' }]}>
              ({spice.reviews})
            </Text>
          </View>

          <Text style={[styles.spiceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
            {spice.title}
          </Text>

          <Text style={[styles.spiceWeight, isDarkMode && { color: '#94A3B8' }]}>
            {spice.weight}
          </Text>

          {/* Footer containing price and CTA button */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={[styles.spicePrice, isDarkMode && { color: '#F8FAFC' }]}>
                ₹{spice.price}
              </Text>
              <Text style={styles.spiceMrp}>₹{spice.originalPrice}</Text>
            </View>

            {qty === 0 ? (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddSpice(spice)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={14} color="#FFFFFF" />
                <Text style={styles.addBtnTxt}>ADD</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleRemoveSpice(spice.id)}
                >
                  <Ionicons name="remove" size={10} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.stepperQty}>{qty}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleAddSpice(spice)}
                >
                  <Ionicons name="add" size={10} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ProductTransitionWrapper>
    );
  };

  // Distribute items into left and right columns for staggered masonry layout
  const leftColumnItems = useMemo(() => {
    return filteredSpices.filter((_, index) => index % 2 === 0);
  }, [filteredSpices]);

  const rightColumnItems = useMemo(() => {
    return filteredSpices.filter((_, index) => index % 2 !== 0);
  }, [filteredSpices]);

  return (
    <SafeAreaView style={[styles.root, isDarkMode && styles.rootDark]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ─── 1. TOP HEADER BAR ─── */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, isDarkMode && styles.iconBtnDark]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
            Regional Tastes 🌶️
          </Text>
          <Text style={[styles.headerSub, isDarkMode && { color: '#94A3B8' }]}>
            Authentic Local Flavors & Harvest
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, isDarkMode && styles.iconBtnDark]}
            onPress={() => setSearchVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, isDarkMode && styles.iconBtnDark]}
            onPress={openWishlist}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            {totalWishlistItems > 0 && (
              <View style={styles.badgeHeart}>
                <Text style={styles.badgeTxt}>{totalWishlistItems}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, isDarkMode && styles.iconBtnDark]}
            onPress={openCart}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
            {cartCount > 0 && (
              <View style={styles.badgeCart}>
                <Text style={styles.badgeTxt}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>

        {/* ─── 2. HERO SPICE BANNER ─── */}
        <View style={[styles.heroBanner, isDarkMode && styles.heroBannerDark]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={styles.heroBadge}>
              <Ionicons name="ribbon" size={12} color="#FFFFFF" />
              <Text style={styles.heroBadgeTxt}>STONE GROUND • 100% PURE</Text>
            </View>
            <Text style={styles.heroTitle}>Authentic Indian Heritage Spices</Text>
            <Text style={styles.heroSub}>
              Sourced directly from spice farms in Bihar, Kerala, Rajasthan & Kashmir
            </Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' }}
            style={styles.heroImg}
          />
        </View>

        {/* ─── 3. SPICE CATEGORY FILTER CHIPS ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {SPICE_CHIPS.map((chip) => {
            const isActive = chip.id === activeChip;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.chip,
                  isActive && styles.chipActive,
                  isDarkMode && !isActive && styles.chipDark,
                ]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setActiveChip(chip.id);
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipTxt,
                    isActive && styles.chipTxtActive,
                    isDarkMode && !isActive && { color: '#94A3B8' },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── 4. SPICE PRODUCTS GRID HEADER ─── */}
        <View style={styles.gridHeader}>
          <Text style={[styles.gridTitle, isDarkMode && { color: '#F8FAFC' }]}>
            {activeChip === 'all' ? 'All Farm Spices & Masalas' : 'Selected Spice Collection'}
          </Text>
          <Text style={[styles.gridCount, isDarkMode && { color: '#94A3B8' }]}>
            {filteredSpices.length} items
          </Text>
        </View>

        {/* ─── 5. STAGGERED MASONRY GRID (2 COLUMNS) ─── */}
        <View style={styles.masonryGrid}>
          <View style={styles.masonryColumn}>
            {leftColumnItems.map((item, idx) => renderSpiceCard(item, idx * 2))}
          </View>
          <View style={styles.masonryColumn}>
            {rightColumnItems.map((item, idx) => renderSpiceCard(item, idx * 2 + 1))}
          </View>
        </View>

        {/* Bottom Spacer for Tab Bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ─── BOTTOM NAVIGATION ─── */}
      <ExperimentalNavigation
        activeTab="home"
        onTabChange={(tabId) => {
          router.replace(`/${tabId}` as any);
        }}
      />

      {/* ─── SEARCH MODAL ─── */}
      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />

      {/* ─── QUICK ADD SHEET ─── */}
      {quickAddProduct && (
        <QuickAddModal
          visible={quickAddVisible}
          onClose={() => setQuickAddVisible(false)}
          product={quickAddProduct}
          onAddToCart={handleQuickAddToCart}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  rootDark: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconBtnDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  badgeHeart: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4757',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeCart: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  heroBannerDark: {
    backgroundColor: '#431407',
    borderColor: '#7C2D12',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  heroBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#9A3412',
    marginBottom: 4,
    lineHeight: 20,
  },
  heroSub: {
    fontSize: 11,
    color: '#C2410C',
    fontWeight: '600',
    lineHeight: 15,
  },
  heroImg: {
    width: 80,
    height: 80,
    borderRadius: 14,
  },

  // FILTER CHIPS
  chipsRow: {
    gap: 8,
    marginBottom: 16,
    paddingRight: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  chipTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTxtActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  // GRID HEADER
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  gridCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // STAGGERED MASONRY GRID
  masonryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  masonryColumn: {
    width: (width - 44) / 2,
    gap: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardImgWrapper: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#FFF7ED',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  favBtnActive: {
    backgroundColor: '#FFE4E6',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  stateTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stateTagTxt: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EA580C',
  },
  cardBody: {
    padding: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  ratingTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewTxt: {
    fontSize: 10,
    color: '#94A3B8',
  },
  spiceTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
    marginBottom: 4,
  },
  spiceWeight: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  spicePrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  spiceMrp: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
  },
  stepperBtn: {
    padding: 2,
  },
  stepperQty: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
