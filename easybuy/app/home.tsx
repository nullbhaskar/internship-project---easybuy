import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Animated,
  Easing,
  AppState,
} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';
import { getHumanTimeGreeting } from '../constants/greetings';
import { getRandomOpener } from '../constants/openers';
import { SearchModal } from '../components/search/SearchModal';
import { LIFESTYLE_COLLECTIONS } from '../constants/collections';
import { getSmartTrendingBannersAsync, getSmartTrendingBannersSync, SmartTrendingBanner } from '../constants/trendingEngine';
import { QuickAddModal, QuickAddProduct } from '../components/cart/QuickAddModal';
import { AnimatedThemeToggle } from '../components/ui/AnimatedThemeToggle';
import { LocationPickerModal } from '../components/location/LocationPickerModal';
import { EditorialPromotionalBanner } from '../components/EditorialPromotionalBanner';
import { useAddress } from '../context/AddressContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProductTransition } from '../context/ProductTransitionContext';
import { QuickBuySection } from '../components/QuickBuySection';
import { SpinWinModal } from '../components/SpinWinModal';
import { AISmartFeed } from '../components/ai/AISmartFeed';
import { VoiceBuyModal } from '../components/ai/VoiceBuyModal';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { SpatialDrawerWrapper, SpatialDrawerRef } from '../components/navigation/SpatialDrawerWrapper';
import { WalletModal } from '../components/wallet/WalletModal';
import { LoyaltyModal } from '../components/loyalty/LoyaltyModal';

const { width } = Dimensions.get('window');

// ─── BRAND DESIGN TOKENS ───
const THEME = {
  PRIMARY: '#2F6E49', // Deep Green
  SECONDARY: '#89B882', // Mint Accent
  ACCENT: '#F6CC63', // Warm Amber Gold
  BG_CREAM: '#FAF7F2', // Warm Champagne Ivory Ambient Background
  BG_DARK: '#090D16', // Pitch obsidian black from reference mockup
  CARD_WHITE: '#FFFFFF',
  CARD_DARK: '#121927', // Reference mockup card background
  BORDER_DARK: '#1F293D', // Muted dark border
  TEXT_DARK: '#0F172A',
  TEXT_MUTED: '#64748B',
  CORAL: '#FF6B6B',
  PURPLE: '#8E44AD', // Lavender Highlight
  SKY_BLUE: '#3498DB',
};

const SEARCH_TICKERS = [
  'Search "Mechanical Keyboard"',
  'Search "Running Shoes"',
  'Search "Coffee Mug"',
  'Search "Hostel Lamp"',
  'Ask AI: Hostel setup under ₹999...',
];

const DAILY_QUOTES = [
  "What's the plan for today?",
  "Let's find something you'll actually use.",
  "Today's cart might be dangerous.",
  "Budget says no. Heart says yes.",
  "Only good finds today.",
  "You deserve something nice.",
];

import { generateFullIndianCatalog } from '../constants/mockDataGenerator';

const catalog = generateFullIndianCatalog();

// ─── QUICK COMMERCE (QUICKBUY 10-20 MIN DARK CAPSULE) ───
const QUICKBUY_GRID_ITEMS = [
  { id: 'qb1', name: 'Milk', time: '10–20 min', bg: '#E0F2FE', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb2', name: 'Bread', time: '10–20 min', bg: '#FFEDD5', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb3', name: 'Eggs', time: '10–20 min', bg: '#FEF3C7', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb4', name: 'Fruits', time: '10–20 min', bg: '#DCFCE7', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb5', name: 'Drinks', time: '10–20 min', bg: '#E0F2FE', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb6', name: 'Medicine', time: '10–20 min', bg: '#F3E8FF', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80' },
  { id: 'qb7', name: 'More', isMore: true, bg: '#1E293B', icon: 'grid-outline' },
];

// ─── 2 AM DAILY ROTATING FLASH SALE CATALOG ───
const DAILY_FLASH_DEALS = [
  {
    id: 'flash_deal_1',
    title: 'Sneaker Pro X1',
    desc: 'Ultra-light responsive cushioning for modern urban runners.',
    price: '₹2,999',
    oldPrice: '₹4,999',
    discount: '-40% OFF',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    tag: 'LIMITED DROP',
  },
  {
    id: 'flash_deal_2',
    title: 'Wireless ANC Headphones',
    desc: 'Hi-Fi studio acoustics with 40h playtime & active noise cancel.',
    price: '₹1,999',
    oldPrice: '₹4,499',
    discount: '-55% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    tag: '2 AM SPECIAL',
  },
  {
    id: 'flash_deal_3',
    title: 'Smart Watch Ultra Pro',
    desc: 'AMOLED retina display, dual GPS & 24/7 heart health monitoring.',
    price: '₹2,499',
    oldPrice: '₹5,999',
    discount: '-58% OFF',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    tag: 'HOT DROP',
  },
  {
    id: 'flash_deal_4',
    title: 'Italian Espresso Coffee Maker',
    desc: '15-bar high pressure pump for authentic velvety espresso drops.',
    price: '₹3,299',
    oldPrice: '₹6,999',
    discount: '-52% OFF',
    image: 'https://images.unsplash.com/photo-1517668808822-9eaa02ae2d35?w=800&auto=format&fit=crop&q=80',
    tag: 'DAILY HARVEST',
  },
  {
    id: 'flash_deal_5',
    title: 'Minimalist Leather Backpack',
    desc: 'Water-resistant vegan leather with padded laptop vault.',
    price: '₹1,499',
    oldPrice: '₹3,499',
    discount: '-57% OFF',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    tag: 'SUPER SAVER',
  },
];

// ─── MOOD CATEGORY CHIPS ───
const MOOD_CHIPS = [
  { id: 'explore_all', label: 'Explore All', sub: 'Categorized items', icon: 'grid', iconBg: '#FEF3C7', iconColor: '#D97706' },
  { id: 'regional', label: 'Regional Tastes', sub: 'Local favourites', icon: 'location-sharp', iconBg: '#FFEDD5', iconColor: '#EA580C' },
  { id: 'quickbuy', label: '10-Min Delivery', sub: 'Super fast', icon: 'flash', iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { id: 'offers', label: 'Offers', sub: 'Best deals for you', icon: 'pricetag', iconBg: '#F3E8FF', iconColor: '#9333EA' },
];

// ─── SHOP BY VIBE (PASTEL GRID CARDS WITH SUBTITLES) ───
const VIBE_CARDS = [
  { id: 'v1', title: 'Late Night Essentials', sub: 'Quick & easy midnight snacks', icon: 'moon-outline', emoji: '🌙', bg: '#F3E8FF', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80', collectionId: 'late_night_munchies' },
  { id: 'v2', title: 'Healthy Living', sub: 'Eat clean, feel awesome', icon: 'leaf-outline', emoji: '🍃', bg: '#DCFCE7', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=80', collectionId: 'healthy_living' },
  { id: 'v3', title: 'Study Fuel', sub: 'Stay sharp, stay powered', icon: 'book-outline', emoji: '📖', bg: '#FEF9C3', image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=80', collectionId: 'study_fuel' },
  { id: 'v4', title: 'Party Ready', sub: 'Snacks that bring people together', icon: 'musical-notes-outline', emoji: '🎵', bg: '#FCE7F3', image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&auto=format&fit=crop&q=80', collectionId: 'party_ready' },
  { id: 'v5', title: 'Tea Time', sub: 'Perfect for every sip', icon: 'cafe-outline', emoji: '☕', bg: '#E0F2FE', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80', collectionId: 'tea_time' },
];

const getValidImageUrl = (uri?: string, fallbackIndex: number = 0) => {
  const fallbacks = [
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80', // Milk
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', // Bread
    'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80', // Eggs
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80', // Fruits
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', // Drinks
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', // Sneaker
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', // Headphones
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', // Watch
  ];
  if (uri && typeof uri === 'string' && uri.startsWith('http') && !uri.endsWith('?w=0')) {
    return uri;
  }
  return fallbacks[Math.abs(fallbackIndex) % fallbacks.length];
};

// ─── RECOMMENDED FOR YOU PRODUCTS ───
const RECOMMENDED_PRODUCTS = catalog.slice(0, 16).map((p, idx) => ({
  id: p.id,
  title: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  discount: p.discountPct,
  tag: p.stateName,
  rating: p.rating,
  image: getValidImageUrl(p.thumbnail || (p.images && p.images[0]), idx),
}));

// ─── CURATED LIFESTYLE COLLECTIONS ───
const CURATED_COLLECTIONS = [
  { id: 'c1', title: 'State Heritage Sweets & Spices', tag: 'Curated', priceText: 'From ₹129', bg: '#FFF3E0', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400' },
  { id: 'c2', title: 'Organic Farm Fresh Veggies', tag: 'Farm Harvest', priceText: 'From ₹35', bg: '#DCFCE7', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
];

// ─── RECENTLY VIEWED PRODUCTS ───
const RECENTLY_VIEWED = catalog.slice(0, 4).map((p, idx) => ({
  id: p.id,
  title: p.name,
  tag: p.brand,
  price: p.price,
  image: getValidImageUrl(p.thumbnail || (p.images && p.images[0]), idx + 3),
}));

// ─── TACTILE SPRING PRESS CARD COMPONENT ───
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SpringCard: React.FC<{
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
}> = ({ onPress, style, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 7,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.92}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[style, { transform: [{ scale: scaleAnim }] }]}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

// ─── ZOOM CARD — gentle zoom-in on finger touch (hover feel) ───
const ZoomCard: React.FC<{
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
}> = ({ onPress, style, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const zoomIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.03,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const zoomOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.92}
      onPressIn={zoomIn}
      onPressOut={zoomOut}
      onPress={onPress}
      style={[style, { transform: [{ scale: scaleAnim }] }]}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};
// ─── GEN-Z EDITORIAL PRODUCT CARD FOR DISCOVERY RAILS ───
const GenZProductCard: React.FC<{
  item: {
    id: string;
    title: string;
    price: string | number;
    originalPrice?: string | number;
    rating?: string | number;
    tag?: string;
    image: string;
    discount?: string;
  };
  isDarkMode: boolean;
  isFav?: boolean;
  onToggleFav?: () => void;
  onPress?: () => void;
  onAddToCart?: () => void;
}> = ({ item, isDarkMode, isFav, onToggleFav, onPress, onAddToCart }) => {
  const containerRef = useRef<View>(null);
  const { setOrigin, overlayRef } = useProductTransition();
  const [imgSrc, setImgSrc] = useState(() => getValidImageUrl(item.image, item.title ? item.title.length : 0));

  useEffect(() => {
    setImgSrc(getValidImageUrl(item.image, item.title ? item.title.length : 0));
  }, [item.image, item.title]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y, width, height) => {
        if (width === 0 || height === 0) {
          onPress?.();
          return;
        }
        const origin = {
          x,
          y,
          width,
          height,
          imageUrl: imgSrc,
          productId: item.id,
        };
        setOrigin(origin);
        overlayRef.current?.animateForward(origin, () => {});
        onPress?.();
      });
    } else {
      onPress?.();
    }
  };

  return (
    <View ref={containerRef} collapsable={false}>
      <SpringCard
        style={[
          styles.gzCard,
          isDarkMode ? styles.gzCardDark : styles.gzCardLight,
        ]}
        onPress={handlePress}
      >
        <View style={styles.gzImgWrap}>
        <Image
          source={{ uri: imgSrc }}
          style={styles.gzImg}
          resizeMode="cover"
          onError={() => {
            setImgSrc('https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80');
          }}
        />
        
        {/* Wishlist Heart */}
        {onToggleFav && (
          <TouchableOpacity
            style={[styles.gzFavBtn, isDarkMode && { backgroundColor: 'rgba(15, 23, 42, 0.8)' }]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFav();
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={14}
              color={isFav ? '#EF4444' : isDarkMode ? '#F8FAFC' : '#64748B'}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.gzContent}>
        <Text style={[styles.gzTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.gzRatingRow}>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <Text style={[styles.gzRatingText, isDarkMode && { color: '#CBD5E1' }]}>{item.rating || '4.8'}</Text>
        </View>

        <View style={styles.gzPriceAddRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.gzPrice, isDarkMode && { color: '#F8FAFC' }]}>
              {typeof item.price === 'number' ? `₹${item.price}` : item.price}
            </Text>
            {item.originalPrice && (
              <Text style={styles.gzOldPrice}>
                {typeof item.originalPrice === 'number' ? `₹${item.originalPrice}` : item.originalPrice}
              </Text>
            )}
          </View>

          {onAddToCart && (
            <TouchableOpacity
              style={styles.gzAddBtn}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
              <Text style={styles.gzAddBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      </SpringCard>
    </View>
  );
};

// ─── TIME-AWARE DYNAMIC DISCOVERY HELPER ───
const getTimeAwareSection = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return {
      tag: 'AM MORNING GLOW ☀️',
      title: 'Radiant Morning & Organic Pantry',
      sub: 'Start your day with organic oats, cold-pressed juices & daily bakery',
      collectionId: 'healthy_living',
      bgLight: '#ECFDF5',
      bgDark: '#064E3B',
      badgeColor: '#10B981',
      products: [
        { id: 'ta_m1', title: 'Quaker Rolled Oats 1kg', price: '₹199', image: 'https://images.unsplash.com/photo-1517093728432-a0440f8d4514?w=500', rating: 4.8, tag: 'ORGANIC' },
        { id: 'ta_m2', title: 'Raw Pressery Orange Juice 1L', price: '₹199', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500', rating: 4.9, tag: 'COLD-PRESSED' },
        { id: 'ta_m3', title: 'Happilo Almonds 500g', price: '₹425', image: 'https://images.unsplash.com/photo-1508061252478-f71694f57c50?w=500', rating: 4.9, tag: 'PROTEIN' },
        { id: 'ta_m4', title: 'True Elements Chia Seeds 250g', price: '₹185', image: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500', rating: 4.8, tag: 'SUPERFOOD' },
      ],
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      tag: 'NOON POWER EDIT ⚡',
      title: 'Desk Focus & Artisanal Energy',
      sub: 'Stay sharp with instant coffee, dark chocolate & makhana',
      collectionId: 'study_fuel',
      bgLight: '#EFF6FF',
      bgDark: '#1E3A8A',
      badgeColor: '#3B82F6',
      products: [
        { id: 'ta_a1', title: 'Nescafe Classic Coffee 200g', price: '₹340', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', rating: 4.9, tag: 'INSTANT FOCUS' },
        { id: 'ta_a2', title: 'Amul 75% Dark Chocolate', price: '₹130', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', rating: 4.8, tag: 'BRAIN BOOST' },
        { id: 'ta_a3', title: 'Farmley Roasted Makhana', price: '₹149', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500', rating: 4.8, tag: 'HEALTHY CRUNCH' },
        { id: 'ta_a4', title: 'Monster Energy Drink 350ml', price: '₹125', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', rating: 4.8, tag: 'ENERGY' },
      ],
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      tag: 'PM REVENGE GLOW 🌆',
      title: 'Chai Time & Evening Bites',
      sub: 'Hot tea, crisp rusks, party chips & chilled beverages',
      collectionId: 'tea_time',
      bgLight: '#FAF5FF',
      bgDark: '#581C87',
      badgeColor: '#A855F7',
      products: [
        { id: 'ta_e1', title: 'Tata Tea Gold Assam 500g', price: '₹310', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', rating: 4.9, tag: 'RICH AROMA' },
        { id: 'ta_e2', title: 'Britannia Elaichi Rusk 400g', price: '₹65', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500', rating: 4.8, tag: 'CHAI PAIR' },
        { id: 'ta_e3', title: 'Doritos Cheese Nachos 150g', price: '₹95', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', rating: 4.9, tag: 'PARTY MIX' },
        { id: 'ta_e4', title: 'Coca-Cola Bottle 2.25L', price: '₹99', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', rating: 4.9, tag: 'CHILLED' },
      ],
    };
  } else {
    return {
      tag: 'MIDNIGHT MUNCHIES 🌙',
      title: 'Late Night Cravings & Secret Treats',
      sub: 'Spicy ramen, ice cream, chocolates & energy drinks in 10 mins',
      collectionId: 'late_night_munchies',
      bgLight: '#FDF2F8',
      bgDark: '#701A75',
      badgeColor: '#EC4899',
      products: [
        { id: 'ta_n1', title: 'Nissin Geki Korean Spicy Ramen', price: '₹75', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', rating: 4.9, tag: 'SPICY RAMEN' },
        { id: 'ta_n2', title: 'Cadbury Dairy Milk Silk 150g', price: '₹175', image: 'https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=500', rating: 4.9, tag: 'SILK SWEET' },
        { id: 'ta_n3', title: 'Amul Choco Crunch Ice Cream', price: '₹220', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500', rating: 4.9, tag: 'CHILLED TREAT' },
        { id: 'ta_n4', title: 'Red Bull Energy Drink Can', price: '₹125', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500', rating: 4.8, tag: 'NIGHT ENERGY' },
      ],
    };
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const {
    selectedAddress,
    selectedStateId,
    selectedStateName,
    stateProducts,
    openLocationModal,
    detectCurrentLocationGPS,
    isLoadingLocation,
  } = useAddress();
  const { isDarkMode, toggleDarkMode } = useEasyBuyTheme();
  const { openCart, totalItems, addToCart } = useCart();
  const { openWishlist, totalWishlistItems, toggleWishlist, isInWishlist } = useWishlist();
  const [userName, setUserName] = useState('Bhaskar');
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const stateRecommendedProducts = (stateProducts.length >= 4 ? stateProducts : catalog)
    .slice(0, 16)
    .map((p) => ({
      id: p.id,
      title: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discountPct,
      tag: p.stateName,
      rating: p.rating,
      image: p.thumbnail,
    }));

  const stateQuickBuyItems = (
    stateProducts.filter((p) => p.categoryId === 'quickbuy').length >= 3
      ? stateProducts.filter((p) => p.categoryId === 'quickbuy')
      : catalog.filter((p) => p.categoryId === 'quickbuy')
  )
    .slice(0, 6)
    .map((p, idx) => ({
      id: p.id,
      name: p.name,
      image: p.thumbnail,
      icon: 'flash-outline',
      bg: idx % 2 === 0 ? '#E8F5E9' : '#FFF3E0',
    }));

  // ─── Live GPS & World Location State ───
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [spinWinModalVisible, setSpinWinModalVisible] = useState(false);
  const [voiceBuyVisible, setVoiceBuyVisible] = useState(false);
  const [userWeather, setUserWeather] = useState('72° Sunny');

  // ─── Human Indian Time-Aware Greeting Engine ───
  const [greetingText, setGreetingText] = useState('👋 Yo, Bhaskar!');
  const [subtitleText, setSubtitleText] = useState('Let’s get today rolling.');
  const greetingFadeAnim = useRef(new Animated.Value(1)).current;
  const greetingTranslateY = useRef(new Animated.Value(0)).current;

  const loadFreshGreeting = async () => {
    const data = await getHumanTimeGreeting(userName);
    Animated.parallel([
      Animated.timing(greetingFadeAnim, { toValue: 0, duration: 150, useNativeDriver: false }),
      Animated.timing(greetingTranslateY, { toValue: -8, duration: 150, useNativeDriver: false }),
    ]).start(() => {
      setGreetingText(data.greeting);
      setSubtitleText(data.subtitle);
      greetingTranslateY.setValue(8);
      Animated.parallel([
        Animated.timing(greetingFadeAnim, { toValue: 1, duration: 280, useNativeDriver: false }),
        Animated.timing(greetingTranslateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.back(1.2)), useNativeDriver: false }),
      ]).start();
    });
  };

  const spatialDrawerRef = useRef<SpatialDrawerRef>(null);
  const menuBtnScale = useRef(new Animated.Value(1)).current;
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [loyaltyModalVisible, setLoyaltyModalVisible] = useState(false);

  const handleMenuBtnPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.sequence([
      Animated.timing(menuBtnScale, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.timing(menuBtnScale, { toValue: 1.0, duration: 60, useNativeDriver: true }),
    ]).start(() => {
      spatialDrawerRef.current?.toggleDrawer();
    });
  };

  useEffect(() => {
    loadFreshGreeting();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadFreshGreeting();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [userName]);

  // State Code Resolver Helper
  const getStateCode = (stateName?: string): string => {
    const name = (stateName || selectedAddress?.state || selectedStateName || 'Bihar').toLowerCase();
    if (name.includes('kerala')) return 'KL';
    if (name.includes('bihar')) return 'BR';
    if (name.includes('punjab')) return 'PB';
    if (name.includes('bengal')) return 'WB';
    if (name.includes('rajasthan')) return 'RJ';
    if (name.includes('delhi')) return 'DL';
    return 'BR'; // Default to Bihar if unspecified
  };

  // ─── Dynamic Smart Trending Slidable Banners State ───
  const [trendingBanners, setTrendingBanners] = useState<SmartTrendingBanner[]>(() =>
    getSmartTrendingBannersSync({ userStateCode: getStateCode(selectedAddress?.state || selectedStateName) })
  );
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isBannerLoading, setIsBannerLoading] = useState(false);
  const skeletonPulseAnim = useRef(new Animated.Value(0.4)).current;

  // Real-time 60fps ScrollX for Liquid Morphing Dot Travel
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const vibeScrollX = useRef(new Animated.Value(0)).current;
  const bannerFadeAnim = useRef(new Animated.Value(1)).current;
  const bannerScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    async function loadStateBanners() {
      setIsBannerLoading(true);
      const stateCode = getStateCode(selectedAddress?.state || selectedStateName);
      const banners = await getSmartTrendingBannersAsync({ userStateCode: stateCode });
      setTrendingBanners(banners);
      setActiveBannerIndex(0);
      bannerScrollX.setValue(0);
      bannerFadeAnim.setValue(1);
      setIsBannerLoading(false);
    }
    loadStateBanners();
  }, [selectedAddress?.state, selectedStateName]);

  // ─── REANIMATED WORKLET SCROLL ENGINE (TRUE 60FPS UI THREAD MOTION) ───
  const reanimatedScrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      reanimatedScrollY.value = event.contentOffset.y;
    },
  });

  // 1. Collapsing iOS Header Subtitle Fade & Compression
  const reanimatedHeaderSubStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      reanimatedScrollY.value,
      [0, 50],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      reanimatedScrollY.value,
      [0, 50],
      [0, -10],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // 2. Floating Search Bar Scroll Compression
  const reanimatedSearchCapsuleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      reanimatedScrollY.value,
      [0, 70],
      [1, 0.965],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      reanimatedScrollY.value,
      [0, 70],
      [0, -4],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  // 3. Hero Editorial Parallax Movement
  const reanimatedHeroParallaxStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      reanimatedScrollY.value,
      [0, 350],
      [1.0, 1.012],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  // 4. Shop by Vibe Reveal Motion
  const reanimatedVibeStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [120, 400],
      [18, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [120, 320],
      [0.75, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [120, 320],
      [0.98, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  // 5. Section Depth Worklets
  const reanimatedQuickBuyStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [40, 250],
      [10, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [40, 200],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [40, 200],
      [0.985, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedTimeAwareStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [300, 600],
      [10, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [300, 500],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [300, 500],
      [0.985, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedCuratedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [550, 850],
      [10, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [550, 750],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [550, 750],
      [0.985, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedFlashDealsStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [800, 1100],
      [10, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [800, 1000],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [800, 1000],
      [0.985, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedRecommendedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [1200, 1500],
      [10, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [1200, 1400],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [1200, 1400],
      [0.985, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedRecentlyViewedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [1500, 1800],
      [10, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [1500, 1700],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [1500, 1700],
      [0.985, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedGamificationStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [950, 1250],
      [18, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [950, 1150],
      [0.8, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [950, 1150],
      [0.98, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedPlusStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [1350, 1650],
      [12, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [1350, 1550],
      [0.85, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [1350, 1550],
      [0.98, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const reanimatedTrustStripStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [1600, 1850],
      [8, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [1600, 1780],
      [0.9, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const reanimatedCuratedImgStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [500, 950],
      [-8, 8],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  const reanimatedFlashImgStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      reanimatedScrollY.value,
      [750, 1200],
      [-10, 10],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  // 1. Cinematic Staggered Entrance
  const headerEntranceTranslateY = useRef(new Animated.Value(18)).current;
  const headerEntranceOpacity = useRef(new Animated.Value(0)).current;
  const searchEntranceScale = useRef(new Animated.Value(0.97)).current;
  const searchEntranceOpacity = useRef(new Animated.Value(0)).current;
  const aiFeedEntranceScale = useRef(new Animated.Value(0.97)).current;
  const aiFeedEntranceOpacity = useRef(new Animated.Value(0)).current;
  const quickBuyEntranceTranslateY = useRef(new Animated.Value(20)).current;
  const quickBuyEntranceOpacity = useRef(new Animated.Value(0)).current;

  // 2. Micro-Motions & Micro-Interactions
  const locationPinPulseScale = useRef(new Animated.Value(1)).current;
  const quickBuyGlowScale = useRef(new Animated.Value(1)).current;
  const cartBadgeSpringScale = useRef(new Animated.Value(1)).current;
  const heartSpringScale = useRef(new Animated.Value(1)).current;

  // Run Staggered Entrance Sequence Once on Mount (~600ms fast sequence)
  useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(headerEntranceTranslateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(headerEntranceOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(searchEntranceScale, { toValue: 1, duration: 360, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
        Animated.timing(searchEntranceOpacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(aiFeedEntranceScale, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(aiFeedEntranceOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(quickBuyEntranceTranslateY, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(quickBuyEntranceOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Location pin pulse ONLY when location is detected/changed
  useEffect(() => {
    if (selectedAddress?.state || selectedStateName) {
      Animated.sequence([
        Animated.timing(locationPinPulseScale, { toValue: 1.25, duration: 220, useNativeDriver: true }),
        Animated.spring(locationPinPulseScale, { toValue: 1.0, friction: 4, tension: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedAddress?.state, selectedStateName]);

  // QuickBuy Lightning subtle shimmer glow loop (every 7s)
  useEffect(() => {
    const glowInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(quickBuyGlowScale, { toValue: 1.12, duration: 300, useNativeDriver: true }),
        Animated.spring(quickBuyGlowScale, { toValue: 1.0, friction: 5, tension: 120, useNativeDriver: true }),
      ]).start();
    }, 7000);
    return () => clearInterval(glowInterval);
  }, []);

  // Cart Badge Spring Trigger
  const triggerCartBadgeSpring = () => {
    Animated.sequence([
      Animated.timing(cartBadgeSpringScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.spring(cartBadgeSpringScale, { toValue: 1.0, friction: 3.5, tension: 180, useNativeDriver: true }),
    ]).start();
  };

  // 🕒 Smooth 1 ➔ 2 ➔ 3 ➔ 4 forward slide & fade-reset back to 1
  // Dwell time: 7.5 seconds per card (slower & calmer), out of sync with search ticker!
  useEffect(() => {
    if (!trendingBanners || trendingBanners.length <= 1) return;

    let currentIndex = 0;
    const initialTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < trendingBanners.length - 1) {
          // Slide smoothly forward 1 ➔ 2 ➔ 3 ➔ 4
          currentIndex++;
          bannerScrollViewRef.current?.scrollTo({
            x: currentIndex * (width - 32),
            animated: true,
          });
        } else {
          // At end of loop (Dot 4): Fade out softly ➔ Reset to Dot 1 ➔ Fade back in!
          Animated.timing(bannerFadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: false,
          }).start(() => {
            currentIndex = 0;
            bannerScrollViewRef.current?.scrollTo({ x: 0, animated: false });
            bannerScrollX.setValue(0);
            setActiveBannerIndex(0);
            Animated.timing(bannerFadeAnim, {
              toValue: 1,
              duration: 450,
              useNativeDriver: false,
            }).start();
          });
        }
      }, 7500);

      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, [trendingBanners]);

  // ─── Live Flash Deals Countdown Timer ───
  const [secondsLeft, setSecondsLeft] = useState(8142); // 02:15:42

  // ─── Shared Element Transition Animation ───
  const liftAnim = useRef(new Animated.Value(1)).current;
  const morphAnim = useRef(new Animated.Value(0)).current;

  const handleQuickBuyTransition = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.parallel([
      Animated.timing(liftAnim, {
        toValue: 1.03,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(morphAnim, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      router.push('/quickbuy');
      setTimeout(() => {
        liftAnim.setValue(1);
        morphAnim.setValue(0);
      }, 500);
    });
  };

  // ─── 2 AM Daily Rotating Flash Deal Drop Engine ───
  const currentFlashDeal = React.useMemo(() => {
    const now = new Date();
    const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    return DAILY_FLASH_DEALS[dayIndex % DAILY_FLASH_DEALS.length];
  }, []);

  useEffect(() => {
    const update2AMCountdown = () => {
      const now = new Date();
      const next2AM = new Date();
      next2AM.setHours(2, 0, 0, 0);
      if (now.getTime() >= next2AM.getTime()) {
        next2AM.setDate(next2AM.getDate() + 1);
      }
      const diffSec = Math.floor((next2AM.getTime() - now.getTime()) / 1000);
      setSecondsLeft(diffSec);
    };

    update2AMCountdown();
    const timerInterval = setInterval(update2AMCountdown, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  // ─── Search Ticker & Modal State ───
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'voice' | 'camera'>('text');
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickerFadeAnim = useRef(new Animated.Value(1)).current;
  const tickerTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(tickerFadeAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
        Animated.timing(tickerTranslateY, { toValue: -10, duration: 180, useNativeDriver: false }),
      ]).start(() => {
        setTickerIndex((prev) => (prev + 1) % SEARCH_TICKERS.length);
        tickerTranslateY.setValue(10);
        Animated.parallel([
          Animated.timing(tickerFadeAnim, { toValue: 1, duration: 220, useNativeDriver: false }),
          Animated.timing(tickerTranslateY, { toValue: 0, duration: 220, easing: Easing.out(Easing.back(1.2)), useNativeDriver: false }),
        ]).start();
      });
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // ─── Quick Add Sheet State & Cart Toast ───
  const [selectedQuickAdd, setSelectedQuickAdd] = useState<QuickAddProduct | null>(null);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ─── Gamification Modal ───
  const [gamificationModal, setGamificationModal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      const currentUser = auth.currentUser;
      if (currentUser) {
        if (currentUser.displayName) {
          setUserName(currentUser.displayName.split(' ')[0]);
        }
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().fullName) {
            setUserName(userDoc.data().fullName.split(' ')[0]);
          }
        } catch (e) {
          console.log('Error fetching user profile:', e);
        }
      }
    }
    fetchUserProfile();
  }, []);

  const toggleFavorite = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    Animated.sequence([
      Animated.timing(heartSpringScale, { toValue: 0.82, duration: 100, useNativeDriver: true }),
      Animated.spring(heartSpringScale, { toValue: 1.0, friction: 4, tension: 180, useNativeDriver: true }),
    ]).start();
  };

  const searchCapsuleScale = useRef(new Animated.Value(1)).current;
  const homeExitOpacity = useRef(new Animated.Value(1)).current;
  const homeExitTranslateY = useRef(new Animated.Value(0)).current;

  const openSearch = (mode: 'text' | 'voice' | 'camera' = 'text') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSearchMode(mode);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(searchCapsuleScale, { toValue: 1.03, duration: 120, useNativeDriver: true }),
        Animated.timing(searchCapsuleScale, { toValue: 1.0, duration: 180, useNativeDriver: true }),
      ]),
      Animated.timing(homeExitOpacity, { toValue: 0.15, duration: 320, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(homeExitTranslateY, { toValue: 20, duration: 320, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    ]).start(() => {
      setSearchModalVisible(true);
    });
  };

  const handleCloseSearchModal = () => {
    setSearchModalVisible(false);
    Animated.parallel([
      Animated.timing(homeExitOpacity, { toValue: 1, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(homeExitTranslateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  };

  const openQuickAdd = (product: QuickAddProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setSelectedQuickAdd(product);
    setQuickAddVisible(true);
  };

  const handleAddToCart = (product: any, size = 'M', color = 'Standard', qty = 1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    triggerCartBadgeSpring();
    setToastMessage(`Added ${qty}x ${product.title || product.name} to Cart! 🛍️`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── LIVING BACKGROUND AMBIENT SYSTEM ───
  const ambientGlowAnim1 = useRef(new Animated.Value(0)).current;
  const ambientGlowAnim2 = useRef(new Animated.Value(0)).current;
  const ambientGlowAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow 1 Loop (10s)
    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientGlowAnim1, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ambientGlowAnim1, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow 2 Loop (12s)
    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientGlowAnim2, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ambientGlowAnim2, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow 3 Loop (14s)
    Animated.loop(
      Animated.sequence([
        Animated.timing(ambientGlowAnim3, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(ambientGlowAnim3, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SpatialDrawerWrapper
      ref={spatialDrawerRef}
      userName={userName || 'Bhaskar'}
      userEmail={auth.currentUser?.email || 'bhaskar@email.com'}
      userAvatar={auth.currentUser?.photoURL || undefined}
      onSelectMenuItem={(itemId) => {
        if (itemId === 'categories') {
          router.push('/all-items' as any);
        } else if (itemId === 'wallet') {
          setWalletModalVisible(true);
        } else if (itemId === 'loyalty') {
          setLoyaltyModalVisible(true);
        } else if (itemId === 'locations') {
          openLocationModal();
        } else if (itemId === 'gift_ideas') {
          setToastMessage('🎁 Gift Ideas Store Coming Soon!');
          setTimeout(() => setToastMessage(null), 3500);
        } else if (itemId === 'help' || itemId === 'profile') {
          router.push('/profile' as any);
        } else if (itemId === 'logout') {
          auth.signOut().catch(() => {});
        }
      }}
    >
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* ─── LIVING AMBIENT BACKGROUND GLOW BLOBS (BARELY NOTICEABLE & CLIPPED) ─── */}
      <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden' }]} pointerEvents="none">
        {/* Glow 1: Soft Warm Gold / Ivory Glow (Top Area) */}
        <Animated.View
          style={[
            styles.ambientBlob,
            {
              top: '4%',
              left: -30,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: isDarkMode ? 'rgba(124, 58, 237, 0.05)' : 'rgba(254, 243, 199, 0.35)',
              opacity: ambientGlowAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.25] }),
              transform: [
                { scale: ambientGlowAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.08] }) },
                { translateY: ambientGlowAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
              ],
            },
          ]}
        />

        {/* Glow 2: Barely Noticeable Lavender Glow (Discovery Area) */}
        <Animated.View
          style={[
            styles.ambientBlob,
            {
              top: '38%',
              right: -40,
              width: 260,
              height: 260,
              borderRadius: 130,
              backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.06)' : 'rgba(243, 232, 255, 0.3)',
              opacity: ambientGlowAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }),
              transform: [
                { scale: ambientGlowAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] }) },
                { translateY: ambientGlowAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -15] }) },
              ],
            },
          ]}
        />

        {/* Glow 3: Barely Noticeable Soft Mint Glow (QuickBuy / Deals Area) */}
        <Animated.View
          style={[
            styles.ambientBlob,
            {
              top: '68%',
              left: -40,
              width: 280,
              height: 280,
              borderRadius: 140,
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.06)' : 'rgba(224, 242, 254, 0.3)',
              opacity: ambientGlowAnim3.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }),
              transform: [
                { scale: ambientGlowAnim3.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] }) },
              ],
            },
          ]}
        />
      </View>

      <Reanimated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >

        {/* ─── 1. TOP HEADER & DYNAMIC GREETING CARD ─── */}
        <Animated.View
          style={[
            styles.glassGreetingCard,
            isDarkMode && styles.glassGreetingDark,
            {
              opacity: headerEntranceOpacity,
              transform: [{ translateY: headerEntranceTranslateY }],
            },
          ]}
        >
          <View style={styles.greetingTopRow}>
            {/* Spatial Slide Menu Hamburger Icon with Tactile Press Response */}
            <TouchableOpacity
              style={[styles.headerIconBtn, { marginRight: 10 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
              onPress={handleMenuBtnPress}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: menuBtnScale }] }}>
                <Ionicons name="menu-outline" size={22} color={isDarkMode ? '#F8FAFC' : THEME.PRIMARY} />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.greetingTextCol}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                loadFreshGreeting();
              }}
              activeOpacity={0.85}
            >
              <View>
                <Text
                  style={[
                    styles.userText,
                    {
                      fontSize: greetingText.length > 26 ? (width >= 400 ? 22 : 20) : (width >= 400 ? 26 : 24),
                      lineHeight: greetingText.length > 26 ? (width >= 400 ? 28 : 25) : (width >= 400 ? 32 : 30),
                    },
                    isDarkMode && { color: '#F8FAFC' },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {greetingText}
                </Text>
                <Reanimated.Text
                  style={[styles.subGreeting, isDarkMode && { color: '#94A3B8' }, reanimatedHeaderSubStyle]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {subtitleText}
                </Reanimated.Text>
              </View>
            </TouchableOpacity>

            {/* Header Right Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AnimatedThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

              <TouchableOpacity
                style={[styles.headerIconBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                onPress={openWishlist}
                activeOpacity={0.8}
              >
                <Animated.View style={{ transform: [{ scale: heartSpringScale }] }}>
                  <Ionicons name="heart-outline" size={18} color={isDarkMode ? '#F8FAFC' : THEME.PRIMARY} />
                </Animated.View>
                {totalWishlistItems > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeTxt}>{totalWishlistItems}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerIconBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                onPress={openCart}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={18} color={isDarkMode ? '#F8FAFC' : THEME.PRIMARY} />
                {totalItems > 0 && (
                  <Animated.View
                    style={[
                      styles.headerBadge,
                      {
                        backgroundColor: '#7C3AED',
                        transform: [{ scale: cartBadgeSpringScale }],
                      },
                    ]}
                  >
                    <Text style={styles.headerBadgeTxt}>{totalItems}</Text>
                  </Animated.View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* SLEEK DELIVERING TO CARD */}
          <TouchableOpacity
            style={[styles.deliveringCard, isDarkMode && styles.deliveringCardDark, { marginTop: 4 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              openLocationModal();
            }}
            activeOpacity={0.85}
          >
            <Animated.View
              style={[
                styles.deliveringIconBg,
                isDarkMode && styles.deliveringIconBgDark,
                { transform: [{ scale: locationPinPulseScale }] },
              ]}
            >
              <Ionicons name="location-sharp" size={13} color="#22C55E" />
            </Animated.View>

            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>Delivering to</Text>
              <Text style={[styles.deliveringTitle, isDarkMode && { color: '#FFFFFF' }]} numberOfLines={1}>
                {selectedAddress && selectedAddress.locality && selectedAddress.state
                  ? `${selectedAddress.locality}, ${selectedAddress.state}`
                  : selectedAddress && selectedAddress.city && selectedAddress.state
                  ? `${selectedAddress.city}, ${selectedAddress.state}`
                  : `${selectedStateName || 'Selected Location'}`}
              </Text>
              <Ionicons name="chevron-down" size={12} color={isDarkMode ? '#A855F7' : '#16A34A'} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── 2. FLOATING ROUNDED SEARCH CAPSULE ─── */}
        <Reanimated.View style={reanimatedSearchCapsuleStyle}>
          <Animated.View
            style={{
              opacity: searchEntranceOpacity,
              transform: [{ scale: Animated.multiply(searchCapsuleScale, searchEntranceScale) }],
            }}
          >
          <TouchableOpacity
            style={[styles.searchCapsule, isDarkMode && styles.searchCapsuleDark]}
            onPress={() => openSearch('text')}
            activeOpacity={0.9}
          >
            <Ionicons name="search" size={20} color={isDarkMode ? '#94A3B8' : THEME.PRIMARY} />

            <View style={styles.tickerContainer}>
              <Animated.Text
                style={[
                  styles.searchInputText,
                  {
                    color: isDarkMode ? '#94A3B8' : '#64748B',
                    opacity: tickerFadeAnim,
                    transform: [{ translateY: tickerTranslateY }],
                  },
                ]}
                numberOfLines={1}
              >
                {SEARCH_TICKERS[tickerIndex]}
              </Animated.Text>
            </View>

            <TouchableOpacity
              style={[styles.searchActionBtn, { backgroundColor: THEME.PURPLE + '18', borderRadius: 8 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                setVoiceBuyVisible(true);
              }}
              activeOpacity={0.75}
            >
              <Ionicons name="mic" size={18} color={THEME.PURPLE} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchActionBtn} onPress={() => openSearch('camera')} activeOpacity={0.75}>
              <Ionicons name="camera-outline" size={18} color={THEME.SKY_BLUE} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </Reanimated.View>

        {/* ─── 2.5 AI SMART FEED (TIME-AWARE PERSONALISATION) ─── */}
        <Animated.View
          style={{
            opacity: aiFeedEntranceOpacity,
            transform: [{ scale: aiFeedEntranceScale }],
          }}
        >
          <AISmartFeed
            stateName={selectedAddress?.state || selectedStateName}
            isDarkMode={isDarkMode}
            onKeywordPress={(kw) => {
              setSearchMode('text');
              setSearchModalVisible(true);
            }}
          />
        </Animated.View>

        <Reanimated.View style={reanimatedQuickBuyStyle}>
          <Animated.View
            style={{
              opacity: quickBuyEntranceOpacity,
              transform: [{ translateY: quickBuyEntranceTranslateY }],
            }}
          >
            <QuickBuySection
              items={QUICKBUY_GRID_ITEMS}
              isDarkMode={isDarkMode}
              onSeeAll={handleQuickBuyTransition}
              onSelectItem={(item) => {
                openQuickAdd({
                  id: item.id,
                  title: item.name,
                  price: '₹66',
                  image: item.image || '',
                });
              }}
            />
          </Animated.View>
        </Reanimated.View>

        {/* ─── 4. CATEGORY BADGES (4 CLEAN CARDS) ─── */}
        <View style={styles.categoryBadgesGrid}>
          {MOOD_CHIPS.map((chip) => (
            <ZoomCard
              key={chip.id}
              style={[styles.categoryBadgeCard, isDarkMode && styles.categoryBadgeCardDark]}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                if (chip.id === 'explore_all') {
                  router.push('/all-items' as any);
                } else if (chip.id === 'quickbuy') {
                  router.push('/quickbuy' as any);
                } else if (chip.id === 'regional') {
                  router.push('/regional-spices' as any);
                } else if (chip.id === 'offers') {
                  router.push('/offers' as any);
                }
              }}
            >
              <View style={[styles.categoryBadgeIconBg, { backgroundColor: chip.iconBg }]}>
                <Ionicons name={chip.icon as any} size={15} color={chip.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.categoryBadgeTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>{chip.label}</Text>
                <Text style={[styles.categoryBadgeSub, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>{chip.sub}</Text>
              </View>
            </ZoomCard>
          ))}
        </View>

        {/* ─── 5. DYNAMIC SMART TRENDING SLIDABLE HERO BANNERS 🔥 (GEN-Z EDITORIAL) ─── */}
        {isBannerLoading ? (
          <View style={styles.heroSection}>
            <Animated.View style={[styles.heroSkeletonCard, isDarkMode && styles.heroSkeletonCardDark, { opacity: skeletonPulseAnim }]}>
              <View style={styles.heroSkeletonContent}>
                <View style={styles.heroSkeletonTag} />
                <View style={styles.heroSkeletonTitle} />
                <View style={styles.heroSkeletonSub} />
                <View style={styles.heroSkeletonBtn} />
              </View>
              <View style={styles.heroSkeletonImg} />
            </Animated.View>
          </View>
        ) : (
          trendingBanners && trendingBanners.length > 0 && (
            <Reanimated.View style={reanimatedHeroParallaxStyle}>
              <EditorialPromotionalBanner
                banners={trendingBanners as any}
                isDarkMode={isDarkMode}
                onPressBanner={(banner) => {
                  router.push({ pathname: '/collection/[id]', params: { id: banner.collectionId || 'regional_delights' } } as any);
                }}
                onPressCTA={(banner) => {
                  if (banner.featuredProduct) {
                    openQuickAdd({
                      id: banner.featuredProduct.id,
                      title: banner.featuredProduct.title,
                      price: banner.featuredProduct.price,
                      image: banner.featuredProduct.image || banner.image,
                    });
                  } else {
                    router.push({ pathname: '/collection/[id]', params: { id: banner.collectionId || 'regional_delights' } } as any);
                  }
                }}
              />
            </Reanimated.View>
          )
        )}

        {/* ==================================================
            DISCOVERY COMMERCE FEED (GEN-Z EDITORIAL)
            ================================================== */}


        {/* ─── 2. SHOP BY VIBE ✨ (LUXURIOUS 3D PARALLAX & SNAP CAROUSEL) ─── */}
        <Reanimated.View style={reanimatedVibeStyle}>
          <View style={[styles.discoveryHeader, { marginTop: 24 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.discoveryTitle, isDarkMode && { color: '#F8FAFC' }]}>Shop by Vibe ✨</Text>
            {/* Animated Pagination Pill Dots */}
            <View style={styles.vibeDotsRow}>
              {VIBE_CARDS.map((_, dotIdx) => {
                const snapInterval = 232;
                const dotInputRange = [
                  (dotIdx - 1) * snapInterval,
                  dotIdx * snapInterval,
                  (dotIdx + 1) * snapInterval,
                ];
                const dotScaleX = vibeScrollX.interpolate({
                  inputRange: dotInputRange,
                  outputRange: [1, 3, 1],
                  extrapolate: 'clamp',
                });
                const dotOpacity = vibeScrollX.interpolate({
                  inputRange: dotInputRange,
                  outputRange: [0.35, 1, 0.35],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={dotIdx}
                    style={[
                      styles.vibeDotPill,
                      {
                        transform: [{ scaleX: dotScaleX }],
                        opacity: dotOpacity,
                        backgroundColor: isDarkMode ? '#A855F7' : '#7C3AED',
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/all-items')} activeOpacity={0.7} style={styles.seeAllRow}>
            <Text style={styles.gzSeeAllText}>See all</Text>
            <Ionicons name="chevron-forward" size={13} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vibeScroll}
          decelerationRate="fast"
          snapToInterval={232}
          snapToAlignment="start"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: vibeScrollX } } }],
            { useNativeDriver: true }
          )}
        >
          {VIBE_CARDS.map((vibe, index) => {
            const snapInterval = 232;
            const inputRange = [
              (index - 1) * snapInterval,
              index * snapInterval,
              (index + 1) * snapInterval,
            ];

            const cardScale = vibeScrollX.interpolate({
              inputRange,
              outputRange: [0.93, 1.04, 0.93],
              extrapolate: 'clamp',
            });

            const cardOpacity = vibeScrollX.interpolate({
              inputRange,
              outputRange: [0.82, 1, 0.82],
              extrapolate: 'clamp',
            });

            const imgParallaxX = vibeScrollX.interpolate({
              inputRange,
              outputRange: [-12, 0, 12],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={vibe.id}
                style={{
                  opacity: cardOpacity,
                  transform: [{ scale: cardScale }],
                }}
              >
                <SpringCard
                  style={styles.vibeCoverCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    router.push({ pathname: '/collection/[id]', params: { id: vibe.collectionId } } as any);
                  }}
                >
                  {/* Full-Bleed Cover Image */}
                  <Animated.Image
                    source={{ uri: vibe.image }}
                    style={[
                      styles.vibeCoverImg,
                      {
                        transform: [{ translateX: imgParallaxX }, { scale: 1.15 }],
                      },
                    ]}
                    resizeMode="cover"
                  />

                  {/* Dark Gradient Ambient Overlay */}
                  <View style={styles.vibeCoverOverlay} />

                  {/* Overlaid Content at Bottom */}
                  <View style={styles.vibeCoverContent}>
                    <View style={styles.vibeCoverHeaderRow}>
                      <Text style={styles.vibeCoverTitle} numberOfLines={1}>{vibe.title}</Text>
                      <Text style={styles.vibeCoverEmoji}>{vibe.emoji}</Text>
                    </View>
                    <Text style={styles.vibeCoverSub} numberOfLines={1}>{vibe.sub}</Text>
                    <View style={styles.vibeCoverFooterRow}>
                      <Text style={styles.vibeCoverAction}>Explore Vibe</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                </SpringCard>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
        </Reanimated.View>

        {/* ─── 3. REGIONAL FAVORITES / STATE SPECIAL SHOWCASE ─── */}
        <TouchableOpacity
          style={styles.stateHeritageHeroCard}
          activeOpacity={0.92}
          onPress={() => router.push({ pathname: '/collection/[id]', params: { id: 'regional_delights' } } as any)}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80' }}
            style={styles.stateHeritageImg}
          />
          <View style={styles.stateHeritageOverlay}>
            <View style={styles.stateBadgePill}>
              <Text style={styles.stateBadgeEmoji}>👑</Text>
              <Text style={styles.stateBadgeText}>{(selectedAddress?.state || selectedStateName || 'Bihar').toUpperCase()} HERITAGE EDIT</Text>
            </View>
            <Text style={styles.stateHeritageTitle}>Authentic {selectedAddress?.state || selectedStateName || 'State'} Specialties</Text>
            <Text style={styles.stateHeritageSub}>Direct from traditional local master artisans & regional farms</Text>
            <View style={styles.stateHeritageCtaRow}>
              <Text style={styles.stateHeritageCtaText}>Explore Collection →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ─── 4. TIME-AWARE DISCOVERY MODULE ─── */}
        {(() => {
          const timeSection = getTimeAwareSection();
          return (
            <Reanimated.View style={reanimatedTimeAwareStyle}>
              <View style={[styles.timeAwareCard, { backgroundColor: isDarkMode ? timeSection.bgDark : timeSection.bgLight }]}>
                <View style={styles.timeAwareHeaderRow}>
                  <View style={[styles.timeBadgePill, { backgroundColor: timeSection.badgeColor }]}>
                    <Text style={styles.timeBadgeText}>{timeSection.tag}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: '/collection/[id]', params: { id: timeSection.collectionId } } as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeSeeAllText, { color: timeSection.badgeColor }]}>Explore →</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.timeAwareTitle, isDarkMode && { color: '#F8FAFC' }]}>{timeSection.title}</Text>
                <Text style={[styles.timeAwareSub, isDarkMode && { color: '#94A3B8' }]}>{timeSection.sub}</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingTop: 12 }}
                  decelerationRate="fast"
                  snapToInterval={168}
                  snapToAlignment="start"
                >
                  {timeSection.products.map((p) => (
                    <GenZProductCard
                      key={p.id}
                      item={p}
                      isDarkMode={isDarkMode}
                      onPress={() => router.push({ pathname: '/collection/[id]', params: { id: timeSection.collectionId } } as any)}
                      onAddToCart={() => handleAddToCart(p)}
                    />
                  ))}
                </ScrollView>
              </View>
            </Reanimated.View>
          );
        })()}

        {/* ─── 5. ASYMMETRIC GEN-Z LIFESTYLE COLLECTIONS ─── */}
        <Reanimated.View style={reanimatedCuratedStyle}>
          <View style={[styles.discoveryHeader, { marginTop: 24 }]}>
            <View>
              <Text style={[styles.discoveryTitle, isDarkMode && { color: '#F8FAFC' }]}>Curated Collections 🛍️</Text>
              <Text style={[styles.discoverySub, isDarkMode && { color: '#94A3B8' }]}>Handpicked for your aesthetic</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/orders')} activeOpacity={0.7} style={styles.seeAllRow}>
              <Text style={styles.gzSeeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={13} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          <View style={styles.asymmetricGrid}>
            {/* Left Hero Card */}
            <TouchableOpacity
              style={styles.asymmetricLeftHero}
              activeOpacity={0.92}
              onPress={() => router.push({ pathname: '/collection/[id]', params: { id: 'late_night_munchies' } } as any)}
            >
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80' }}
                style={styles.asymmetricHeroImg}
              />
              <View style={styles.asymmetricOverlay}>
                <View style={styles.asymmetricBadge}>
                  <Text style={styles.asymmetricBadgeText}>✨ HOSTEL GLOW-UP</Text>
                </View>
                <Text style={styles.asymmetricTitle}>Hostel & Room Upgrades</Text>
                <Text style={styles.asymmetricSub}>Make your space feel like yours</Text>
              </View>
            </TouchableOpacity>

            {/* Right Column Stacked */}
            <View style={styles.asymmetricRightColumn}>
              <TouchableOpacity
                style={styles.asymmetricRightCard}
                activeOpacity={0.92}
                onPress={() => router.push({ pathname: '/collection/[id]', params: { id: 'healthy_living' } } as any)}
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=80' }}
                  style={styles.asymmetricRightImg}
                />
                <View style={styles.asymmetricOverlayCompact}>
                  <Text style={styles.asymmetricBadgeTextCompact}>🍃 CLEAN LIVING</Text>
                  <Text style={styles.asymmetricTitleCompact}>Organic Pantry</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.asymmetricRightCard}
                activeOpacity={0.92}
                onPress={() => router.push({ pathname: '/collection/[id]', params: { id: 'party_ready' } } as any)}
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&auto=format&fit=crop&q=80' }}
                  style={styles.asymmetricRightImg}
                />
                <View style={styles.asymmetricOverlayCompact}>
                  <Text style={styles.asymmetricBadgeTextCompact}>⚡ WEEKEND VIBE</Text>
                  <Text style={styles.asymmetricTitleCompact}>Party Snack Mix</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Reanimated.View>

        {/* ─── 6. FLASH SALE & LIVE DEALS ⚡ (FULL-BLEED COVER WITH 2 AM ROTATION) ─── */}
        <Reanimated.View style={reanimatedFlashDealsStyle}>
          <View style={[styles.discoveryHeader, { marginTop: 24 }]}>
            <View style={styles.timerTitleRow}>
              <Text style={[styles.discoveryTitle, isDarkMode && { color: '#F8FAFC' }]}>Flash Deals ⚡</Text>
              <View style={[styles.timerBadge, { backgroundColor: isDarkMode ? 'rgba(244, 63, 94, 0.2)' : 'rgba(244, 63, 94, 0.12)' }]}>
                <Ionicons name="time-outline" size={12} color="#F43F5E" />
                <Text style={[styles.timerText, { color: '#F43F5E' }]}>{formatTimer(secondsLeft)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.flashFullCoverCard}
            onPress={() => {
              openQuickAdd({
                id: currentFlashDeal.id,
                title: currentFlashDeal.title,
                price: currentFlashDeal.price,
                image: currentFlashDeal.image,
              });
            }}
            activeOpacity={0.92}
          >
            <Reanimated.Image
              source={{ uri: currentFlashDeal.image }}
              style={[styles.flashFullCoverImg, reanimatedFlashImgStyle, { transform: [{ scale: 1.12 }] }]}
              resizeMode="cover"
            />

            {/* Dark Gradient Ambient Overlay */}
            <View style={styles.flashFullCoverOverlay} />

            {/* Top Badges Over Image */}
            <View style={styles.flashTopBadgesRow}>
              <View style={styles.flashLiveBadge}>
                <View style={styles.flashLiveDot} />
                <Text style={styles.flashLiveText}>2 AM DAILY DROP</Text>
              </View>
              <View style={styles.flashDiscountPill}>
                <Text style={styles.flashDiscountText}>{currentFlashDeal.discount}</Text>
              </View>
            </View>

            {/* Overlaid Bottom Content */}
            <View style={styles.flashFullCoverContent}>
              <Text style={styles.flashFullCoverTitle}>{currentFlashDeal.title}</Text>
              <Text style={styles.flashFullCoverDesc} numberOfLines={2}>{currentFlashDeal.desc}</Text>
              <View style={styles.flashFullCoverFooter}>
                <View style={styles.flashPriceWrap}>
                  <Text style={styles.flashDealPrice}>{currentFlashDeal.price}</Text>
                  <Text style={styles.flashOldPrice}>{currentFlashDeal.oldPrice}</Text>
                </View>
                <TouchableOpacity
                  style={styles.flashGrabBtn}
                  onPress={() => {
                    openQuickAdd({
                      id: currentFlashDeal.id,
                      title: currentFlashDeal.title,
                      price: currentFlashDeal.price,
                      image: currentFlashDeal.image,
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.flashGrabBtnText}>Grab Deal Now →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Reanimated.View>

        {/* ─── 7. GAMIFICATION LEVEL & STREAK ─── */}
        <Reanimated.View style={reanimatedGamificationStyle}>
          <View
            style={[
              styles.gamifiedCard,
              {
                backgroundColor: isDarkMode ? 'rgba(30, 27, 75, 0.45)' : 'rgba(243, 229, 245, 0.35)',
                borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(233, 213, 255, 0.8)',
                borderWidth: 1.5,
              },
            ]}
          >
            <View style={styles.gamifiedTop}>
              <View style={[styles.levelBadge, isDarkMode && { backgroundColor: 'rgba(168, 85, 247, 0.2)' }]}>
                <Ionicons name="trophy" size={16} color={isDarkMode ? '#C084FC' : THEME.PURPLE} />
                <Text style={[styles.levelText, isDarkMode && { color: '#F8FAFC' }]}>Your Level: Level 7</Text>
              </View>
              <View style={[styles.streakBadge, isDarkMode && { backgroundColor: 'rgba(234, 88, 12, 0.2)', borderColor: 'rgba(234, 88, 12, 0.4)' }]}>
                <Text style={styles.streakText}>🔥 5 Day Streak</Text>
              </View>
            </View>

            <Text style={[styles.xpText, isDarkMode && { color: '#94A3B8' }]}>680 / 1000 XP to Level 8</Text>
            <View style={[styles.xpBarBg, isDarkMode && { backgroundColor: '#312E81' }]}>
              <View style={[styles.xpBarFill, { width: '68%', backgroundColor: THEME.PURPLE }]} />
            </View>

            <View style={styles.rewardActionRow}>
              <TouchableOpacity
                style={[
                  styles.rewardActionBtn,
                  {
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.55)',
                    borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.95)',
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  setGamificationModal('Mystery Box');
                }}
              >
                <Text style={styles.rewardEmoji}>🎁</Text>
                <Text style={[styles.rewardText, isDarkMode && { color: '#F8FAFC' }]}>Mystery Box</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rewardActionBtn,
                  {
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.55)',
                    borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.95)',
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  setGamificationModal('Lucky Spin');
                }}
              >
                <Text style={styles.rewardEmoji}>🎰</Text>
                <Text style={[styles.rewardText, isDarkMode && { color: '#F8FAFC' }]}>Lucky Spin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rewardActionBtn,
                  {
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.55)',
                    borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.95)',
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  setGamificationModal('My Badges');
                }}
              >
                <Text style={styles.rewardEmoji}>🏅</Text>
                <Text style={[styles.rewardText, isDarkMode && { color: '#F8FAFC' }]}>My Badges</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Reanimated.View>

        {/* ─── 8. RECOMMENDED FOR YOU 💜 (COMPACT SNAP RAIL) ─── */}
        <Reanimated.View style={reanimatedRecommendedStyle}>
          <View style={[styles.discoveryHeader, { marginTop: 24 }]}>
            <View>
              <Text style={[styles.discoveryTitle, isDarkMode && { color: '#F8FAFC' }]}>Recommended for You 💜</Text>
              <Text style={[styles.discoverySub, isDarkMode && { color: '#94A3B8' }]}>Curated just for you, {userName}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/all-items')} activeOpacity={0.7} style={styles.seeAllRow}>
              <Text style={styles.gzSeeAllText}>See all</Text>
              <Ionicons name="chevron-forward" size={13} color="#7C3AED" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.compactRailScroll}
            decelerationRate="fast"
            snapToInterval={168}
            snapToAlignment="start"
          >
            {RECOMMENDED_PRODUCTS.map((prod) => (
              <GenZProductCard
                key={prod.id}
                item={prod}
                isDarkMode={isDarkMode}
                isFav={!!favorites[prod.id]}
                onToggleFav={() => toggleFavorite(prod.id)}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: prod.id } } as any)}
                onAddToCart={() => handleAddToCart(prod)}
              />
            ))}
          </ScrollView>
        </Reanimated.View>

        {/* ─── 9. EASYBUY PLUS ⭐ BANNER ─── */}
        <Reanimated.View style={reanimatedPlusStyle}>
          <View style={[styles.plusBanner, { backgroundColor: isDarkMode ? '#1E1B4B' : '#F3E5F5', borderColor: isDarkMode ? '#312E81' : 'transparent', borderWidth: isDarkMode ? 1 : 0 }]}>
            <View style={styles.plusLeft}>
              <Text style={[styles.plusTitle, isDarkMode && { color: '#F8FAFC' }]}>Save More with EasyBuy Plus ⭐</Text>
              <Text style={[styles.plusSub, isDarkMode && { color: '#94A3B8' }]}>Free delivery • Extra coins • Early access</Text>
              <TouchableOpacity style={[styles.plusBtn, { backgroundColor: THEME.PURPLE }]} activeOpacity={0.85}>
                <Text style={styles.plusBtnText}>Join Now →</Text>
              </TouchableOpacity>
            </View>
            <Ionicons name="gift" size={56} color={THEME.PURPLE} />
          </View>
        </Reanimated.View>

        {/* ─── 10. RECENTLY VIEWED 👀 (COMPACT SNAP RAIL) ─── */}
        <Reanimated.View style={reanimatedRecentlyViewedStyle}>
          <View style={[styles.discoveryHeader, { marginTop: 24 }]}>
            <View>
              <Text style={[styles.discoveryTitle, isDarkMode && { color: '#F8FAFC' }]}>Recently Viewed 👀</Text>
              <Text style={[styles.discoverySub, isDarkMode && { color: '#94A3B8' }]}>Items you checked out recently</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.compactRailScroll}
            decelerationRate="fast"
            snapToInterval={168}
            snapToAlignment="start"
          >
            {RECENTLY_VIEWED.map((rv) => (
              <GenZProductCard
                key={rv.id}
                item={rv}
                isDarkMode={isDarkMode}
                isFav={!!favorites[rv.id]}
                onToggleFav={() => toggleFavorite(rv.id)}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: rv.id } } as any)}
                onAddToCart={() => handleAddToCart(rv)}
              />
            ))}
          </ScrollView>
        </Reanimated.View>

        {/* ─── 14. TRUST BADGES STRIP ─── */}
        <Reanimated.View style={reanimatedTrustStripStyle}>
          <View style={[styles.trustStrip, isDarkMode && styles.trustStripDark]}>
            <View style={styles.trustItem}>
              <Ionicons name="car-outline" size={16} color={isDarkMode ? '#A855F7' : THEME.PRIMARY} />
              <Text style={[styles.trustText, isDarkMode && { color: '#94A3B8' }]}>10 Min Delivery</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="refresh-outline" size={16} color={isDarkMode ? '#A855F7' : THEME.PRIMARY} />
              <Text style={[styles.trustText, isDarkMode && { color: '#94A3B8' }]}>Easy Returns</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark-outline" size={16} color={isDarkMode ? '#A855F7' : THEME.PRIMARY} />
              <Text style={[styles.trustText, isDarkMode && { color: '#94A3B8' }]}>100% Secure</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="pricetag-outline" size={16} color={isDarkMode ? '#A855F7' : THEME.PRIMARY} />
              <Text style={[styles.trustText, isDarkMode && { color: '#94A3B8' }]}>Best Price</Text>
            </View>
          </View>
        </Reanimated.View>

      </Reanimated.ScrollView>

      {/* ─── FLOATING DOCK NAVIGATION ─── */}
      <ExperimentalNavigation
        activeTab={activeTab}
        onTabChange={(tabId) => {
          if (tabId === 'profile') {
            router.push('/profile');
          } else if (tabId === 'orders') {
            router.push('/orders');
          } else {
            setActiveTab(tabId);
          }
        }}
        isDarkMode={isDarkMode}
      />

      {/* ─── ADVANCED MORPHING SEARCH MODAL ─── */}
      <SearchModal
        visible={searchModalVisible}
        onClose={handleCloseSearchModal}
        initialMode={searchMode}
        isDarkMode={isDarkMode}
      />

      {/* ─── SPIN & WIN DAILY MYSTERY REWARD WHEEL ─── */}
      <SpinWinModal
        visible={spinWinModalVisible}
        onClose={() => setSpinWinModalVisible(false)}
        isDarkMode={isDarkMode}
      />

      {/* ─── VOICEBUY AI MODAL ─── */}
      <VoiceBuyModal
        visible={voiceBuyVisible}
        onClose={() => setVoiceBuyVisible(false)}
        onAddToCart={(items) => {
          const names = items.map((i) => `${i.quantity}× ${i.name}`).join(', ');
          setToastMessage(`🛒 Added to cart: ${names}`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
        isDarkMode={isDarkMode}
      />

      {/* ─── QUICK ADD VARIANT SHEET ─── */}
      <QuickAddModal
        visible={quickAddVisible}
        product={selectedQuickAdd}
        onClose={() => setQuickAddVisible(false)}
        onAddToCart={handleAddToCart}
        isDarkMode={isDarkMode}
      />

      {/* ─── GAMIFICATION REWARDS POPUP MODAL ─── */}
      {gamificationModal && (
        <View style={styles.rewardModalBackdrop}>
          <View style={[styles.rewardModalCard, isDarkMode && styles.rewardModalDark]}>
            <Text style={styles.rewardModalEmoji}>🎉</Text>
            <Text style={[styles.rewardModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
              {gamificationModal} Unlocked!
            </Text>
            <Text style={styles.rewardModalSub}>You earned +150 Coins & 50 XP!</Text>
            <TouchableOpacity
              style={styles.rewardClaimBtn}
              onPress={() => setGamificationModal(null)}
            >
              <Text style={styles.rewardClaimText}>Claim Reward 🎁</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {toastMessage && (
        <View style={styles.floatingToastBar}>
          <Ionicons name="checkmark-circle" size={18} color="#2F6E49" />
          <Text style={styles.floatingToastText}>{toastMessage}</Text>
        </View>
      )}

      <WalletModal
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
        isDarkMode={isDarkMode}
      />

      <LoyaltyModal
        visible={loyaltyModalVisible}
        onClose={() => setLoyaltyModalVisible(false)}
        isDarkMode={isDarkMode}
      />

    </SafeAreaView>
    </SpatialDrawerWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BG_CREAM,
  },
  containerDark: {
    backgroundColor: THEME.BG_DARK,
  },
  ambientBlob: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },

  // 1. Greeting Card
  glassGreetingCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: THEME.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  glassGreetingDark: {
    backgroundColor: THEME.CARD_DARK,
    borderColor: THEME.BORDER_DARK,
  },
  headerCardsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  deliveringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  deliveringCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
  },
  deliveringIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  deliveringIconBgDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  deliveringTag: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.PRIMARY,
    letterSpacing: 0.5,
  },
  deliveringTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  deliveringSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  weatherCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  weatherCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1F293D',
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  weatherDesc: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },

  // 4-Badge Feature Row
  featureBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  featureChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  featureChipDark: {
    backgroundColor: THEME.CARD_DARK,
    borderColor: THEME.BORDER_DARK,
  },
  featureText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  greetingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  greetingTextCol: {
    flex: 1,
    marginRight: 12,
  },
  userText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subGreeting: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassChipsRow: {
    gap: 8,
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  glassChipDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  glassChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
  },
  chipNotifDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.CORAL,
  },

  // 2. Search Capsule
  searchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: THEME.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  searchCapsuleDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  tickerContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  searchInputText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  // Common Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.PRIMARY,
  },

  // 3. QuickBuy Cards
  deliveryBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deliveryBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E65100',
  },
  quickBuyScroll: {
    gap: 8,
    marginBottom: 12,
    paddingVertical: 2,
  },
  quickBuyCard: {
    width: 72,
    height: 98,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  qbImgContainer: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qbImg: {
    width: '100%',
    height: '100%',
  },
  qbMoreBox: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  qbName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 1,
  },
  qbTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  greenDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#16A34A',
  },
  qbTimeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#16A34A',
  },

  // 4. Hero Section (Kerala Spice Banner)
  heroSection: {
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 24,
    height: 165,
    backgroundColor: '#FFFBEB',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  heroCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  heroTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 14,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#15803D',
  },
  heroBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroImage: {
    width: 125,
    height: '100%',
    borderRadius: 16,
  },
  liquidDotsTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
    marginTop: 10,
    position: 'relative',
    alignSelf: 'center',
  },
  baseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  liquidPill: {
    position: 'absolute',
    left: 4,
    top: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },

  // 5. Category Filter Chips
  moodChipsScroll: {
    gap: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  moodChipText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  // 6. Shop by Vibe ✨ (Top Selection Style Container Frame)
  topSelectionContainer: {
    backgroundColor: '#93C5FD',
    borderRadius: 24,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 12,
    marginBottom: 24,
    marginTop: 6,
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  topSelectionContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  topSelectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  topSelectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  topSelectionArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  topSelectionInnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  topSelectionInnerCardDark: {
    backgroundColor: '#0F172A',
  },
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  vibeCoverCard: {
    width: 220,
    height: 220,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    elevation: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  vibeCoverImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  vibeCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  vibeCoverContent: {
    padding: 14,
    zIndex: 2,
  },
  vibeCoverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  vibeCoverTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 4,
  },
  vibeCoverEmoji: {
    fontSize: 16,
  },
  vibeCoverSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  vibeCoverFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vibeCoverAction: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  vibeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  vibeCardTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 17,
  },
  vibeEmoji: {
    fontSize: 18,
    marginLeft: 6,
  },
  vibeGridImg: {
    width: '100%',
    height: 125,
    borderRadius: 16,
    marginTop: 8,
  },

  // 7. Deal of the Night 🏷️ (Dark Midnight Card)
  midnightDealSection: {
    marginBottom: 24,
  },
  midnightDealCard: {
    borderRadius: 24,
    height: 165,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  midnightDealContent: {
    flex: 1,
    justifyContent: 'center',
  },
  midnightTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  midnightTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  midnightTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  midnightSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  midnightValidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 10,
  },
  midnightValidText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '700',
  },
  midnightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  midnightBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0F172A',
  },
  midnightImage: {
    width: 125,
    height: '100%',
    borderRadius: 16,
  },

  // 7. Spin & Win Card
  spinCard: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  spinLeft: {
    flex: 1,
  },
  spinTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#7B1FA2',
  },
  spinSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginVertical: 6,
  },
  spinBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  spinBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spinWheelIcon: {
    marginLeft: 10,
  },

  // 8. Recommended
  recProductsScroll: {
    gap: 12,
    marginBottom: 24,
  },
  recProductCard: {
    width: 140,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  recProductCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  recImg: {
    width: '100%',
    height: 100,
    borderRadius: 14,
  },
  recDiscountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recDiscountText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  recHeartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recContent: {
    marginTop: 8,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  tagPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.PRIMARY,
  },
  recTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  recPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  recPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.PRIMARY,
  },
  recOldPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  // 9. Flash Deals Spotlight
  timerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D32F2F',
  },
  flashFullCoverCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  flashFullCoverImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  flashFullCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
  },
  flashTopBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    zIndex: 2,
  },
  flashLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  flashLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  flashLiveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  flashDiscountPill: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  flashDiscountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  flashFullCoverContent: {
    padding: 16,
    zIndex: 2,
  },
  flashFullCoverTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  flashFullCoverDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 15,
    marginBottom: 12,
  },
  flashFullCoverFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flashPriceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashDealPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#22C55E',
  },
  flashOldPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
    textDecorationLine: 'line-through',
  },
  flashGrabBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  flashGrabBtnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  spotlightLeft: {
    flex: 1,
  },
  spotlightDiscountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  spotlightDiscountText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spotlightTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  spotlightDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginVertical: 6,
  },
  spotlightPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  spotlightPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.PRIMARY,
  },
  spotlightOldPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  spotlightBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  spotlightBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  spotlightImg: {
    width: 110,
    height: 110,
    borderRadius: 16,
  },

  // 10. Gamification Card
  gamifiedCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  gamifiedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.PURPLE,
  },
  streakBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E65100',
  },
  xpText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  xpBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(142, 68, 173, 0.2)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rewardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  rewardActionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 2,
  },
  rewardEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },

  // 11. Curated Collections (Pinterest 2x2 Grid)
  curatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  curatedCard: {
    width: (width - 44) / 2,
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  curatedImgWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
  },
  curatedImg: {
    width: '100%',
    height: 110,
  },
  curatedTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  curatedTagBadgeDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  curatedEmoji: {
    fontSize: 10,
  },
  curatedTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2F6E46',
  },
  curatedTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  curatedPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2F6E46',
  },

  // 12. Plus Banner
  plusBanner: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  plusLeft: {
    flex: 1,
  },
  plusTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.PURPLE,
  },
  plusSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginVertical: 4,
  },
  plusBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 4,
  },
  plusBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // 13. Recently Viewed
  rvScroll: {
    gap: 10,
    marginBottom: 20,
  },
  rvCard: {
    width: 120,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rvCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  rvImg: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  rvTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  nykaaEditorialBadge: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#E91E63',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  nykaaSeeAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E91E63',
    letterSpacing: 0.5,
  },
  rvTagText: {
    fontSize: 7,
    fontWeight: '800',
    color: THEME.PRIMARY,
  },
  rvTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  rvPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME.PRIMARY,
    marginTop: 2,
  },

  // 14. Trust Strip
  trustStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trustStripDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },

  // ─── GEN-Z EDITORIAL DISCOVERY FEED STYLES ───
  gzEditorialBadge: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  gzSeeAllText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  discoveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 22,
  },
  discoveryTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  discoverySub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactRailScroll: {
    gap: 10,
    paddingVertical: 4,
    paddingRight: 16,
  },

  // ─── GEN-Z EDITORIAL PRODUCT CARD STYLES ───
  gzCard: {
    width: 156,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  gzCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  gzCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  gzImgWrap: {
    width: '100%',
    height: 124,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  gzImg: {
    width: '100%',
    height: '100%',
  },
  gzTagBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  gzTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  gzFavBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gzContent: {
    padding: 10,
  },
  gzTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  gzRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  gzRatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  gzPriceAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gzPrice: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  gzOldPrice: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  gzAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  gzAddBtnText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Nykaa Luxe Product Card
  nykaaCard: {
    width: 156,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#4A0E2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  nykaaCardLight: {
    backgroundColor: '#FAF7F2',
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  nykaaCardDark: {
    backgroundColor: '#1E1222',
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  nykaaImgWrap: {
    width: '100%',
    height: 124,
    position: 'relative',
    backgroundColor: '#FDFBF7',
  },
  nykaaImg: {
    width: '100%',
    height: '100%',
  },
  nykaaTagBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(74, 14, 46, 0.85)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  nykaaTagText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nykaaFavBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nykaaPriceFloatingPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#4A0E2E',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderWidth: 0.5,
    borderColor: '#D4AF37',
  },
  nykaaPriceFloatingText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#D4AF37',
  },
  nykaaContent: {
    padding: 10,
  },
  nykaaBrandSub: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#E91E63',
    letterSpacing: 1,
    marginBottom: 2,
  },
  nykaaTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  nykaaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nykaaRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  nykaaRatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  nykaaAddBagBtn: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  nykaaAddBagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  compactCard: {
    width: 158,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  compactCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  compactImgWrap: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  compactImg: {
    width: '100%',
    height: '100%',
  },
  compactTagBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compactTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  compactFavBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactPriceFloatingPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  compactPriceFloatingText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#38BDF8',
  },
  compactContent: {
    padding: 8,
  },
  compactTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  compactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactRatingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  compactAddBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Regional Heritage Hero Card (Nykaa Royal Edit)
  stateHeritageHeroCard: {
    width: '100%',
    height: 184,
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    elevation: 5,
    shadowColor: '#4A0E2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  stateHeritageImg: {
    width: '100%',
    height: '100%',
  },
  stateHeritageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 10, 25, 0.65)',
    padding: 18,
    justifyContent: 'flex-end',
  },
  stateBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#D4AF37',
  },
  stateBadgeEmoji: {
    fontSize: 12,
  },
  stateBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  stateHeritageTitle: {
    fontSize: 18.5,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  stateHeritageSub: {
    fontSize: 11,
    color: '#F1F5F9',
    marginBottom: 10,
  },
  stateHeritageCtaRow: {
    alignSelf: 'flex-start',
  },
  stateHeritageCtaText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  // Time-Aware Section (Nykaa Daily Edit)
  timeAwareCard: {
    borderRadius: 24,
    padding: 16,
    marginTop: 22,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  timeAwareHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeBadgePill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeSeeAllText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeAwareTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  timeAwareSub: {
    fontSize: 11,
    color: '#475569',
  },
  // Asymmetric Lifestyle Collections Grid (Nykaa Magazine Spreads)
  asymmetricGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  asymmetricLeftHero: {
    flex: 1.1,
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    elevation: 4,
    shadowColor: '#4A0E2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  asymmetricHeroImg: {
    width: '100%',
    height: '100%',
  },
  asymmetricOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 10, 25, 0.6)',
    padding: 14,
    justifyContent: 'flex-end',
  },
  asymmetricBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: '#D4AF37',
  },
  asymmetricBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  asymmetricTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  asymmetricSub: {
    fontSize: 9.5,
    color: '#CBD5E1',
    marginTop: 2,
  },
  asymmetricRightColumn: {
    flex: 1,
    gap: 12,
  },
  asymmetricRightCard: {
    height: 114,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  asymmetricRightImg: {
    width: '100%',
    height: '100%',
  },
  asymmetricOverlayCompact: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 10, 25, 0.55)',
    padding: 10,
    justifyContent: 'flex-end',
  },
  asymmetricBadgeTextCompact: {
    fontSize: 8,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  asymmetricTitleCompact: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  trustItem: {
    alignItems: 'center',
    gap: 2,
  },
  trustText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },

  // Rewards Modal
  rewardModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  rewardModalCard: {
    width: width - 64,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },
  rewardModalDark: {
    backgroundColor: '#1E293B',
  },
  rewardModalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  rewardModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  rewardModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginVertical: 8,
  },
  rewardClaimBtn: {
    backgroundColor: THEME.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  rewardClaimText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Toast
  floatingToastBar: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: THEME.PRIMARY,
    shadowColor: THEME.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 200,
  },
  floatingToastText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.TEXT_DARK,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeTxt: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  locationChangeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  locationChangeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },

  // ⚡ QUICKBUY DARK CAPSULE CARD STYLES
  quickBuyDarkContainer: {
    backgroundColor: '#090D16',
    borderRadius: 22,
    padding: 14,
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  quickBuyDarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  quickBuyDarkTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickBuyDarkTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  quickBuyDarkBadge: {
    backgroundColor: '#451A03',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#78350F',
  },
  quickBuyDarkBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FB923C',
  },
  quickBuyDarkSeeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  quickBuyDarkSeeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  quickBuyDarkScroll: {
    gap: 12,
    paddingRight: 4,
  },
  quickBuyCircleCard: {
    alignItems: 'center',
    width: 62,
  },
  quickBuyCircleAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  quickBuyCircleImg: {
    width: '100%',
    height: '100%',
  },
  quickBuyCircleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 6,
  },
  quickBuyCircleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  quickBuyGreenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22C55E',
  },
  quickBuyCircleTimeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#22C55E',
  },

  // CATEGORY BADGES GRID
  categoryBadgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 12,
  },
  categoryBadgeCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  categoryBadgeCardDark: {
    backgroundColor: '#1E293B',
  },
  categoryBadgeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  categoryBadgeSub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
  },
  vibeScroll: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 16,
  },
  vibeDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 4,
  },
  vibeDotPill: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vibeCardSub: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  // ─── HERO BANNER SKELETON STYLES ───
  heroSkeletonCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  heroSkeletonCardDark: {
    backgroundColor: '#1E293B',
  },
  heroSkeletonContent: {
    flex: 1,
    marginRight: 12,
  },
  heroSkeletonTag: {
    width: 90,
    height: 12,
    backgroundColor: '#CBD5E1',
    borderRadius: 6,
    marginBottom: 10,
  },
  heroSkeletonTitle: {
    width: '85%',
    height: 18,
    backgroundColor: '#CBD5E1',
    borderRadius: 8,
    marginBottom: 8,
  },
  heroSkeletonSub: {
    width: '65%',
    height: 12,
    backgroundColor: '#CBD5E1',
    borderRadius: 6,
    marginBottom: 14,
  },
  heroSkeletonBtn: {
    width: 120,
    height: 32,
    backgroundColor: '#CBD5E1',
    borderRadius: 16,
  },
  heroSkeletonImg: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#CBD5E1',
  },
});
