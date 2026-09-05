import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Platform,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { auth, db } from '../services/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';
import { getDynamicWelcomeMessage } from '../constants/greetings';
import { getRandomOpener } from '../constants/openers';
import { SearchModal } from '../components/search/SearchModal';
import { FilterModal } from '../components/search/FilterModal';
import { LIFESTYLE_COLLECTIONS } from '../constants/collections';
import { getSmartTrendingBannersAsync, getSmartTrendingBannersSync, SmartTrendingBanner } from '../constants/trendingEngine';
import { QuickAddModal, QuickAddProduct } from '../components/cart/QuickAddModal';
import { AnimatedThemeToggle } from '../components/ui/AnimatedThemeToggle';
import { RevealOnScroll, ScrollContext } from '../components/ui/RevealOnScroll';
import { LocationPickerModal } from '../components/location/LocationPickerModal';
import { EditorialPromotionalBanner } from '../components/home/EditorialPromotionalBanner';
import { DarkLuxuryPromotionalSection } from '../components/home/DarkLuxuryPromotionalSection';
import { EditorialStoryModal, EditorialStoryData } from '../components/home/EditorialStoryModal';
import { useAddress } from '../context/AddressContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useProductTransition } from '../context/ProductTransitionContext';
import { QuickBuySection } from '../components/home/QuickBuySection';
import { AISmartFeed } from '../components/ai/AISmartFeed';
import { VoiceBuyModal } from '../components/ai/VoiceBuyModal';
import { AIAssistantChatModal } from '../components/ai/AIAssistantChatModal';
import { GeminiVoiceMode } from '../components/ai/GeminiVoiceMode';
import { ExpandableAIFab } from '../components/ai/ExpandableAIFab';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { SpatialDrawerWrapper, SpatialDrawerRef } from '../components/navigation/SpatialDrawerWrapper';
import { WalletModal } from '../components/wallet/WalletModal';
import { LoyaltyModal } from '../components/loyalty/LoyaltyModal';
import { CuratedBundleModal, CuratedBundleInfo } from '../components/cart/CuratedBundleModal';
import { styles } from '../components/home/home.styles';

const { width } = Dimensions.get('window');

// ─── DARK LUXURY HERO BACKGROUND POOL (AUTO-ROTATES EVERY 48 HOURS) ───
import { DARK_HERO_BACKGROUND_POOL, THEME, SEARCH_TICKERS, DAILY_QUOTES, QUICKBUY_GRID_ITEMS, DAILY_FLASH_DEALS, MOOD_CHIPS, VIBE_CARDS, FRUIT_SALAD_RECOMMENDED, FRUIT_SALAD_TAB_PRODUCTS, CURATED_COLLECTIONS } from '../data/mockHomeData';

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

// ─── FRUIT SALAD HIGH-FIDELITY CATALOG (Mockup Specific) ───
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

// ─── LOCATION-SENSITIVE FASHION, BEAUTY & QUICKBUY CURATOR (EVERY STATE & UT) ───
const getLocationSensitiveProducts = (userCity: string, stateId: string, stateName: string) => {
  const cityLower = (userCity || '').toLowerCase();
  const stateLower = (stateName || '').toLowerCase();
  const stateIdUpper = (stateId || '').toUpperCase();

  // 1. MAHARASHTRA & GOA (MH, GA - Mumbai, Pune, Panaji, Nagpur)
  if (
    stateIdUpper === 'MH' ||
    stateIdUpper === 'GA' ||
    stateLower.includes('maharashtra') ||
    stateLower.includes('goa') ||
    cityLower.includes('mumbai') ||
    cityLower.includes('pune') ||
    cityLower.includes('panaji')
  ) {
    const locName = cityLower.includes('pune') ? 'Pune' : cityLower.includes('panaji') ? 'Goa' : 'Mumbai';
    return {
      cityName: locName,
      locationLabel: `${locName} • Bandra High-Street & Coastal Wear`,
      products: [
        {
          id: 'mh-1',
          title: 'Coastal Breeze Relaxed Linen-Blend Shirt',
          price: '₹1,499',
          originalPrice: '₹1,999',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
          tag: `${locName} Coastal Linen`,
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'mh-2',
          title: 'Bandra High-Waist Wide-Leg Denim Jeans',
          price: '₹1,999',
          originalPrice: '₹2,699',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
          tag: 'Bandra Streetwear',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'mh-3',
          title: 'South Bombay Luxury Velvet Lipstick',
          price: '₹799',
          originalPrice: '₹1,099',
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
          tag: 'SoBo Glam Beauty',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'mh-4',
          title: 'Waterproof Ocean-Shield Mascara Duo',
          price: '₹549',
          originalPrice: '₹749',
          image: 'https://images.unsplash.com/photo-1560700146-15555773360b?w=600&auto=format&fit=crop&q=80',
          tag: 'Humidity-Proof Glam',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'mh-5',
          title: 'Handcrafted Paithani Silk Dupatta',
          price: '₹2,199',
          originalPrice: '₹2,999',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
          tag: 'Maharashtra Heritage Silk',
          category: 'ETHNIC FASHION',
          isQuickBuy: false,
        },
        {
          id: 'mh-6',
          title: 'Gold-Plated Minimalist Layered Chain',
          price: '₹649',
          originalPrice: '₹949',
          image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
          tag: 'Urban Accessories',
          category: 'ACCESSORIES',
          isQuickBuy: false,
        },
        {
          id: 'mh-7',
          title: 'Sparkling Alphonso Mango Soda Can',
          price: '₹99',
          originalPrice: '₹130',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
          tag: 'Express QuickBuy Beverage',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'mh-8',
          title: 'Handcrafted Sea Salt Chocolate Bites',
          price: '₹175',
          originalPrice: '₹220',
          image: 'https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=600&auto=format&fit=crop&q=80',
          tag: 'Express QuickBuy Snack',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'mh-9',
          title: 'White Chunky Retro Street Sneakers',
          price: '₹2,799',
          originalPrice: '₹3,599',
          image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
          tag: 'Street Footwear',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'mh-10',
          title: 'Vitamin C Brightening Face Glow Drops',
          price: '₹799',
          originalPrice: '₹1,199',
          image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          tag: 'Urban Skincare',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'mh-11',
          title: 'Gourmet Peri Peri Cashews (150g)',
          price: '₹299',
          originalPrice: '₹380',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          tag: 'QuickBuy Healthy Snack',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'mh-12',
          title: 'UV-Protected Retro Oversized Sunhat',
          price: '₹899',
          originalPrice: '₹1,299',
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
          tag: 'Coastal Accessories',
          category: 'ACCESSORIES',
          isQuickBuy: false,
        },
      ],
    };
  }

  // 2. KARNATAKA, TELANGANA & ANDHRA PRADESH (KA, TS, AP - Bengaluru, Hyderabad)
  if (
    stateIdUpper === 'KA' ||
    stateIdUpper === 'TS' ||
    stateIdUpper === 'TG' ||
    stateIdUpper === 'AP' ||
    stateLower.includes('karnataka') ||
    stateLower.includes('telangana') ||
    stateLower.includes('andhra') ||
    cityLower.includes('bengaluru') ||
    cityLower.includes('bangalore') ||
    cityLower.includes('hyderabad')
  ) {
    const locName = cityLower.includes('hyderabad') ? 'Hyderabad' : 'Bengaluru';
    return {
      cityName: locName,
      locationLabel: `${locName} • Indiranagar Tech & Jubilee Hills Chic`,
      products: [
        {
          id: 'south-1',
          title: 'Smart-Casual Breathable Knit Polo',
          price: '₹1,299',
          originalPrice: '₹1,799',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
          tag: `${locName} Tech Casuals`,
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'south-2',
          title: 'Indiranagar Slim-Fit Stretch Denim Jeans',
          price: '₹1,899',
          originalPrice: '₹2,499',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
          tag: 'Indiranagar Denim',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'south-3',
          title: 'Nude Velvet Hydrating Lip Color',
          price: '₹649',
          originalPrice: '₹899',
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
          tag: 'Jubilee Hills Glam',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'south-4',
          title: 'Handwoven Mysore Silk Saree',
          price: '₹2,999',
          originalPrice: '₹3,999',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
          tag: 'Heritage South Silk',
          category: 'ETHNIC FASHION',
          isQuickBuy: false,
        },
        {
          id: 'south-5',
          title: 'Anti-Pollution Clarifying Face Wash',
          price: '₹399',
          originalPrice: '₹599',
          image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          tag: 'Tech Park Skincare',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'south-6',
          title: '18K Rose Gold Plated Hoop Earrings',
          price: '₹599',
          originalPrice: '₹899',
          image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
          tag: 'Urban Accessories',
          category: 'ACCESSORIES',
          isQuickBuy: false,
        },
        {
          id: 'south-7',
          title: 'Artisanal Cold Brew Black Coffee',
          price: '₹149',
          originalPrice: '₹199',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
          tag: 'Express QuickBuy Brew',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'south-8',
          title: 'High-Protein Roasted Salted Almonds',
          price: '₹249',
          originalPrice: '₹320',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          tag: 'QuickBuy Fitness Snack',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'south-9',
          title: 'Lightweight Breathable Runner Shoes',
          price: '₹2,499',
          originalPrice: '₹3,299',
          image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
          tag: 'Activewear Footwear',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'south-10',
          title: 'Hydrating Coconut Water Mist (100ml)',
          price: '₹299',
          originalPrice: '₹450',
          image: 'https://images.unsplash.com/photo-1608248597260-244e832d7a9f?w=600&auto=format&fit=crop&q=80',
          tag: 'Daily Hydra Beauty',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'south-11',
          title: 'Rich Filter Coffee Decoction Bottle',
          price: '₹199',
          originalPrice: '₹260',
          image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
          tag: 'QuickBuy South Brew',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'south-12',
          title: 'Minimalist Laptop Sleeve Bag',
          price: '₹1,099',
          originalPrice: '₹1,599',
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
          tag: 'Tech Accessories',
          category: 'ACCESSORIES',
          isQuickBuy: false,
        },
      ],
    };
  }

  // 3. GURGAON / DELHI / HARYANA / NCR (HR, DL - Gurgaon, Delhi, Noida)
  if (
    cityLower.includes('gurgaon') ||
    cityLower.includes('gurugram') ||
    cityLower.includes('delhi') ||
    stateIdUpper === 'HR' ||
    stateIdUpper === 'DL' ||
    stateLower.includes('haryana') ||
    stateLower.includes('delhi')
  ) {
    return {
      cityName: 'Gurgaon',
      locationLabel: 'DLF CyberCity & High-Street Fashion',
      products: [
        {
          id: 'ggn-1',
          title: 'High-Waist Vintage Straight Denim Jeans',
          price: '₹1,899',
          originalPrice: '₹2,499',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
          tag: 'Gurgaon High-Street Denim',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'ggn-2',
          title: 'Oversized Relaxed Linen-Blend Shirt',
          price: '₹1,299',
          originalPrice: '₹1,799',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
          tag: 'CyberCity Casual Wear',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'ggn-3',
          title: 'Matte Velvet Luxury Lipstick (Ruby Nude)',
          price: '₹699',
          originalPrice: '₹999',
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
          tag: 'Gurgaon Beauty Bar',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'ggn-4',
          title: 'Waterproof Ultra-Volume Express Mascara',
          price: '₹499',
          originalPrice: '₹699',
          image: 'https://images.unsplash.com/photo-1560700146-15555773360b?w=600&auto=format&fit=crop&q=80',
          tag: 'High-Street Glam',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'ggn-5',
          title: 'Tailored Structured Cotton Crop Jacket',
          price: '₹2,499',
          originalPrice: '₹3,299',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
          tag: 'Corporate Chic Apparel',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'ggn-6',
          title: 'Minimalist 18K Gold Plated Hoop Earrings',
          price: '₹599',
          originalPrice: '₹899',
          image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
          tag: 'Accessories Pick',
          category: 'ACCESSORIES',
          isQuickBuy: false,
        },
        {
          id: 'ggn-7',
          title: 'Sparkling Nitro Cold Brew Coffee (4-Pack)',
          price: '₹199',
          originalPrice: '₹275',
          image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
          tag: 'Express QuickBuy Drink',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'ggn-8',
          title: 'Hand-Cooked Truffle & Sea Salt Chips',
          price: '₹149',
          originalPrice: '₹199',
          image: 'https://images.unsplash.com/photo-1566478989037-eec170784d07?w=600&auto=format&fit=crop&q=80',
          tag: 'Express QuickBuy Snack',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'ggn-9',
          title: 'Monochrome Chunky Dad Sneakers',
          price: '₹2,899',
          originalPrice: '₹3,799',
          image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80',
          tag: 'Gurgaon Street Footwear',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'ggn-10',
          title: 'Hydrating Botanical Hyaluronic Face Serum',
          price: '₹899',
          originalPrice: '₹1,299',
          image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
          tag: 'CyberCity Skincare Essentials',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'ggn-11',
          title: 'Artisanal Dark Chocolate Sea Salt Bar (100g)',
          price: '₹185',
          originalPrice: '₹240',
          image: 'https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=600&auto=format&fit=crop&q=80',
          tag: 'Express QuickBuy Gourmet',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'ggn-12',
          title: 'Polarized Vintage Square Sunglasses',
          price: '₹1,199',
          originalPrice: '₹1,699',
          image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
          tag: 'CyberCity Eyewear',
          category: 'ACCESSORIES',
          isQuickBuy: false,
        },
      ],
    };
  }

  // 4. PUNJAB & CHANDIGARH (PB, CH, JK, HP - Amritsar, Chandigarh, Ludhiana)
  if (
    cityLower.includes('punjab') ||
    cityLower.includes('chandigarh') ||
    cityLower.includes('amritsar') ||
    cityLower.includes('ludhiana') ||
    stateIdUpper === 'PB' ||
    stateIdUpper === 'CH' ||
    stateIdUpper === 'JK' ||
    stateIdUpper === 'HP' ||
    stateLower.includes('punjab') ||
    stateLower.includes('chandigarh')
  ) {
    return {
      cityName: 'Punjab',
      locationLabel: 'Amritsar Heritage & Chandigarh Urban Wear',
      products: [
        {
          id: 'pb-1',
          title: 'Handcrafted Phulkari Embroidered Kurti Set',
          price: '₹1,499',
          originalPrice: '₹1,999',
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
          tag: 'Amritsar Heritage Craft',
          category: 'ETHNIC FASHION',
          isQuickBuy: false,
        },
        {
          id: 'pb-2',
          title: 'Oversized Graphic Streetwear Cotton Shirt',
          price: '₹1,599',
          originalPrice: '₹2,199',
          image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
          tag: 'Chandigarh Urban Wear',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'pb-3',
          title: 'Relaxed Fit Multi-Pocket Cargo Denim Jeans',
          price: '₹1,999',
          originalPrice: '₹2,599',
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
          tag: 'Ludhiana Denim Hub',
          category: 'FASHION',
          isQuickBuy: false,
        },
        {
          id: 'pb-4',
          title: 'Bold Ruby Red Velvet Liquid Matte Lipstick',
          price: '₹699',
          originalPrice: '₹999',
          image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
          tag: 'Punjab Glam Beauty',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'pb-5',
          title: 'High-Impact Intense Volume Mascara',
          price: '₹499',
          originalPrice: '₹699',
          image: 'https://images.unsplash.com/photo-1560700146-15555773360b?w=600&auto=format&fit=crop&q=80',
          tag: 'Express Beauty Pick',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'pb-6',
          title: 'Hand-Carved Antique Traditional Jhumkas',
          price: '₹799',
          originalPrice: '₹1,199',
          image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
          tag: 'Punjabi Heritage Jewels',
          category: 'ACCESSORIES',
          isQuickBuy: false,
        },
        {
          id: 'pb-7',
          title: 'Pure Desi Cow Ghee & Gur Pinni Box',
          price: '₹349',
          originalPrice: '₹450',
          image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=600&auto=format&fit=crop&q=80',
          tag: 'Punjab QuickBuy Specialty',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'pb-8',
          title: 'Authentic Amritsari Rose Lassi Bottle',
          price: '₹120',
          originalPrice: '₹160',
          image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
          tag: 'QuickBuy Beverage',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'pb-9',
          title: 'Hand-Embroidered Leather Mojari Juttis',
          price: '₹1,299',
          originalPrice: '₹1,799',
          image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
          tag: 'Heritage Punjab Footwear',
          category: 'FOOTWEAR',
          isQuickBuy: false,
        },
        {
          id: 'pb-10',
          title: 'Royal Rose Water Face Toner Spray',
          price: '₹399',
          originalPrice: '₹599',
          image: 'https://images.unsplash.com/photo-1608248597260-244e832d7a9f?w=600&auto=format&fit=crop&q=80',
          tag: 'Natural Glow Beauty',
          category: 'BEAUTY',
          isQuickBuy: false,
        },
        {
          id: 'pb-11',
          title: 'Gourmet Roasted Pistachio & Almond Mix',
          price: '₹299',
          originalPrice: '₹399',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          tag: 'QuickBuy Healthy Snack',
          category: 'QUICKBUY',
          isQuickBuy: true,
        },
        {
          id: 'pb-12',
          title: 'Classic Woolen Tweed Blazer Coat',
          price: '₹3,499',
          originalPrice: '₹4,599',
          image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
          tag: 'Chandigarh Winter Apparel',
          category: 'FASHION',
          isQuickBuy: false,
        },
      ],
    };
  }

  // 5. ALL OTHER STATES & UNION TERRITORIES (BIHAR, UP, MP, RAJASTHAN, GUJARAT, WB, KERALA, TN, ODISHA, ASSAM, ETC.)
  const displayCity = userCity || stateName || 'Patna';
  return {
    cityName: displayCity,
    locationLabel: `${displayCity} • Civil Lines & Regional Heritage`,
    products: [
      {
        id: 'ptn-1',
        title: 'Casual Breathable Printed Cotton Linen Shirt',
        price: '₹1,199',
        originalPrice: '₹1,699',
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Menswear`,
        category: 'FASHION',
        isQuickBuy: false,
      },
      {
        id: 'ptn-2',
        title: 'Classic Woolen Tweed Blazer Overcoat',
        price: '₹3,499',
        originalPrice: '₹4,599',
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Menswear`,
        category: 'FASHION',
        isQuickBuy: false,
      },
      {
        id: 'ptn-3',
        title: 'Obsidian Chronograph Leather Strap Watch',
        price: '₹1,899',
        originalPrice: '₹2,499',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Luxury Watch`,
        category: 'ACCESSORIES',
        isQuickBuy: false,
      },
      {
        id: 'ptn-4',
        title: 'Handloom Chanderi Cotton Kurti & Dupatta Set',
        price: '₹1,499',
        originalPrice: '₹1,999',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Womens Heritage`,
        category: 'ETHNIC FASHION',
        isQuickBuy: false,
      },
      {
        id: 'ptn-5',
        title: 'Polarized Vintage Square Aviator Sunglasses',
        price: '₹1,199',
        originalPrice: '₹1,699',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Mens Eyewear`,
        category: 'ACCESSORIES',
        isQuickBuy: false,
      },
      {
        id: 'ptn-6',
        title: 'Relaxed Fit Multi-Pocket Cargo Denim Jeans',
        price: '₹1,699',
        originalPrice: '₹2,299',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Mens Streetwear`,
        category: 'FASHION',
        isQuickBuy: false,
      },
      {
        id: 'ptn-7',
        title: 'Handcrafted Full-Grain Leather Mojari Shoes',
        price: '₹1,299',
        originalPrice: '₹1,799',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Mens Footwear`,
        category: 'FOOTWEAR',
        isQuickBuy: false,
      },
      {
        id: 'ptn-8',
        title: 'Handloom Bhagalpuri Tussar Silk Saree',
        price: '₹2,799',
        originalPrice: '₹3,599',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Silk Classic`,
        category: 'ETHNIC FASHION',
        isQuickBuy: false,
      },
      {
        id: 'ptn-9',
        title: 'Heavyweight Oversized Streetwear Hoodie',
        price: '₹1,899',
        originalPrice: '₹2,499',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Urban Hoodie`,
        category: 'FASHION',
        isQuickBuy: false,
      },
      {
        id: 'ptn-10',
        title: 'Charcoal Beard & Facial Grooming Kit',
        price: '₹799',
        originalPrice: '₹1,199',
        image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Mens Grooming`,
        category: 'BEAUTY',
        isQuickBuy: false,
      },
      {
        id: 'ptn-11',
        title: 'Mithila Peri Peri Roasted Makhana (200g)',
        price: '₹199',
        originalPrice: '₹280',
        image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} QuickBuy Snack`,
        category: 'QUICKBUY',
        isQuickBuy: true,
      },
      {
        id: 'ptn-12',
        title: 'Organic Roasted Bihar Chana Sattu Flour',
        price: '₹149',
        originalPrice: '₹199',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
        tag: 'QuickBuy Superfood',
        category: 'QUICKBUY',
        isQuickBuy: true,
      },
      {
        id: 'ptn-13',
        title: 'Silk Matte Lip Crayon (Dusty Rose)',
        price: '₹599',
        originalPrice: '₹849',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
        tag: 'Regional Beauty',
        category: 'BEAUTY',
        isQuickBuy: false,
      },
      {
        id: 'ptn-14',
        title: 'Authentic Tilkut & Gur Anarsa Sweet Box',
        price: '₹249',
        originalPrice: '₹320',
        image: 'https://images.unsplash.com/photo-1582176647440-3b137b3156e3?w=600&auto=format&fit=crop&q=80',
        tag: 'Regional Sweet',
        category: 'QUICKBUY',
        isQuickBuy: true,
      },
      {
        id: 'ptn-15',
        title: 'Kesar & Sandalwood Radiance Face Glow Oil',
        price: '₹649',
        originalPrice: '₹899',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        tag: 'Ayurvedic Skincare',
        category: 'BEAUTY',
        isQuickBuy: false,
      },
      {
        id: 'ptn-16',
        title: 'Handcrafted Oxidized Silver Hoop Jhumkas',
        price: '₹549',
        originalPrice: '₹799',
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Jewelry`,
        category: 'ACCESSORIES',
        isQuickBuy: false,
      },
      {
        id: 'ptn-17',
        title: 'Retro Full-Grain Leather Court Sneakers',
        price: '₹2,499',
        originalPrice: '₹3,299',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
        tag: `${displayCity} Mens Kicks`,
        category: 'FOOTWEAR',
        isQuickBuy: false,
      },
      {
        id: 'ptn-18',
        title: 'Single-Origin Chikmagalur Dark Roast Coffee',
        price: '₹450',
        originalPrice: '₹590',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        tag: 'Gourmet Coffee',
        category: 'QUICKBUY',
        isQuickBuy: true,
      },
    ],
  };
};

// ─── DYNAMIC EDITORIAL JOURNAL GENERATOR (LOCATION & PRODUCT MATCHED) ───
const getDynamicEditorialSection = (cityName: string, products: any[], adminBanners?: any) => {
  const dayIndex = new Date().getDay(); // 0 to 6 daily rotation
  const issueNumbers = ['ISSUE N° 04 — LOCAL CURATION', 'ISSUE N° 05 — THE EDIT', 'ISSUE N° 06 — CITY FINDS', 'ISSUE N° 07 — REGIONAL EDITION', 'ISSUE N° 08 — TRENDING NOW'];
  const activeIssue = issueNumbers[dayIndex % issueNumbers.length];

  // 1. Shuffle products deterministically based on the day so it changes daily but is stable within the same day
  const seed = new Date().getDate();
  const safeProducts = products && products.length > 0 ? products : [{}]; // fallback empty object just in case
  
  const shuffledProducts = [...safeProducts].sort((a, b) => {
    return ((a.name?.length || 0) * seed) % 3 - ((b.name?.length || 0) * seed) % 3;
  });

  // 2. Pick 3 distinct products to serve as the "Anchors" for our stories
  const p1 = shuffledProducts[0] || safeProducts[0];
  const p2 = shuffledProducts[1] || safeProducts[0];
  const p3 = shuffledProducts[2] || safeProducts[0];

  const getCat = (p: any) => (p?.categoryName || p?.categoryId || 'GENERAL').toUpperCase().replace('_', ' ');
  // Use a fallback image ONLY if the specific product doesn't have any image at all in Firebase
  const getImg = (p: any) => p?.thumbnail || p?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80';

  const heroCat = getCat(p1);
  const card1Cat = getCat(p2);
  const card2Cat = getCat(p3);

  // Group products by these categories for the "Read Story" page
  const heroProducts = safeProducts.filter(p => getCat(p) === heroCat);
  const card1Products = safeProducts.filter(p => getCat(p) === card1Cat);
  const card2Products = safeProducts.filter(p => getCat(p) === card2Cat);

  const formatTitle = (cat: string) => cat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const heroStory = {
    issue: activeIssue,
    title: `The ${formatTitle(heroCat)} Edit of ${cityName}`,
    subtitle: `Curated top-tier ${heroCat.toLowerCase()} selections available locally in ${cityName}.`,
    author: 'EasyBuy Local Desk',
    readTime: '4 min read',
    coverImage: adminBanners?.editorialHero || getImg(p1),
    paragraphs: [
      `Our latest dive into the local market reveals a stunning collection of ${heroCat.toLowerCase()} right here in ${cityName}. We've handpicked the highest quality items tailored just for you.`,
      `Every product featured in this collection is available for immediate delivery. Discover what makes ${cityName}'s selection so unique.`,
      `Experience the best of ${formatTitle(heroCat)} curated by the EasyBuy Editorial Team.`,
    ],
    featuredProducts: heroProducts.length > 0 ? heroProducts.slice(0, 3) : safeProducts.slice(0, 3),
  };

  const craftCards = [
    {
      title: `${formatTitle(card1Cat)} Trends`,
      subtitle: `Discover local ${card1Cat.toLowerCase()} in ${cityName}`,
      image: adminBanners?.editorialCard1 || getImg(p2),
      tag: card1Cat,
      story: {
        issue: `${card1Cat} — EXCLUSIVE`,
        title: `${formatTitle(card1Cat)} in ${cityName}`,
        author: 'EasyBuy Curation Team',
        readTime: '3 min read',
        coverImage: adminBanners?.editorialCard1 || getImg(p2),
        paragraphs: [
          `Explore the finest ${card1Cat.toLowerCase()} sourced locally in ${cityName}.`,
          `Uncover premium selections curated just for you.`,
        ],
        featuredProducts: card1Products.length > 0 ? card1Products.slice(0, 3) : safeProducts.slice(0, 3),
      },
    },
    {
      title: `${cityName} ${formatTitle(card2Cat)}`,
      subtitle: `Top picks for ${card2Cat.toLowerCase()}`,
      image: adminBanners?.editorialCard2 || getImg(p3),
      tag: card2Cat,
      story: {
        issue: `${card2Cat} — EXCLUSIVE`,
        title: `Best of ${formatTitle(card2Cat)}`,
        author: 'EasyBuy Desk',
        readTime: '3 min read',
        coverImage: adminBanners?.editorialCard2 || getImg(p3),
        paragraphs: [
          `Discover the top-rated ${card2Cat.toLowerCase()} available for delivery right now in ${cityName}.`,
          `Carefully selected based on local trends and availability.`,
        ],
        featuredProducts: card2Products.length > 0 ? card2Products.slice(0, 3) : safeProducts.slice(0, 3),
      },
    },
  ];

  return { heroStory, craftCards };
};

const HOME_CATEGORY_VISUALS: Record<string, { image: string; countText: string }> = {
  electronics: { image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', countText: '101 items' },
  fashion: { image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80', countText: '101 items' },
  beauty: { image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80', countText: '376 items' },
  home_living: { image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80', countText: '240 items' },
  gaming: { image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80', countText: '38 items' },
  study_office: { image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&q=80', countText: '15 items' },
  fitness: { image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&q=80', countText: '37 items' },
  hostel_essentials: { image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80', countText: '23 items' },
  grocery: { image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', countText: '377 items' },
  kitchen: { image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80', countText: '38 items' },
  lifestyle: { image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=500&q=80', countText: '41 items' },
  accessories: { image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80', countText: '38 items' },
  footwear: { image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80', countText: '38 items' },
  sports: { image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80', countText: '37 items' },
  pet_care: { image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80', countText: '37 items' },
  automobile: { image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&q=80', countText: '36 items' },
  baby_care: { image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80', countText: '6 items' },
  health_care: { image: 'https://images.unsplash.com/photo-1607619056574-7b8d304a2c08?w=500&q=80', countText: '37 items' },
  gifts: { image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80', countText: '36 items' },
  men: { image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&q=80', countText: '350 items' },
  women: { image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80', countText: '400 items' },
  ethnic_wear: { image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80', countText: '250 items' },
};

const HOME_SPOTLIGHT_POOL = [
  { id: 'automobile', name: 'Automobile & Bike', badge: 'RIDING GEAR', tag: '36 items • Helmets & Care' },
  { id: 'health_care', name: 'Health & Wellness', badge: 'ESSENTIALS', tag: '37 items • BP & Supplements' },
  { id: 'pet_care', name: 'Pet Care & Food', badge: 'PET CARE', tag: '37 items • Dog & Cat Food' },
  { id: 'gifts', name: 'Gifts & Hampers', badge: 'GIFT SPECIAL', tag: '36 items • Gourmet Hampers' },
  { id: 'sports', name: 'Sports & Outdoors', badge: 'SPORTS', tag: '37 items • Cricket & Football' },
  { id: 'footwear', name: 'Footwear & Kicks', badge: 'KICKS', tag: '38 items • Sneakers & Boots' },
  { id: 'baby_care', name: 'Baby Care & Toys', badge: 'BABY CARE', tag: '6 items • Bath & Toys' },
  { id: 'kitchen', name: 'Kitchen & Appliances', badge: 'HOME CHEF', tag: '38 items • Air Fryers & Cookware' },
  { id: 'lifestyle', name: 'Lifestyle & Vibe', badge: 'AESTHETICS', tag: '41 items • Vinyl & Cameras' },
  { id: 'accessories', name: 'Accessories & Bags', badge: 'BAGS & WATCHES', tag: '38 items • Backpacks & Watches' },
  { id: 'fitness', name: 'Fitness & Gym', badge: 'WORKOUT', tag: '37 items • Home Gym & Mats' },
  { id: 'gaming', name: 'Gaming Zone', badge: 'GAMING SETUP', tag: '38 items • PS5 & RGB Gear' },
  { id: 'grocery', name: 'Supermarket Grocery', badge: 'DAILY FRESH', tag: '377 items • Snacks & Staples' },
  { id: 'study_office', name: 'Study & Office', badge: 'WORKSPACE', tag: '15 items • Desk Lamps & Organizers' },
  { id: 'hostel_essentials', name: 'Hostel Essentials', badge: 'DORM LIFE', tag: '23 items • Storage & Lighting' },
];

const getDailyHomeCategories = () => {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const shuffled = [...HOME_SPOTLIGHT_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((dayIndex * 1664525 + (i * 1013904223)) % (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled.slice(0, 5); 
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
  const { user } = useAuth();
  const [userName, setUserName] = useState(user?.fullName || (isAuthenticated ? '' : 'Guest'));
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [adminBanners, setAdminBanners] = useState<any>({});

  useEffect(() => {
    if (user?.fullName) {
      setUserName(user.fullName);
    }
  }, [user?.fullName]);

  useEffect(() => {
    // Listen for admin banner overrides
    const unsubscribe = onSnapshot(doc(db, 'app_config', 'banners'), (docSnap) => {
      if (docSnap.exists()) {
        setAdminBanners(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const recommendedCategories = useMemo(() => getDailyHomeCategories(), []);

  const locationSensitiveData = useMemo(() => {
    return getLocationSensitiveProducts(
      selectedAddress?.city || '',
      selectedStateId || '',
      selectedStateName || ''
    );
  }, [selectedAddress?.city, selectedStateId, selectedStateName]);

  const stateRecommendedProducts = (stateProducts || [])
    .slice(0, 40)
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

  const stateQuickBuyItems = (stateProducts || [])
    .filter((p) => p.categoryId === 'quickbuy')
    .slice(0, 6)
    .map((p, idx) => ({
      id: p.id,
      name: p.name,
      image: p.thumbnail,
      icon: 'flash-outline',
      bg: idx % 2 === 0 ? '#E8F5E9' : '#FFF3E0',
    }));

  // Re-define constants locally using real Firebase data
  const RECOMMENDED_PRODUCTS = stateRecommendedProducts;
  const RECENTLY_VIEWED = stateRecommendedProducts.slice(0, 4);

  // ─── Live GPS & World Location State ───
  const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [voiceBuyVisible, setVoiceBuyVisible] = useState(false);
  const [userWeather, setUserWeather] = useState('72° Sunny');

    // ─── Human Indian Time-Aware Greeting Engine ───
  const [greetingText, setGreetingText] = useState('Welcome to EasyBuy.');
  const [subtitleText, setSubtitleText] = useState('');
  const greetingFadeAnim = useRef(new Animated.Value(1)).current;
  const greetingTranslateY = useRef(new Animated.Value(0)).current;

    const loadFreshGreeting = async () => {
    const currentMonth = new Date().getMonth();
    const simulatedWeather = (currentMonth === 5 || currentMonth === 6) ? 'rain' : (currentMonth === 11 || currentMonth === 0) ? 'cold' : 'pleasant';
    const msg = getDynamicWelcomeMessage(userName || 'Guest', {
      wishlistCount: Object.values(favorites || {}).filter(Boolean).length,
      weather: simulatedWeather,
      campaign: 'none',
    });
    Animated.parallel([
      Animated.timing(greetingFadeAnim, { toValue: 0, duration: 150, useNativeDriver: false }),
      Animated.timing(greetingTranslateY, { toValue: -8, duration: 150, useNativeDriver: false }),
    ]).start(() => {
      setGreetingText(msg);
      setSubtitleText('');
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
  const [curatedBundleModalVisible, setCuratedBundleModalVisible] = useState(false);
  const [editorialStoryModalVisible, setEditorialStoryModalVisible] = useState(false);
  const [selectedEditorialStory, setSelectedEditorialStory] = useState<any>(null);
  const [heroBgManualIndex, setHeroBgManualIndex] = useState<number | null>(null);
  const [gamificationModal, setGamificationModal] = useState<string | null>(null);
  const [aiChatVisible, setAiChatVisible] = useState(false);
  const [geminiVoiceVisible, setGeminiVoiceVisible] = useState(false);
  const [fabCloseSignal, setFabCloseSignal] = useState(0);
  const fabScrollTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-rotates background photo every 48 hours (2 days)
  const autoRotationIndex = useMemo(() => {
    const twoDayPeriod = Math.floor(Date.now() / (1000 * 60 * 60 * 48));
    return twoDayPeriod % DARK_HERO_BACKGROUND_POOL.length;
  }, []);

  const activeHeroBg = useMemo(() => {
    const idx = heroBgManualIndex !== null ? heroBgManualIndex : autoRotationIndex;
    return DARK_HERO_BACKGROUND_POOL[idx % DARK_HERO_BACKGROUND_POOL.length];
  }, [heroBgManualIndex, autoRotationIndex]);

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

  // Hero Banner "Explore Now" button dynamic scroll translation (slides left -> right on scroll down, returns on scroll up)
  const exploreBtnAnimStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      reanimatedScrollY.value,
      [0, 180],
      [0, 220],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      reanimatedScrollY.value,
      [0, 150],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  // ─── TOP HEADER CART -> EXPLORE MORE SWAP WORKLETS ───
  const cartHeaderAnimStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      reanimatedScrollY.value,
      [150, 350],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [150, 350],
      [1, 0.5],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      reanimatedScrollY.value,
      [150, 350],
      [0, -10],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  const exploreHeaderAnimStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      reanimatedScrollY.value,
      [250, 450],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      reanimatedScrollY.value,
      [250, 450],
      [0.6, 1],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      reanimatedScrollY.value,
      [250, 450],
      [20, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }, { translateX }],
    };
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

  // Dynamic Menu Icon Color Switch (White on dark hero background -> Black when scrolling past into light body background)
  const [isHeaderIconDark, setIsHeaderIconDark] = useState(false);

  useAnimatedReaction(
    () => reanimatedScrollY.value > 220,
    (isPast, previous) => {
      if (isPast !== previous) {
        runOnJS(setIsHeaderIconDark)(isPast);
      }
    },
    []
  );

  // Close AI FAB when user scrolls — fires only once per scroll gesture
  const lastScrollY = useSharedValue(0);
  const hasFiredClose = useSharedValue(false);
  useAnimatedReaction(
    () => reanimatedScrollY.value,
    (current) => {
      if (!hasFiredClose.value && Math.abs(current - lastScrollY.value) > 8) {
        hasFiredClose.value = true;
        lastScrollY.value = current;
        runOnJS(setFabCloseSignal)((s: number) => s + 1);
      }
      // Reset flag when scroll settles near lastScrollY
      if (hasFiredClose.value && Math.abs(current - lastScrollY.value) < 2) {
        hasFiredClose.value = false;
        lastScrollY.value = current;
      }
    },
    []
  );

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
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'default',
    maxPrice: 15000,
    categoryFilter: 'all',
  });
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
  const [activeToastText, setActiveToastText] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (toastMessage) {
      setActiveToastText(toastMessage);
      setToastMessage(null); // immediately clear so it can re-trigger on tap

      // Reset animation values
      toastOpacity.setValue(0);
      toastTranslateY.setValue(8);

      // Fade In + Slide Up
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Reduced duration: show for 1.3 seconds
        setTimeout(() => {
          // Fade Out + Slide Down
          Animated.parallel([
            Animated.timing(toastOpacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(toastTranslateY, {
              toValue: 8,
              duration: 150,
              useNativeDriver: true,
            })
          ]).start(() => {
            setActiveToastText(null);
          });
        }, 1300);
      });
    }
  }, [toastMessage]);

  // ─── Gamification Modal ───
  
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

    // Subtle press down → smooth fade out — no bounce, no overshoot
    Animated.sequence([
      // Gentle press: barely visible scale-down
      Animated.timing(searchCapsuleScale, {
        toValue: 0.97,
        duration: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Simultaneously: restore scale + home screen fades out smoothly
      Animated.parallel([
        Animated.timing(searchCapsuleScale, {
          toValue: 1.0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(homeExitOpacity, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(homeExitTranslateY, {
          toValue: -18,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setSearchModalVisible(true);
    });
  };

  const handleCloseSearchModal = () => {
    setSearchModalVisible(false);
    searchCapsuleScale.setValue(1);
    Animated.parallel([
      Animated.timing(homeExitOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(homeExitTranslateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  };

  const openQuickAdd = (product: QuickAddProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id }
    } as any);
  };

  const handleAddToCart = (product: any, size = 'M', color = 'Standard', qty = 1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    triggerCartBadgeSpring();

    const pId = String(product.id || product.productId || `mock_${Math.random().toString(36).substr(2, 9)}`);
    const pTitle = String(product.title || product.name || 'EasyBuy Product');
    const pPrice = product.priceFormatted || (typeof product.price === 'number' ? `₹${product.price}` : String(product.price || ''));
    const pOrigPrice = product.originalPriceFormatted || (typeof product.originalPrice === 'number' ? `₹${product.originalPrice}` : String(product.originalPrice || ''));
    const pImg = product.image || product.thumbnail || (product.images && product.images[0]) || '';

    for (let i = 0; i < qty; i++) {
      addToCart({
        id: pId,
        title: pTitle,
        price: pPrice,
        originalPrice: pOrigPrice,
        image: pImg,
        selectedVariant: `${size} / ${color}`,
      });
    }

    setToastMessage('Added to Cart');
    setTimeout(() => setToastMessage(null), 3000);
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

        // ─── CATEGORY TABS ───
  const CATEGORY_TABS = [
    { id: 'all', label: 'All' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'sports', label: 'Sports' },
    { id: 'grocery', label: 'Grocery' },
    { id: 'home', label: 'Home' },
    { id: 'beauty', label: 'Beauty' },
  ];
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  // ─── SECTION TABS (Hottest / Popular / New / Offers) ───
  const SECTION_TABS = [
    { id: 'hot', label: 'Hottest' },
    { id: 'popular', label: 'Popular' },
    { id: 'new', label: 'New' },
    { id: 'offers', label: 'Offers' },
  ];
  const [activeSectionTab, setActiveSectionTab] = useState('hot');

  // Helper to get products by section tab
  const getTabProducts = () => {
    switch (activeSectionTab) {
      case 'hot': return RECOMMENDED_PRODUCTS.slice(0, 6);
      case 'popular': return RECOMMENDED_PRODUCTS.slice(2, 8);
      case 'new': return stateRecommendedProducts.slice(0, 6);
      case 'offers': return RECOMMENDED_PRODUCTS.filter((p: any) => p.discount).slice(0, 6);
      default: return RECOMMENDED_PRODUCTS.slice(0, 6);
    }
  };

  
  // Real Firebase & Catalog products for Everyday Staples (STRICTLY EXCLUDES QuickBuy Express items like Potatoes, Strawberries, Milk, Eggs, Bread, Atta)
  const realStaplesProducts = useMemo(() => {
    const source = stateProducts || [];
    if (source.length === 0) return [];
    
    // Strict blacklist for express/quickbuy items (raw produce, daily dairy, quick snacks)
    const isExpressItem = (p: any) => {
      const cat = (p.categoryId || '').toLowerCase();
      if (cat === 'quickbuy') return true;
      
      const name = (p.name || p.title || '').toLowerCase();
      const forbidden = [
        'potato', 'strawberr', 'milk', 'egg', 'bread', 'atta', 'flour', 'curd',
        'dahi', 'paneer', 'butter', 'onion', 'tomato', 'banana', 'apple',
        'chip', 'biscuit', 'noodle', 'maggi', 'soda', 'coke', 'pepsi', 'ice cream',
        'chocolate', 'quickbuy', 'fresh organic seasonal', 'fresh organic'
      ];
      return forbidden.some((kw) => name.includes(kw));
    };

    const staples = source.filter((p: any) => {
      if (isExpressItem(p)) return false; // Strictly NO express quickbuy items!
      
      const cat = (p.categoryId || '').toLowerCase();
      const name = (p.name || p.title || '').toLowerCase();

      // Match genuine non-express pantry staples & regional specialties
      return (
        cat === 'kitchen' ||
        cat === 'health_care' ||
        cat === 'lifestyle' ||
        name.includes('makhana') ||
        name.includes('sattu') ||
        name.includes('honey') ||
        name.includes('tea') ||
        name.includes('coffee') ||
        name.includes('oat') ||
        name.includes('oil') ||
        name.includes('almond') ||
        name.includes('nut') ||
        name.includes('dry fruit') ||
        name.includes('spice') ||
        name.includes('ghee') ||
        name.includes('granola') ||
        name.includes('juice') ||
        (cat === 'grocery' && !isExpressItem(p))
      );
    });

    const finalPool = staples.filter((p: any) => !isExpressItem(p));
    return finalPool.slice(0, 12).map((prod: any) => {
      const title = prod.name || prod.title || 'Staple Product';
      const catName = prod.categoryName
        ? prod.categoryName.toUpperCase()
        : (prod.categoryId ? prod.categoryId.toUpperCase().replace('_', ' ') : 'PANTRY');
      return {
        id: prod.id,
        title,
        price: typeof prod.price === 'number' ? `₹${prod.price}` : (prod.price || '₹199'),
        image: prod.thumbnail || prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        tag: catName,
        raw: prod,
      };
    });
  }, [stateProducts]);

  // Dynamic Curated Bundle rotation based on Day of Week, Time of Day & Festivals
  const dynamicCuratedBundle: CuratedBundleInfo & { avatar1: string; avatar2: string; badge: string } = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const hour = now.getHours(); // 0 - 23
    const month = now.getMonth(); // 0 = Jan, 7 = Aug
    const date = now.getDate();

    const isWeekend = day === 0 || day === 5 || day === 6;
    const isLateNight = hour >= 21 || hour < 5;
    const isMorning = hour >= 5 && hour < 12;
    
    // ─── INDIAN FESTIVAL CALENDAR ───
    // Approximated to English calendar months for this dynamic engine
    const FESTIVALS = [
      { name: 'Makar Sankranti & Pongal', month: 0, start: 10, end: 18, tag: 'FESTIVE HARVEST', title: 'Sankranti & Pongal Specials', subtitle: 'Til, jaggery, rice, and harvest essentials!', avatar1: 'https://images.unsplash.com/photo-1574316074211-50e5ebf86989?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=200&q=80', badge: '🌾', keywords: ['jaggery', 'til', 'rice', 'sweet', 'ghee'] },
      { name: 'Holi', month: 2, start: 10, end: 31, tag: 'FESTIVE COLORS', title: 'Holi Celebration Kit', subtitle: 'Snacks, sweets, and organic colors for a vibrant Holi!', avatar1: 'https://images.unsplash.com/photo-1552554749-d3e510862089?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&q=80', badge: '🎨', keywords: ['sweet', 'snack', 'drink', 'color', 'gujiya', 'chip'] },
      { name: 'Eid', month: 3, start: 5, end: 20, tag: 'FESTIVE FEAST', title: 'Eid Grand Feast Hamper', subtitle: 'Premium dates, dry fruits, and biryani essentials.', avatar1: 'https://images.unsplash.com/photo-1588693766620-e2ef6e9f16ef?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1550974798-2cb634d54625?w=200&q=80', badge: '🌙', keywords: ['date', 'dry fruit', 'rice', 'spice', 'meat', 'sweet'] },
      { name: 'Raksha Bandhan', month: 7, start: 15, end: 20, tag: 'FESTIVE SPECIAL', title: 'Rakhi Gift Hamper', subtitle: 'Curated sweets, chocolates, and gifts for siblings!', avatar1: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&q=80', badge: '🎁', keywords: ['gift', 'sweet', 'chocolate', 'cadbury', 'rakhi', 'hamper'] },
      { name: 'Ganesh Chaturthi', month: 8, start: 1, end: 15, tag: 'FESTIVE SPECIAL', title: 'Ganesh Utsav Essentials', subtitle: 'Modak, sweets, and puja essentials for Bappa.', avatar1: 'https://images.unsplash.com/photo-1601314115160-c3d350ec85f7?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80', badge: '🐘', keywords: ['modak', 'sweet', 'laddoo', 'ghee', 'puja'] },
      { name: 'Onam', month: 8, start: 16, end: 30, tag: 'FESTIVE HARVEST', title: 'Onam Sadhya Essentials', subtitle: 'Spices, coconut, and traditional staples for Sadhya.', avatar1: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&q=80', badge: '🥥', keywords: ['coconut', 'spice', 'rice', 'banana', 'oil'] },
      { name: 'Navratri', month: 9, start: 1, end: 15, tag: 'FESTIVE FASTING', title: 'Navratri Fasting & Feast', subtitle: 'Vrat essentials, pure ghee, makhana, and fresh fruits.', avatar1: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1627485937980-221c88ab04f9?w=200&q=80', badge: '🔱', keywords: ['vrat', 'makhana', 'sattu', 'ghee', 'fruit', 'dry fruit', 'nut'] },
      { name: 'Diwali', month: 9, start: 20, end: 31, tag: 'FESTIVE SPARKLE', title: 'Diwali Sparkle Hamper', subtitle: 'Premium dry fruits, artisanal chocolates, and treats!', avatar1: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1508061252966-f7ac25ab2655?w=200&q=80', badge: '🪔', keywords: ['dry fruit', 'nut', 'almond', 'cashew', 'chocolate', 'sweet', 'gift'] },
      { name: 'Christmas', month: 11, start: 20, end: 31, tag: 'FESTIVE CHEER', title: 'Christmas Bake & Joy', subtitle: 'Cakes, cookies, chocolates, and baking essentials.', avatar1: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=200&q=80', avatar2: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&q=80', badge: '🎄', keywords: ['cake', 'cookie', 'chocolate', 'bake', 'sweet', 'gift'] },
    ];

    const activeFestival = FESTIVALS.find(f => 
      f.month === month && date >= f.start && date <= f.end
    );

    // Helper to dynamically fetch products from the catalog instead of hardcoding
    const getDynamicItems = (keywords: string[], count = 4) => {
      const pool = stateProducts || [];
      if (pool.length === 0) return [];
      
      // Shuffle pool slightly for variety
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      
      const filtered = shuffled.filter(p => {
        const name = (p.name || p.title || '').toLowerCase();
        const cat = (p.categoryName || p.categoryId || '').toLowerCase();
        return keywords.some(kw => name.includes(kw) || cat.includes(kw));
      });
      
      // If we found ANY matching items, use them (even if it's less than `count`). 
      // ONLY fallback to random items if there are literally zero matches.
      const matched = filtered.slice(0, count);
      const finalItems = matched.length > 0 ? matched : shuffled.slice(0, count);
      
      return finalItems.map(p => {
        const priceNum = typeof p.price === 'number' ? p.price : Number((p.price || '199').toString().replace(/[^0-9]/g, ''));
        return {
          id: p.id,
          title: p.name || p.title || 'Curated Item',
          price: `₹${priceNum}`,
          priceNum: priceNum,
          originalPrice: `₹${priceNum + Math.floor(priceNum * 0.3)}`,
          image: p.thumbnail || p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
          category: (p.categoryName || p.categoryId || 'FEATURED').toUpperCase().replace('_', ' '),
        };
      });
    };

    if (activeFestival) {
      return {
        tag: activeFestival.tag,
        title: activeFestival.title,
        subtitle: activeFestival.subtitle,
        price: '₹599',
        oldPrice: '₹899',
        avatar1: activeFestival.avatar1,
        avatar2: activeFestival.avatar2,
        badge: activeFestival.badge,
        items: getDynamicItems(activeFestival.keywords),
      };
    }

    if (isLateNight) {
      return {
        tag: 'LATE NIGHT SPECIAL',
        title: 'Late-Night Craving & Calm Kit',
        subtitle: 'Gourmet snacks, soothing herbal sips & midnight artisanal treats.',
        price: '₹349',
        oldPrice: '₹499',
        avatar1: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
        avatar2: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
        badge: '+3',
        items: getDynamicItems(['snack', 'chip', 'noodle', 'maggi', 'tea', 'coffee', 'chocolate']),
      };
    }

    if (isWeekend) {
      return {
        tag: 'CURATED BUNDLE',
        title: 'The Weekender Survival Kit',
        subtitle: 'Everything you need to survive the weekend, curated in one tap.',
        price: '₹499',
        oldPrice: '₹699',
        avatar1: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
        avatar2: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
        badge: '+3',
        items: getDynamicItems(['snack', 'beverage', 'party', 'juice', 'cookie', 'biscuit']),
      };
    }

    if (isMorning) {
      return {
        tag: 'MORNING ESSENTIALS',
        title: 'Morning Power Start Bundle',
        subtitle: 'Fresh essentials to kickstart your day right.',
        price: '₹299',
        oldPrice: '₹399',
        avatar1: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
        avatar2: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&auto=format&fit=crop&q=80',
        badge: '+2',
        items: getDynamicItems(['milk', 'bread', 'egg', 'coffee', 'tea', 'oat', 'fruit']),
      };
    }

    // Default Mid-Day
    return {
      tag: 'DAILY ESSENTIALS',
      title: 'Mid-Day Restock Kit',
      subtitle: 'Top up your pantry with everyday healthy essentials.',
      price: '₹449',
      oldPrice: '₹599',
      avatar1: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&auto=format&fit=crop&q=80',
      avatar2: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80',
      badge: '+4',
      items: getDynamicItems(['grocery', 'spice', 'oil', 'dal', 'rice', 'staple']),
    };
  }, [stateProducts]);


  const dynamicEditorial = useMemo(() => {
    return getDynamicEditorialSection(locationSensitiveData.cityName, locationSensitiveData.products, adminBanners);
  }, [locationSensitiveData.cityName, locationSensitiveData.products, adminBanners]);

  return (
    <SpatialDrawerWrapper
      ref={spatialDrawerRef}
      userName={user?.fullName || userName || 'Guest'}
      userEmail={user?.email || 'guest@easybuy.com'}
      userAvatar={user?.photoURL || undefined}
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
          setToastMessage('🎁 Gift Ideas Coming Soon!');
          setTimeout(() => setToastMessage(null), 3500);
        } else if (itemId === 'help' || itemId === 'profile') {
          router.push('/profile' as any);
        } else if (itemId === 'logout') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          (async () => {
            try {
              await auth.signOut();
              await AsyncStorage.removeItem('isAdmin').catch(() => {});
              router.replace('/login' as any);
            } catch (e) {
              console.log('Logout error:', e);
            }
          })();
        }
      }}
    >
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />

                {/* ─── TOP HEADER BAR ─── */}
        <Animated.View style={[styles.newHeader, isDarkMode && styles.newHeaderDark, { opacity: headerEntranceOpacity }]} pointerEvents="box-none">
          <TouchableOpacity onPress={handleMenuBtnPress} activeOpacity={0.7} style={{ padding: 4 }}>
            <Animated.View style={{ transform: [{ scale: menuBtnScale }] }}>
              <Ionicons
                name="reorder-two-outline"
                size={34}
                color={isHeaderIconDark && !isDarkMode ? '#0F172A' : '#FFFFFF'}
              />
            </Animated.View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', height: 44, justifyContent: 'flex-end' }} pointerEvents="box-none">
            {/* 1. Floating Cart Icon (Active at top hero point) */}
            <Reanimated.View style={[cartHeaderAnimStyle, { position: 'absolute', right: 0 }]} pointerEvents={!isHeaderIconDark ? 'auto' : 'none'}>
              <TouchableOpacity style={[styles.newCartBtn, isDarkMode && styles.newCartBtnDark]} onPress={() => router.push('/cart' as any)} activeOpacity={0.75} disabled={isHeaderIconDark}>
                <View style={styles.newCartIconContainer}>
                  <Ionicons name="bag-handle-outline" size={22} color="#FFFFFF" />
                  {totalItems > 0 && (
                    <View style={[styles.newCartBadge, isDarkMode && styles.newCartBadgeDark]}>
                      <Text style={styles.newCartBadgeTxt}>{totalItems}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Reanimated.View>

            {/* 2. Explore Header Pill Button (Minimal single-line 'Explore') */}
            <Reanimated.View style={[exploreHeaderAnimStyle, { position: 'absolute', right: 0 }]} pointerEvents={isHeaderIconDark ? 'auto' : 'none'}>
              <TouchableOpacity
                style={styles.headerExploreMoreBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  router.push('/all-items');
                }}
                activeOpacity={0.8}
                disabled={!isHeaderIconDark}
              >
                <Ionicons name="compass-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.headerExploreMoreText} numberOfLines={1}>Explore</Text>
              </TouchableOpacity>
            </Reanimated.View>
          </View>
        </Animated.View>

        <ScrollContext.Provider value={reanimatedScrollY}>
          <Reanimated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.refScrollContent}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
          >
            {/* ─── HERO BANNER IMAGE BACKGROUND ─── */}
            <ImageBackground
              source={{ uri: activeHeroBg.uri }}
              style={styles.heroBannerBackground}
              resizeMode="cover"
            >
              <View style={styles.heroBannerOverlay}>
                {/* Space to push greeting content below the absolute header */}
                <View style={{ height: 105 }} />

                {/* ─── GREETING ─── */}
                <Animated.View style={{ opacity: headerEntranceOpacity, transform: [{ translateY: headerEntranceTranslateY }] }}>
                  <View style={styles.refGreetingBlockHero}>
                    <Text style={styles.refGreetQuestionHero}>
                      {greetingText}
                    </Text>
                  </View>
                </Animated.View>

                {/* ─── SEARCH BAR ─── */}
                <Reanimated.View style={reanimatedSearchCapsuleStyle}>
                  <Animated.View style={{ opacity: searchEntranceOpacity, transform: [{ scale: searchEntranceScale }] }}>
                    <Animated.View style={{ transform: [{ scale: searchCapsuleScale }] }}>
                      <View style={styles.translucentSearchCapsule}>
                        <TouchableOpacity
                          style={styles.iosSearchLeft}
                          onPress={() => openSearch('text')}
                          activeOpacity={1}
                        >
                          <Ionicons name="search-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.translucentSearchPlaceholder} numberOfLines={1}>
                            Search products, recipes, essentials...
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.translucentSearchDivider} />
                        <TouchableOpacity
                          style={styles.iosSearchFilterBtn}
                          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); setFilterModalVisible(true); }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="options-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  </Animated.View>
                </Reanimated.View>

                {/* ─── EXPLORE NOW BUTTON ─── */}
                <Reanimated.View style={exploreBtnAnimStyle}>
                  <TouchableOpacity
                    style={styles.heroExploreBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      router.push('/all-items');
                    }}
                  >
                    <Text style={styles.heroExploreBtnText}>Explore Now</Text>
                  </TouchableOpacity>
                </Reanimated.View>
              </View>
            </ImageBackground>

            {/* ─── DAILY RECOMMENDATIONS (Rotating Categories) ─── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, marginBottom: 12 }}>
              <Text style={{ fontSize: 21, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: '700', letterSpacing: -0.2, color: isDarkMode ? '#F8FAFC' : '#1C1917' }}>
                Recommended Categories
              </Text>
              <TouchableOpacity onPress={() => router.push('/all-items')} activeOpacity={0.7}>
                <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: isDarkMode ? '#94A3B8' : '#475569', textTransform: 'uppercase' }}>
                  SEE ALL
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, gap: 14 }}
              decelerationRate="fast"
              snapToInterval={140 + 14}
              snapToAlignment="start"
            >
              {recommendedCategories.map((item: any) => {
                const meta = HOME_CATEGORY_VISUALS[item.id];
                if (!meta) return null;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      width: 140,
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      borderRadius: 14,
                      padding: 8,
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#334155' : '#F1F5F9',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      router.push({
                        pathname: '/category-products',
                        params: { categoryId: item.id }
                      });
                    }}
                    activeOpacity={0.9}
                  >
                    {/* Rectangular Image Container with floating badge */}
                    <View style={{ position: 'relative', width: '100%', height: 115, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                      <Image
                        source={{ uri: meta.image }}
                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                      />
                      <View style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        backgroundColor: '#2F6E49',
                        paddingHorizontal: 6,
                        paddingVertical: 2.5,
                        borderRadius: 6,
                      }}>
                        <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 }}>
                          {item.badge}
                        </Text>
                      </View>
                    </View>

                    {/* Text Details */}
                    <View style={{ paddingTop: 8, paddingHorizontal: 2 }}>
                      {/* Category Name */}
                      <Text style={{ fontSize: 13, fontWeight: '600', color: isDarkMode ? '#F8FAFC' : '#1E293B' }} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {/* Count Info */}
                      <Text style={{ fontSize: 10.5, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 3 }}>
                        {meta.countText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ─── STICH AI CURATED BUNDLE BANNER (Pixel-Perfect Matching Uploaded Design) ─── */}
            <TouchableOpacity
              style={{
                marginHorizontal: 20,
                marginTop: 22,
                marginBottom: 16,
                borderRadius: 20,
                padding: 20,
                backgroundColor: isDarkMode ? '#1E293B' : '#EFECE6',
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#E2DCD2',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDarkMode ? 0.2 : 0.06,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setCuratedBundleModalVisible(true);
              }}
              activeOpacity={0.92}
            >
              {/* UPPERCASE CATEGORY TAG */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1.6,
                  color: isDarkMode ? '#94A3B8' : '#78716C',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {dynamicCuratedBundle.tag}
              </Text>

              {/* SERIF HEADLINE */}
              <Text
                style={{
                  fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                  fontSize: 23,
                  fontWeight: '700',
                  color: isDarkMode ? '#F8FAFC' : '#1C1917',
                  marginBottom: 6,
                  lineHeight: 28,
                }}
              >
                {dynamicCuratedBundle.title}
              </Text>

              {/* SUBTITLE */}
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  color: isDarkMode ? '#CBD5E1' : '#57534E',
                  marginBottom: 16,
                  maxWidth: '92%',
                }}
              >
                {dynamicCuratedBundle.subtitle}
              </Text>

              {/* OVERLAPPING AVATARS (+3 BADGE) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    borderWidth: 2.5,
                    borderColor: isDarkMode ? '#1E293B' : '#EFECE6',
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                    elevation: 2,
                  }}
                >
                  <Image
                    source={{ uri: dynamicCuratedBundle.avatar1 }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                </View>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    borderWidth: 2.5,
                    borderColor: isDarkMode ? '#1E293B' : '#EFECE6',
                    backgroundColor: '#FFFFFF',
                    overflow: 'hidden',
                    marginLeft: -12,
                    elevation: 2,
                  }}
                >
                  <Image
                    source={{ uri: dynamicCuratedBundle.avatar2 }}
                    style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                  />
                </View>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    borderWidth: 2.5,
                    borderColor: isDarkMode ? '#1E293B' : '#EFECE6',
                    backgroundColor: isDarkMode ? '#334155' : '#E2DCD2',
                    marginLeft: -12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#44403C' }}>
                    {dynamicCuratedBundle.badge}
                  </Text>
                </View>
              </View>

              {/* FOOTER: PRICE & ADD BUNDLE BUTTON */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#1C1917' }}>
                    {dynamicCuratedBundle.price}
                  </Text>
                  <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#78716C', textDecorationLine: 'line-through' }}>
                    {dynamicCuratedBundle.oldPrice}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#000000',
                    paddingHorizontal: 20,
                    paddingVertical: 11,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                    activeOpacity={0.85}
                    onPress={(e) => {
                      e.stopPropagation();
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                      dynamicCuratedBundle.items.slice(0, 5).forEach((item: any) => {
                        handleAddToCart(item.raw || {
                          id: item.id,
                          name: item.title,
                          price: item.priceNum,
                          priceFormatted: item.price,
                          image: item.image,
                          thumbnail: item.image,
                          categoryName: item.category,
                        });
                      });
                      setToastMessage(`Added all 5 items from ${dynamicCuratedBundle.title}! 🛍️`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' }}>
                      ADD BUNDLE
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

            {/* ─── PREMIUM PROMO BANNERS / CAMPAIGNS (Replacing Demo Salads) ─── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, gap: 16, marginTop: 12, paddingBottom: 20 }}
              decelerationRate="fast"
              snapToInterval={290 + 16}
              snapToAlignment="start"
            >
              {[
                {
                  id: 'tech_campaign',
                  tag: 'TECH COLLECTIVE',
                  title: 'Upgrade Your Tech Vibe',
                  subtitle: 'Premium gadgets, high-fidelity audio, and ambient workspace accessories.',
                  buttonText: 'Explore Tech',
                  image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
                  targetCategoryId: 'electronics',
                },
                {
                  id: 'home_campaign',
                  tag: 'MINIMAL LIVING',
                  title: 'Elevate Your Space',
                  subtitle: 'Handcrafted ceramic decor, soft ambient lighting, and bespoke furniture.',
                  buttonText: 'Shop Home',
                  image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
                  targetCategoryId: 'home_living',
                },
                {
                  id: 'fashion_campaign',
                  tag: 'SEASONAL EDITIONS',
                  title: 'Clean Minimal Fits',
                  subtitle: 'Heavyweight organic cotton tees, tailored layers, and streetwear kicks.',
                  buttonText: 'Shop Style',
                  image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
                  targetCategoryId: 'fashion',
                },
              ].map((campaign) => (
                <TouchableOpacity
                  key={campaign.id}
                  style={{
                    width: 290,
                    height: 200,
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#334155' : '#F1F5F9',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode ? 0.2 : 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    router.push({
                      pathname: '/category-products',
                      params: { categoryId: campaign.targetCategoryId }
                    } as any);
                  }}
                  activeOpacity={0.92}
                >
                  <Image
                    source={{ uri: campaign.image }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: isDarkMode ? 0.35 : 0.45,
                    }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  />
                  <View style={{ flex: 1, padding: 18, justifyContent: 'space-between' }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 9.5,
                          fontWeight: '800',
                          letterSpacing: 1.5,
                          color: isDarkMode ? '#38BDF8' : '#10B981',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                        }}
                      >
                        {campaign.tag}
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: isDarkMode ? '#F8FAFC' : '#1E293B',
                          lineHeight: 22,
                          marginBottom: 4,
                        }}
                      >
                        {campaign.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: isDarkMode ? '#94A3B8' : '#475569',
                          lineHeight: 15,
                        }}
                        numberOfLines={3}
                      >
                        {campaign.subtitle}
                      </Text>
                    </View>

                    <View
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: isDarkMode ? '#FFFFFF' : '#1E293B',
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 14,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '800',
                          color: isDarkMode ? '#0F172A' : '#FFFFFF',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {campaign.buttonText}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ─── LOCATION-SENSITIVE CURATED FASHION, BEAUTY & QUICKBUY GRID (MIDNIGHT CRAVINGS MINIMALIST UI - IMAGE 1) ─── */}
            <View style={{ paddingHorizontal: 20, marginTop: 28, marginBottom: 16 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '400',
                fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                color: isDarkMode ? '#F8FAFC' : '#1E293B',
                letterSpacing: -0.3,
              }}>
                Curated for {locationSensitiveData.cityName}
              </Text>
              <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                {locationSensitiveData.locationLabel}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between' }}>
              {locationSensitiveData.products.map((prod, idx) => (
                <TouchableOpacity
                  key={`loc_prod_${prod.id}_${idx}`}
                  style={{
                    width: '48%',
                    marginBottom: 22,
                  }}
                  onPress={() => router.push({
                    pathname: '/product/[id]',
                    params: {
                      id: prod.id,
                      title: prod.title,
                      price: prod.price,
                      originalPrice: prod.originalPrice,
                      image: prod.image,
                      category: prod.category || prod.tag,
                      brand: 'EasyBuy',
                      description: prod.tag,
                    }
                  } as any)}
                  activeOpacity={0.9}
                >
                  {/* Clean Minimalist Image Container with Floating White Circular Plus Button (Image 1 Style) */}
                  <View style={{
                    position: 'relative',
                    width: '100%',
                    height: 175,
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: isDarkMode ? '#1E293B' : '#F4F1EA',
                  }}>
                    <Image
                      source={{ uri: prod.image }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                    
                    {/* Category / QuickBuy Badge */}
                    {prod.isQuickBuy ? (
                      <View style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: '#FF6B00',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                      }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>⚡ QUICKBUY</Text>
                      </View>
                    ) : null}

                    {/* Floating White Circular Plus Button (Image 1 Signature UI) */}
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                      onPress={() => handleAddToCart(prod)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={18} color="#1E293B" />
                    </TouchableOpacity>
                  </View>

                  {/* Clean Minimalist Text Block */}
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: isDarkMode ? '#F8FAFC' : '#1E293B',
                    marginTop: 8,
                    lineHeight: 18,
                  }} numberOfLines={2}>
                    {prod.title}
                  </Text>
                  
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }} numberOfLines={1}>
                    {prod.tag}
                  </Text>

                  <Text style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: isDarkMode ? '#E2E8F0' : '#334155',
                    marginTop: 4,
                  }}>
                    {prod.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ─── DARK LUXURY PROMOTIONAL SHOWCASE ─── */}
            <DarkLuxuryPromotionalSection isDarkMode={isDarkMode} />

            {/* ─── THE EDITORIAL JOURNAL (QUIET LUXURY STORY CARDS) ─── */}
            <View style={{ paddingHorizontal: 20, marginTop: 32, marginBottom: 28 }}>
              {/* Section Header */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 2,
                  color: isDarkMode ? '#94A3B8' : '#78716C',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  THE EDITORIAL JOURNAL
                </Text>
                <Text style={{
                  fontSize: 26,
                  fontWeight: '400',
                  fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                  color: isDarkMode ? '#F8FAFC' : '#1C1917',
                  letterSpacing: -0.4,
                }}>
                  Slow Living in {locationSensitiveData.cityName}
                </Text>
              </View>

              {/* High-End Story Card */}
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 260,
                  borderRadius: 20,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#1C1917',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setSelectedEditorialStory(dynamicEditorial.heroStory);
                  setEditorialStoryModalVisible(true);
                }}
                activeOpacity={0.92}
              >
                <Image
                  source={{ uri: dynamicEditorial.heroStory.coverImage }}
                  style={{ width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.82 }}
                />
                
                {/* Subtle Gradient Overlay */}
                <View style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(28, 25, 23, 0.45)',
                  padding: 24,
                  justifyContent: 'flex-end',
                }}>
                  <Text style={{
                    color: '#F5F5F4',
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}>
                    {dynamicEditorial.heroStory.issue}
                  </Text>
                  
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 22,
                    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                    fontWeight: '400',
                    lineHeight: 28,
                    marginBottom: 8,
                  }}>
                    {dynamicEditorial.heroStory.title}
                  </Text>

                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: 13,
                    lineHeight: 18,
                    marginBottom: 16,
                  }}>
                    {dynamicEditorial.heroStory.subtitle}
                  </Text>

                  <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#1C1917' }}>
                      Read Story & Explore →
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* ─── QUIET LUXURY CRAFT HIGHLIGHTS (HORIZONTAL CAROUSEL) ─── */}
            <View style={{ marginBottom: 32 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, gap: 14 }}
              >
                {dynamicEditorial.craftCards.map((item, index) => (
                  <TouchableOpacity
                    key={`craft_${index}`}
                    style={{
                      width: 220,
                      backgroundColor: isDarkMode ? '#1E293B' : '#FAF8F5',
                      borderRadius: 18,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#334155' : '#EFECE6',
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setSelectedEditorialStory(item.story);
                      setEditorialStoryModalVisible(true);
                    }}
                    activeOpacity={0.88}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '100%', height: 130, borderRadius: 12, marginBottom: 10 }}
                      resizeMode="cover"
                    />
                    <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 1.2, color: '#FFA451', textTransform: 'uppercase', marginBottom: 4 }}>
                      {item.tag}
                    </Text>
                    <Text style={{
                      fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                      fontSize: 15,
                      fontWeight: '700',
                      color: isDarkMode ? '#F8FAFC' : '#1C1917',
                      marginBottom: 4,
                    }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#94A3B8', lineHeight: 15 }} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ─── BESPOKE CONCIERGE FOOTER CARD ─── */}
            <View style={{ paddingHorizontal: 20, marginBottom: 36 }}>
              <View style={{
                backgroundColor: isDarkMode ? '#1E293B' : '#F4F1EA',
                borderRadius: 20,
                padding: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDarkMode ? '#334155' : '#E8E4DA',
              }}>
                <Ionicons name="sparkles-outline" size={24} color="#FFA451" style={{ marginBottom: 8 }} />
                <Text style={{
                  fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                  fontSize: 17,
                  fontWeight: '600',
                  color: isDarkMode ? '#F8FAFC' : '#1C1917',
                  textAlign: 'center',
                  marginBottom: 6,
                }}>
                  Seeking a rare specialty in {locationSensitiveData.cityName}?
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#94A3B8',
                  textAlign: 'center',
                  lineHeight: 18,
                  marginBottom: 14,
                  maxWidth: '88%',
                }}>
                  Our local procurement team works directly with certified artisans across {locationSensitiveData.cityName}.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode ? '#334155' : '#1C1917',
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    setToastMessage(`✨ Concierge team notified for ${locationSensitiveData.cityName}!`);
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 }}>
                    Request Custom Order
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </Reanimated.ScrollView>
        </ScrollContext.Provider>

                {/* ─── BOTTOM NAV ─── */}
        <ExperimentalNavigation
          activeTab={activeTab}
          onTabChange={(tabId) => {
            if (tabId === 'profile') router.push('/profile');
            else if (tabId === 'orders') router.push('/orders');
            else setActiveTab(tabId);
          }}
          isDarkMode={isDarkMode}
        />

        

        <ExpandableAIFab 
          onOpenVoice={() => setGeminiVoiceVisible(true)} 
          onOpenChat={() => setAiChatVisible(true)} 
          closeSignal={fabCloseSignal}
        />

        {/* ─── MODALS ─── */}
        <AIAssistantChatModal
          visible={aiChatVisible}
          onClose={() => setAiChatVisible(false)}
          isDarkMode={isDarkMode}
        />
        <GeminiVoiceMode
          visible={geminiVoiceVisible}
          onClose={() => setGeminiVoiceVisible(false)}
          stateName={selectedStateName}
        />
        <SearchModal visible={searchModalVisible} onClose={handleCloseSearchModal} initialMode={searchMode} isDarkMode={isDarkMode} />
        <VoiceBuyModal
          visible={voiceBuyVisible}
          onClose={() => setVoiceBuyVisible(false)}
          onAddToCart={(items) => {
            setToastMessage('Added to Cart');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          isDarkMode={isDarkMode}
        />
                <QuickAddModal visible={quickAddVisible} product={selectedQuickAdd} onClose={() => setQuickAddVisible(false)} onAddToCart={handleAddToCart} isDarkMode={isDarkMode} />
                <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          isDarkMode={isDarkMode}
        />

        {gamificationModal && (
          <View style={styles.rewardModalBackdrop}>
            <View style={[styles.rewardModalCard, isDarkMode && styles.rewardModalDark]}>
              <Text style={styles.rewardModalEmoji}>🎉</Text>
              <Text style={[styles.rewardModalTitle, isDarkMode && { color: '#F8FAFC' }]}>{gamificationModal} Unlocked!</Text>
              <Text style={styles.rewardModalSub}>You earned +150 Coins & 50 XP!</Text>
              <TouchableOpacity style={styles.rewardClaimBtn} onPress={() => setGamificationModal(null)}>
                <Text style={styles.rewardClaimText}>Claim Reward 🎁</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeToastText && (
          <Animated.View style={[styles.floatingToastBar, { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }]}>
            <Text style={styles.floatingToastText}>{activeToastText}</Text>
          </Animated.View>
        )}

        <WalletModal visible={walletModalVisible} onClose={() => setWalletModalVisible(false)} isDarkMode={isDarkMode} />
        <LoyaltyModal visible={loyaltyModalVisible} onClose={() => setLoyaltyModalVisible(false)} isDarkMode={isDarkMode} />
        <CuratedBundleModal
          visible={curatedBundleModalVisible}
          bundle={dynamicCuratedBundle}
          onClose={() => setCuratedBundleModalVisible(false)}
          onAddToCart={(item) => {
            handleAddToCart(item.raw || {
              id: item.id,
              name: item.title,
              price: item.priceNum,
              priceFormatted: item.price,
              image: item.image,
              thumbnail: item.image,
              categoryName: item.category,
            });
            setToastMessage('Added to Cart');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onAddAllToCart={(items) => {
            items.forEach((item) => {
              handleAddToCart(item.raw || {
                id: item.id,
                name: item.title,
                price: item.priceNum,
                priceFormatted: item.price,
                image: item.image,
                thumbnail: item.image,
                categoryName: item.category,
              });
            });
            setToastMessage('Added to Cart');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          isDarkMode={isDarkMode}
        />
        <EditorialStoryModal
          visible={editorialStoryModalVisible}
          story={selectedEditorialStory}
          onClose={() => setEditorialStoryModalVisible(false)}
          onAddToCart={(item) => {
            handleAddToCart(item);
            setToastMessage('Added to Cart');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          isDarkMode={isDarkMode}
        />

      </SafeAreaView>
    </SpatialDrawerWrapper>
  );
}


