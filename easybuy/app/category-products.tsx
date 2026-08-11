import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { QuickAddModal, QuickAddProduct } from '../components/cart/QuickAddModal';
import { ProductTransitionWrapper } from '../components/transition/ProductTransitionWrapper';

const { width } = Dimensions.get('window');

interface ProductColor {
  id: string;
  name: string;
}

interface ProductSize {
  id: string;
  name: string;
}

interface Product {
  id: string;
  productId: string;
  name: string;
  title: string;
  price: number;
  mrp: number;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  availability?: string;
  deliveryTime?: string;
  isQuickDelivery?: boolean;
  thumbnail?: string;
  images?: string[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  brand?: string;
  specifications?: Record<string, string>;
  description?: string;
  city?: string;
  stateName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
}

// Pre-defined category visual meta fallback
const CATEGORY_META: Record<string, { name: string; image: string; gradient: string[] }> = {
  electronics: { name: 'Electronics & Tech', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', gradient: ['#8B5CF6', '#3B82F6'] },
  fashion: { name: 'Fashion & Apparel', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600', gradient: ['#EC4899', '#F43F5E'] },
  beauty: { name: 'Beauty & Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600', gradient: ['#F472B6', '#FB7185'] },
  home_living: { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', gradient: ['#F59E0B', '#D97706'] },
  gaming: { name: 'Gaming Zone', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', gradient: ['#10B981', '#059669'] },
  study_office: { name: 'Study & Office', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600', gradient: ['#6B7280', '#4B5563'] },
  hostel_essentials: { name: 'Hostel Essentials', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600', gradient: ['#3B82F6', '#2563EB'] },
  grocery: { name: 'Pantry & Groceries', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', gradient: ['#10B981', '#047857'] },
  kitchen: { name: 'Kitchen & Dining', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600', gradient: ['#F97316', '#EA580C'] },
};

export default function CategoryProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = (params.categoryId as string) || 'electronics';

  const { isDarkMode } = useEasyBuyTheme();
  const { addToCart, openCart, totalItems: cartCount } = useCart();
  const { toggleWishlist, isInWishlist, totalWishlistItems, openWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  // Quick Add modal
  const [quickAddProduct, setQuickAddProduct] = useState<QuickAddProduct | null>(null);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  // Animation values
  const pageFadeAnim = useRef(new Animated.Value(0)).current;
  const skeletonFade = useRef(new Animated.Value(0.5)).current;

  // Pulse skeleton loader
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonFade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonFade, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(pageFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      const qRef = query(collection(db, 'products'), where('categoryId', '==', categoryId));
      const snap = await getDocs(qRef);
      const items: Product[] = [];
      snap.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(items);
      setLoading(false);
    } catch (err) {
      console.log('Error fetching category products:', err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryId]);

  // Dynamically extract unique subcategories from loaded products for filtering
  const dynamicSubcategories = useMemo(() => {
    const subcats = new Map<string, string>();
    products.forEach((p) => {
      if (p.subcategoryId && p.subcategoryName) {
        subcats.set(p.subcategoryId, p.subcategoryName);
      }
    });
    const list = [{ id: 'all', name: 'All Items' }];
    subcats.forEach((name, id) => {
      list.push({ id, name });
    });
    return list;
  }, [products]);

  // Filtered products list based on search query and selected subcategory
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubcat = selectedSubcategory === 'all' || p.subcategoryId === selectedSubcategory;
      return matchesSearch && matchesSubcat;
    });
  }, [products, searchQuery, selectedSubcategory]);

  const handleQuickAddPress = (prod: Product) => {
    setQuickAddProduct({
      id: prod.id,
      title: prod.title || prod.name,
      price: `₹${prod.price}`,
      image: prod.thumbnail || (prod.images && prod.images[0]) || '',
    });
    setQuickAddVisible(true);
  };

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
  };

  // Visual header metadata
  const meta = CATEGORY_META[categoryId] || {
    name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    gradient: ['#6B7280', '#374151'],
  };

  return (
    <SafeAreaView style={[styles.root, isDarkMode && styles.rootDark]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ─── STICKY HEADER ─── */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, isDarkMode && styles.iconBtnDark]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
            {meta.name}
          </Text>
          <Text style={styles.headerSub}>
            {loading ? 'Loading...' : `${products.length} products available`}
          </Text>
        </View>

        <View style={styles.headerRight}>
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

      {/* ─── LOADING SKELETON STATE ─── */}
      {loading && (
        <ScrollView style={styles.scrollBody}>
          <Animated.View style={[styles.heroSkeleton, { opacity: skeletonFade }]} />
          <View style={styles.searchBarSkeleton} />
          <View style={styles.chipsRowSkeleton}>
            <View style={styles.chipSkeleton} />
            <View style={styles.chipSkeleton} />
            <View style={styles.chipSkeleton} />
          </View>
          <View style={styles.gridSkeleton}>
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
            <Animated.View style={[styles.cardSkeleton, { opacity: skeletonFade }]} />
          </View>
        </ScrollView>
      )}

      {/* ─── ERROR STATE ─── */}
      {!loading && error && (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={60} color="#EA580C" />
          <Text style={[styles.errorTitle, isDarkMode && { color: '#F8FAFC' }]}>Connection Error</Text>
          <Text style={styles.errorSubTitle}>Could not load products. Please check your network connection.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCategoryProducts}>
            <Text style={styles.retryBtnTxt}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── MAIN CONTENT ─── */}
      {!loading && !error && (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollBody}
          style={{ opacity: pageFadeAnim }}
        >
          {/* Hero Banner Banner */}
          <View style={styles.heroBanner}>
            <Image source={{ uri: meta.image }} style={styles.heroImg} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroCategoryTag}>CATALOG</Text>
              <Text style={styles.heroTitleText}>{meta.name}</Text>
              <Text style={styles.heroSubText}>Premium handpicked products from regional stores</Text>
            </View>
          </View>

          {/* Search bar inside products page */}
          <View style={[styles.searchBarContainer, isDarkMode && styles.searchBarDark]}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              placeholder="Search products, brands..."
              placeholderTextColor="#94A3B8"
              style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Dynamic subcategory chips filter */}
          {dynamicSubcategories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {dynamicSubcategories.map((subcat) => {
                const isActive = selectedSubcategory === subcat.id;
                return (
                  <TouchableOpacity
                    key={subcat.id}
                    style={[
                      styles.chip,
                      isActive && styles.chipActive,
                      isDarkMode && !isActive && styles.chipDark,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelectedSubcategory(subcat.id);
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
                      {subcat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Product count tag */}
          <View style={styles.gridHeader}>
            <Text style={[styles.gridTitle, isDarkMode && { color: '#F8FAFC' }]}>
              {searchQuery.length > 0 ? 'Search Results' : 'Explore Catalog'}
            </Text>
            <Text style={styles.gridCount}>
              {filteredProducts.length} items found
            </Text>
          </View>

          {/* Staggered Masonry Grid Layout */}
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>No matching items</Text>
              <Text style={styles.emptySub}>Try searching for another keyword or change your filters.</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((prod) => {
                const isFav = isInWishlist(prod.id);
                const imageUrl = prod.thumbnail || (prod.images && prod.images[0]) || '';
                return (
                  <ProductTransitionWrapper
                    key={prod.id}
                    productId={prod.id}
                    imageUrl={imageUrl}
                    style={[styles.card, isDarkMode && styles.cardDark]}
                    activeOpacity={0.92}
                  >
                    {/* Image Box */}
                    <View style={styles.cardImgWrapper}>
                      <Image
                        source={{ uri: prod.thumbnail || (prod.images && prod.images[0]) || '' }}
                        style={styles.cardImg}
                        resizeMode="cover"
                      />

                      {/* Wishlist Icon Overlay */}
                      <TouchableOpacity
                        style={[styles.favBtn, isFav && styles.favBtnActive]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          toggleWishlist({
                            id: prod.id,
                            title: prod.title || prod.name,
                            price: prod.price.toString(),
                            image: prod.thumbnail || (prod.images && prod.images[0]) || '',
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
                      {prod.discountPercentage && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountTxt}>{prod.discountPercentage}% OFF</Text>
                        </View>
                      )}

                      {/* Location State tag overlay */}
                      {prod.stateName && (
                        <View style={styles.stateTag}>
                          <Ionicons name="location-sharp" size={8} color="#EA580C" style={{ marginRight: 2 }} />
                          <Text style={styles.stateTagTxt}>{prod.stateName}</Text>
                        </View>
                      )}
                    </View>

                    {/* Card Content Body */}
                    <View style={styles.cardBody}>
                      {prod.rating && (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={11} color="#F59E0B" />
                          <Text style={[styles.ratingTxt, isDarkMode && { color: '#F8FAFC' }]}>
                            {prod.rating}
                          </Text>
                          {prod.reviewCount && (
                            <Text style={styles.reviewTxt}>({prod.reviewCount})</Text>
                          )}
                          {prod.isQuickDelivery && (
                            <View style={styles.quickDeliveryBadge}>
                              <Ionicons name="flash" size={8} color="#EA580C" />
                              <Text style={styles.quickDeliveryTxt}>FAST</Text>
                            </View>
                          )}
                        </View>
                      )}

                      <Text style={[styles.brandName, isDarkMode && { color: '#94A3B8' }]}>
                        {prod.brand || 'Premium'}
                      </Text>

                      <Text style={[styles.spiceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
                        {prod.title || prod.name}
                      </Text>

                      <Text style={styles.deliveryEstimate}>
                        Deliver within: {prod.deliveryTime || '15 mins'}
                      </Text>

                      {/* Card Footer with Price and ADD Action */}
                      <View style={styles.cardFooter}>
                        <View>
                          <Text style={[styles.spicePrice, isDarkMode && { color: '#F8FAFC' }]}>
                            ₹{prod.price}
                          </Text>
                          {prod.mrp && prod.mrp > prod.price && (
                            <Text style={styles.spiceMrp}>₹{prod.mrp}</Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => handleQuickAddPress(prod)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="add" size={14} color="#FFFFFF" />
                          <Text style={styles.addBtnTxt}>ADD</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </ProductTransitionWrapper>
                );
              })}
            </View>
          )}

          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      )}

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
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 10.5,
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
    height: 130,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  heroCategoryTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroSubText: {
    fontSize: 10.5,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  searchBarDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
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
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
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
    height: 135,
    position: 'relative',
    backgroundColor: '#F8FAFC',
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
    fontSize: 8.5,
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
    fontSize: 8.5,
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
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewTxt: {
    fontSize: 9.5,
    color: '#94A3B8',
  },
  quickDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  quickDeliveryTxt: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#EA580C',
    marginLeft: 1,
  },
  brandName: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  spiceTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 16,
    marginBottom: 4,
    height: 32,
  },
  deliveryEstimate: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  spicePrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  spiceMrp: {
    fontSize: 9.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addBtnTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // SKELETON LOADERS
  heroSkeleton: {
    height: 130,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  searchBarSkeleton: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  chipsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chipSkeleton: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardSkeleton: {
    width: (width - 44) / 2,
    height: 240,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },

  // ERROR & EMPTY STATES
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  errorSubTitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
