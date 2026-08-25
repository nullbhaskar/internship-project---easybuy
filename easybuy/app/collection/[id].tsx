import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LIFESTYLE_COLLECTIONS, CollectionProduct } from '../../constants/collections';
import { useEasyBuyTheme } from '../../constants/ThemeContext';
import { useAddress } from '../../context/AddressContext';
import { ProductTransitionWrapper } from '../../components/transition/ProductTransitionWrapper';

const { width } = Dimensions.get('window');

// ─── TACTILE PRODUCT CARD WITH SPRING & PARALLAX SCROLL ENTRANCE ───
const ProductCardItem: React.FC<{
  prod: CollectionProduct;
  index: number;
  isFav: boolean;
  isDarkMode: boolean;
  onToggleFav: () => void;
  onAddToCart: () => void;
}> = ({ prod, isFav, isDarkMode, onToggleFav, onAddToCart }) => {
  return (
    <View>
      <ProductTransitionWrapper
        productId={prod.id}
        imageUrl={prod.image}
        style={[styles.prodCard, isDarkMode && styles.prodCardDark]}
        activeOpacity={0.9}
      >
        <View style={styles.imgWrapper}>
          <Image source={{ uri: prod.image }} style={styles.prodImg} />
          <TouchableOpacity
            style={[styles.heartBtn, isDarkMode && { backgroundColor: 'rgba(15, 23, 42, 0.8)' }]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFav();
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={16}
              color={isFav ? '#FF6B6B' : isDarkMode ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>{prod.tag}</Text>
          </View>
        </View>

        <View style={styles.prodContent}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, isDarkMode && { color: '#F8FAFC' }]}>{prod.rating}</Text>
            <Text style={[styles.reviewsText, isDarkMode && { color: '#94A3B8' }]}>({prod.reviews})</Text>
          </View>

          <Text style={[styles.prodTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
            {prod.title}
          </Text>

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.price, isDarkMode && { color: '#F8FAFC' }]}>{prod.price}</Text>
              <Text style={[styles.oldPrice, isDarkMode && { color: '#64748B' }]}>{prod.originalPrice}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addCartBtn, isDarkMode && { backgroundColor: '#7C3AED' }]}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ProductTransitionWrapper>
    </View>
  );
};

const FALLBACK_COLLECTION = {
  id: 'collection',
  title: 'Collection',
  subtitle: 'Collection items will appear here.',
  tag: 'Curated',
  badgeEmoji: '✨',
  badgeLabel: 'Featured',
  priceText: 'From ₹0',
  startingPrice: 0,
  bgLight: '#E8F5E9',
  bgDark: '#1E1B4B',
  bannerImage: '',
  cardImage: '',
  description: 'Collection items will appear here when loaded.',
  products: [],
};

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const { stateProducts, selectedStateName } = useAddress();

  const collection = LIFESTYLE_COLLECTIONS.find((c) => c.id === id) || FALLBACK_COLLECTION;

  const displayProducts: CollectionProduct[] =
    collection.products && collection.products.length > 0
      ? collection.products
      : stateProducts.map((p) => ({
          id: p.id,
          title: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discountPct,
          tag: p.brand,
          reviews: String(p.reviewCount || '120'),
          rating: String(p.rating || '4.8'),
          image: p.thumbnail,
          description: p.shortDescription,
        }));

  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parallax & Sticky Scroll Animation Drivers
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroImageScale = scrollY.interpolate({
    inputRange: [-100, 0, 200],
    outputRange: [1.25, 1, 0.95],
    extrapolate: 'clamp',
  });

  const heroOverlayOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const toggleFav = (prodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFavorites((prev) => ({ ...prev, [prodId]: !prev[prodId] }));
  };

  const handleAddToCart = (product: CollectionProduct) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setToastMessage(`Added ${product.title} to Cart! 🛍️`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Top Sticky Navigation Bar */}
      <View style={[styles.navBar, isDarkMode && styles.navBarDark]}>
        <TouchableOpacity style={[styles.backBtn, isDarkMode && styles.backBtnDark]} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
          {collection.title}
        </Text>
        <TouchableOpacity style={[styles.shareBtn, isDarkMode && styles.backBtnDark]} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>
      </View>

      {/* Standard Clean ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Lifestyle Hero Banner */}
        <View style={[styles.heroCard, { backgroundColor: isDarkMode ? collection.bgDark : collection.bgLight }]}>
          <Image
            source={{ uri: collection.bannerImage }}
            style={styles.heroImg}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeEmoji}>{collection.badgeEmoji}</Text>
              <Text style={styles.badgeLabel}>{collection.badgeLabel}</Text>
            </View>
            <Text style={styles.heroTitle}>{collection.title}</Text>
            <Text style={styles.heroSub}>{collection.description}</Text>
            <View style={[styles.countPill, isDarkMode && { backgroundColor: '#7C3AED' }]}>
              <Text style={styles.countText}>10 Curated Products • {collection.priceText}</Text>
            </View>
          </View>
        </View>

        {/* 10 Curated Products Grid */}
        <Text style={[styles.sectionHeading, isDarkMode && { color: '#F8FAFC' }]}>Curated Items ({displayProducts.length}) • {selectedStateName}</Text>

        <View style={styles.productsGrid}>
          {displayProducts.map((prod, index) => (
            <ProductCardItem
              key={prod.id}
              prod={prod}
              index={index}
              isFav={!!favorites[prod.id]}
              isDarkMode={isDarkMode}
              onToggleFav={() => toggleFav(prod.id)}
              onAddToCart={() => handleAddToCart(prod)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastCard}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  containerDark: {
    backgroundColor: '#0F172A',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  navBarDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#334155',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  backBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    elevation: 3,
  },
  heroImg: {
    width: '100%',
    height: 220,
  },
  heroOverlay: {
    padding: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#E2E8F0',
    marginBottom: 10,
  },
  countPill: {
    backgroundColor: '#2F6E46',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 14,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  prodCard: {
    width: (width - 44) / 2,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    marginBottom: 4,
  },
  prodCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  imgWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  prodImg: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  tagBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  prodContent: {
    padding: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewsText: {
    fontSize: 9,
    color: '#64748B',
  },
  prodTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 15,
    marginBottom: 8,
    height: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  oldPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addCartBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2F6E46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastCard: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
