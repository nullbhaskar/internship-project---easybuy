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
import { doc, getDoc } from 'firebase/firestore';
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
import { EditorialPromotionalBanner } from '../components/EditorialPromotionalBanner';
import { DarkLuxuryPromotionalSection } from '../components/DarkLuxuryPromotionalSection';
import { EditorialStoryModal, EditorialStoryData } from '../components/EditorialStoryModal';
import { useAddress } from '../context/AddressContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useProductTransition } from '../context/ProductTransitionContext';
import { QuickBuySection } from '../components/QuickBuySection';
import { SpinWinModal } from '../components/SpinWinModal';
import { AISmartFeed } from '../components/ai/AISmartFeed';
import { VoiceBuyModal } from '../components/ai/VoiceBuyModal';
import { AIAssistantChatModal } from '../components/ai/AIAssistantChatModal';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { SpatialDrawerWrapper, SpatialDrawerRef } from '../components/navigation/SpatialDrawerWrapper';
import { WalletModal } from '../components/wallet/WalletModal';
import { LoyaltyModal } from '../components/loyalty/LoyaltyModal';
import { CuratedBundleModal, CuratedBundleInfo } from '../components/cart/CuratedBundleModal';

const { width } = Dimensions.get('window');

// ─── DARK LUXURY HERO BACKGROUND POOL (AUTO-ROTATES EVERY 48 HOURS) ───
const DARK_HERO_BACKGROUND_POOL = [
  {
    id: 'greenhouse_glass',
    name: 'Moody Glasshouse Sanctuary',
    uri: 'https://images.unsplash.com/photo-1519996521430-02b798c1d881?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'emerald_palms',
    name: 'Deep Emerald Tropical Palms',
    uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'slate_monstera',
    name: 'Dark Slate & Monstera Architecture',
    uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'mist_evergreen',
    name: 'Misty Dark Evergreen Canopy',
    uri: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'pottery_oak',
    name: 'Artisanal Studio & Dark Oak',
    uri: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'courtyard_ambient',
    name: 'Dark Courtyard & Warm Amber',
    uri: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=1200&auto=format&fit=crop&q=80',
  },
];

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

// ─── FRUIT SALAD HIGH-FIDELITY CATALOG (Mockup Specific) ───
const FRUIT_SALAD_RECOMMENDED = [
  {
    id: 'salad_honey_lime',
    title: 'Honey Lime Combo',
    price: '₹ 2,000',
    priceNum: 2000,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_berry_mango',
    title: 'Berry Mango Combo',
    price: '₹ 8,000',
    priceNum: 8000,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_melon_combo',
    title: 'Melon Salad Combo',
    price: '₹ 5,000',
    priceNum: 5000,
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_orange_combo',
    title: 'Orange Berry Supreme',
    price: '₹ 6,000',
    priceNum: 6000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_kiwi_dragon',
    title: 'Kiwi Dragonfruit Bliss',
    price: '₹ 7,500',
    priceNum: 7500,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_avocado_crunch',
    title: 'Avocado Crunch Salad',
    price: '₹ 9,200',
    priceNum: 9200,
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_pomegranate_gold',
    title: 'Pomegranate Golden Mix',
    price: '₹ 4,800',
    priceNum: 4800,
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80',
    bgColor: '#FFFFFF',
  },
  {
    id: 'salad_superfood_bowl',
    title: 'Superfood Berry Bowl',
    price: '₹ 11,000',
    priceNum: 11000,
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
    bgColor: '#FFFFFF',
  },
];

const FRUIT_SALAD_TAB_PRODUCTS: Record<string, any[]> = {
  hot: [
    {
      id: 'salad_quinoa',
      title: 'Quinoa Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&q=80',
      bgColor: '#FFF9E6',
    },
    {
      id: 'salad_tropical',
      title: 'Tropical Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
      bgColor: '#FFF0F2',
    },
    {
      id: 'salad_melon_mix',
      title: 'Melon Berry Mix',
      price: '₹ 12,000',
      priceNum: 12000,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      bgColor: '#F1F0FF',
    },
    {
      id: 'salad_citrus_glow',
      title: 'Citrus Glow Delight',
      price: '₹ 6,500',
      priceNum: 6500,
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
      bgColor: '#FEF3C7',
    },
    {
      id: 'salad_fig_walnut',
      title: 'Honey Fig & Walnut Bowl',
      price: '₹ 14,000',
      priceNum: 14000,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
      bgColor: '#EDF2F7',
    },
    {
      id: 'salad_chia_pudding',
      title: 'Chia Fruit Parfait',
      price: '₹ 8,500',
      priceNum: 8500,
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&q=80',
      bgColor: '#EBF8FF',
    },
  ],
  popular: [
    {
      id: 'salad_berry_mango',
      title: 'Berry Mango Combo',
      price: '₹ 8,000',
      priceNum: 8000,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      bgColor: '#EBF8FF',
    },
    {
      id: 'salad_honey_lime',
      title: 'Honey Lime Combo',
      price: '₹ 2,000',
      priceNum: 2000,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
      bgColor: '#FFF9E6',
    },
    {
      id: 'salad_avocado_crunch',
      title: 'Avocado Crunch Salad',
      price: '₹ 9,200',
      priceNum: 9200,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
      bgColor: '#E6FFFA',
    },
    {
      id: 'salad_pomegranate_gold',
      title: 'Pomegranate Golden Mix',
      price: '₹ 4,800',
      priceNum: 4800,
      image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80',
      bgColor: '#FFF5F5',
    },
  ],
  new: [
    {
      id: 'salad_kiwi_dragon',
      title: 'Kiwi Dragonfruit Bliss',
      price: '₹ 7,500',
      priceNum: 7500,
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
      bgColor: '#F0FFF4',
    },
    {
      id: 'salad_tropical',
      title: 'Tropical Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
      bgColor: '#FFF0F2',
    },
    {
      id: 'salad_superfood_bowl',
      title: 'Superfood Berry Bowl',
      price: '₹ 11,000',
      priceNum: 11000,
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80',
      bgColor: '#F3E8FF',
    },
    {
      id: 'salad_quinoa',
      title: 'Quinoa Fruit Salad',
      price: '₹ 10,000',
      priceNum: 10000,
      image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&q=80',
      bgColor: '#FFF9E6',
    },
  ],
  top: [
    {
      id: 'salad_melon_mix',
      title: 'Melon Berry Mix',
      price: '₹ 12,000',
      priceNum: 12000,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      bgColor: '#F1F0FF',
    },
    {
      id: 'salad_fig_walnut',
      title: 'Honey Fig & Walnut Bowl',
      price: '₹ 14,000',
      priceNum: 14000,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&q=80',
      bgColor: '#EDF2F7',
    },
    {
      id: 'salad_berry_mango',
      title: 'Berry Mango Combo',
      price: '₹ 8,000',
      priceNum: 8000,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      bgColor: '#EBF8FF',
    },
  ],
};

// ─── RECOMMENDED FOR YOU PRODUCTS ───
const RECOMMENDED_PRODUCTS = catalog.slice(0, 40).map((p, idx) => ({
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
const getDynamicEditorialSection = (cityName: string, products: any[]) => {
  const dayIndex = new Date().getDay(); // 0 to 6 daily rotation
  const issueNumbers = ['ISSUE N° 04 — PROVENANCE', 'ISSUE N° 05 — HERITAGE', 'ISSUE N° 06 — CRAFT MASTERY', 'ISSUE N° 07 — REGIONAL EDITION', 'ISSUE N° 08 — ARTISANAL EDIT'];
  const activeIssue = issueNumbers[dayIndex % issueNumbers.length];

  const fashionProducts = products.filter(p => p.category === 'ETHNIC FASHION' || p.category === 'FOOTWEAR' || p.category === 'ACCESSORIES');
  const foodGourmetProducts = products.filter(p => p.category === 'QUICKBUY' || p.title.toLowerCase().includes('coffee') || p.title.toLowerCase().includes('tea') || p.title.toLowerCase().includes('sweet') || p.title.toLowerCase().includes('makhana') || p.title.toLowerCase().includes('lassi'));
  const beautyProducts = products.filter(p => p.category === 'BEAUTY' || p.title.toLowerCase().includes('oil') || p.title.toLowerCase().includes('toner') || p.title.toLowerCase().includes('face') || p.title.toLowerCase().includes('lip'));

  const heroStory = {
    issue: activeIssue,
    title: `Artisanal Handlooms & Craft Heritage of ${cityName}`,
    subtitle: `Curated small-batch creations directly from master weavers & craftsmen in ${cityName}.`,
    author: 'EasyBuy Artisanal Desk',
    readTime: '4 min read',
    coverImage: fashionProducts[dayIndex % (fashionProducts.length || 1)]?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
    paragraphs: [
      `In an era dominated by fast fashion, there is a quiet revolution happening in master weavers' looms across ${cityName}. Artisans are returning to traditional methods—hand-spinning natural threads and slowly weaving timeless ethnic wear with bare hands.`,
      `Each handloom weave bears the subtle mark of its maker: intricate patterns, micro-variations in dye, and a tactile weight that feels grounding. Pair these rustic textiles with authentic regional accessories, and daily attire transforms into a celebration of heritage.`,
      `Our editorial curation brings together these regional treasures into an exclusive provenance edit for ${cityName}. Designed to elevate your wardrobe, each item tells a story of patience, passion, and uncompromising quality.`,
    ],
    featuredProducts: fashionProducts.length > 0 ? fashionProducts.slice(0, 3) : products.slice(0, 3),
  };

  const craftCards = [
    {
      title: 'Handloom & Ethnic Weaves',
      subtitle: `Woven by traditional master weavers in ${cityName}`,
      image: fashionProducts[0]?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
      tag: 'TEXTILE ART',
      story: {
        issue: 'TEXTILE ART — EXCLUSIVE',
        title: `Handloom Heritage of ${cityName}`,
        author: 'EasyBuy Curation Team',
        readTime: '3 min read',
        coverImage: fashionProducts[0]?.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
        paragraphs: [
          `Woven by traditional master weavers in ${cityName}, every thread carries generations of craft mastery.`,
          `Discover rich textures, natural dyes, and royal drapes handcrafted for timeless elegance.`,
        ],
        featuredProducts: fashionProducts.length > 0 ? fashionProducts.slice(0, 3) : products.slice(0, 3),
      },
    },
    {
      title: `${cityName} Regional Delicacies`,
      subtitle: `Authentic local flavors & small-batch treats`,
      image: foodGourmetProducts[0]?.image || 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=500&auto=format&fit=crop&q=80',
      tag: 'REGIONAL FLAVORS',
      story: {
        issue: 'REGIONAL FLAVORS — EXCLUSIVE',
        title: `Gourmet Specialties of ${cityName}`,
        author: 'EasyBuy Culinary Desk',
        readTime: '3 min read',
        coverImage: foodGourmetProducts[0]?.image || 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=500&auto=format&fit=crop&q=80',
        paragraphs: [
          `Sourced directly from famed food artisans in ${cityName}, these small-batch treats deliver authentic regional taste.`,
          `Made using age-old recipes, wholesome ingredients, and zero artificial preservatives.`,
        ],
        featuredProducts: foodGourmetProducts.length > 0 ? foodGourmetProducts.slice(0, 3) : products.slice(3, 6),
      },
    },
    {
      title: 'Botanical Beauty & Oils',
      subtitle: `Ayurvedic extracts & cold-pressed skincare`,
      image: beautyProducts[0]?.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
      tag: 'PURE EXTRACTS',
      story: {
        issue: 'PURE EXTRACTS — EXCLUSIVE',
        title: `Ayurvedic Skincare of ${cityName}`,
        author: 'EasyBuy Beauty Desk',
        readTime: '3 min read',
        coverImage: beautyProducts[0]?.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
        paragraphs: [
          `Cold-pressed & unrefined botanical herbs formulations designed for natural radiance and holistic wellness.`,
          `Hand-harvested ingredients blended with traditional wisdom for daily skin nourishment.`,
        ],
        featuredProducts: beautyProducts.length > 0 ? beautyProducts.slice(0, 3) : products.slice(2, 5),
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
  const [userName, setUserName] = useState(user?.fullName || 'Bhaskar');
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.fullName) {
      setUserName(user.fullName);
    }
  }, [user?.fullName]);

  const recommendedCategories = useMemo(() => getDailyHomeCategories(), []);

  const locationSensitiveData = useMemo(() => {
    return getLocationSensitiveProducts(
      selectedAddress?.city || '',
      selectedStateId || '',
      selectedStateName || ''
    );
  }, [selectedAddress?.city, selectedStateId, selectedStateName]);

  const stateRecommendedProducts = (stateProducts.length >= 4 ? stateProducts : catalog)
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
  const [greetingText, setGreetingText] = useState('Welcome to EasyBuy.');
  const [subtitleText, setSubtitleText] = useState('');
  const greetingFadeAnim = useRef(new Animated.Value(1)).current;
  const greetingTranslateY = useRef(new Animated.Value(0)).current;

    const loadFreshGreeting = async () => {
    const currentMonth = new Date().getMonth();
    const simulatedWeather = (currentMonth === 5 || currentMonth === 6) ? 'rain' : (currentMonth === 11 || currentMonth === 0) ? 'cold' : 'pleasant';
    const msg = getDynamicWelcomeMessage(userName || 'Bhaskar', {
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
  const [aiChatVisible, setAiChatVisible] = useState(false);

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
      pointerEvents: reanimatedScrollY.value > 250 ? ('none' as const) : ('auto' as const),
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
      pointerEvents: reanimatedScrollY.value < 250 ? ('none' as const) : ('auto' as const),
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

    const pId = String(product.id || product.productId || '');
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
    const source = stateProducts.length >= 4 ? stateProducts : catalog;
    if (!source || source.length === 0) return [];
    
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

  // Dynamic Curated Bundle rotation based on Day of Week & Time of Day
  const dynamicCuratedBundle: CuratedBundleInfo & { avatar1: string; avatar2: string; badge: string } = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const hour = now.getHours(); // 0 - 23

    const isWeekend = day === 0 || day === 5 || day === 6;
    const isLateNight = hour >= 21 || hour < 5;
    const isMorning = hour >= 5 && hour < 12;

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
        items: [
          {
            id: 'ln-1',
            title: 'Nissin Master Chef Spicy Garlic Ramen',
            price: '₹149',
            priceNum: 149,
            originalPrice: '₹199',
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80',
            category: 'LATE NIGHT SNACK',
          },
          {
            id: 'ln-2',
            title: '85% Artisanal Dark Belgian Chocolate Bar',
            price: '₹249',
            priceNum: 249,
            originalPrice: '₹320',
            image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&auto=format&fit=crop&q=80',
            category: 'SWEET CRAVING',
          },
          {
            id: 'ln-3',
            title: 'Organic Chamomile & Lavender Night Brew Tea',
            price: '₹299',
            priceNum: 299,
            originalPrice: '₹399',
            image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
            category: 'CALM BREW',
          },
          {
            id: 'ln-4',
            title: 'Midnight Roast Espresso Instant Coffee Jar',
            price: '₹199',
            priceNum: 199,
            originalPrice: '₹275',
            image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
            category: 'BEVERAGE',
          },
          {
            id: 'ln-5',
            title: 'Stainless Steel Rapid Auto Electric Kettle (0.8L)',
            price: '₹899',
            priceNum: 899,
            originalPrice: '₹1299',
            image: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500&auto=format&fit=crop&q=80',
            category: 'NIGHT APPLIANCE',
          },
        ],
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
        items: [
          {
            id: 'wk-1',
            title: 'Hand-Cooked Sea Salt & Truffle Potato Chips',
            price: '₹120',
            priceNum: 120,
            originalPrice: '₹160',
            image: 'https://images.unsplash.com/photo-1566478989037-eec170784d07?w=500&auto=format&fit=crop&q=80',
            category: 'PARTY SNACK',
          },
          {
            id: 'wk-2',
            title: 'Sparkling Nitro Cold Brew Coffee (4 Pack)',
            price: '₹399',
            priceNum: 399,
            originalPrice: '₹520',
            image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
            category: 'BEVERAGE',
          },
          {
            id: 'wk-3',
            title: 'Gourmet Italian Four-Cheese Instant Mac',
            price: '₹180',
            priceNum: 180,
            originalPrice: '₹240',
            image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80',
            category: 'QUICK MEAL',
          },
          {
            id: 'wk-4',
            title: 'Swiss Roasted Hazelnut Milk Chocolate',
            price: '₹299',
            priceNum: 299,
            originalPrice: '₹380',
            image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80',
            category: 'CHOCOLATE',
          },
          {
            id: 'wk-5',
            title: 'Roasted Salted Cashew & Trail Mix Tub',
            price: '₹349',
            priceNum: 349,
            originalPrice: '₹450',
            image: 'https://images.unsplash.com/photo-1536591375315-1b8626993134?w=500&auto=format&fit=crop&q=80',
            category: 'NUTS & CRUNCH',
          },
        ],
      };
    }

    if (isMorning) {
      return {
        tag: 'MORNING ESSENTIALS',
        title: 'Rise & Shine Breakfast Kit',
        subtitle: 'Start your day right with fresh organic teas, oats & raw mountain honey.',
        price: '₹399',
        oldPrice: '₹549',
        avatar1: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&auto=format&fit=crop&q=80',
        avatar2: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
        badge: '+3',
        items: [
          {
            id: 'bk-1',
            title: 'Whole Rolled Organic Oats (1kg Jar)',
            price: '₹299',
            priceNum: 299,
            originalPrice: '₹399',
            image: 'https://images.unsplash.com/photo-1517093728432-a0440f8d45af?w=500&auto=format&fit=crop&q=80',
            category: 'BREAKFAST',
          },
          {
            id: 'bk-2',
            title: 'Pure Himalayan Wildflower Raw Honey (500g)',
            price: '₹349',
            priceNum: 349,
            originalPrice: '₹450',
            image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80',
            category: 'PANTRY',
          },
          {
            id: 'bk-3',
            title: 'Premium Single-Estate Assam Golden Leaf Tea',
            price: '₹249',
            priceNum: 249,
            originalPrice: '₹325',
            image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
            category: 'TEA & BREW',
          },
          {
            id: 'bk-4',
            title: 'California Sun-Dried Raw Almonds (250g)',
            price: '₹399',
            priceNum: 399,
            originalPrice: '₹499',
            image: 'https://images.unsplash.com/photo-1508061252966-f7ac25ab2655?w=500&auto=format&fit=crop&q=80',
            category: 'HEALTHY NUTS',
          },
          {
            id: 'bk-5',
            title: 'Artisanal Organic Mixed Berry Breakfast Jam',
            price: '₹199',
            priceNum: 199,
            originalPrice: '₹275',
            image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=500&auto=format&fit=crop&q=80',
            category: 'SPREADS',
          },
        ],
      };
    }

    // Midweek Afternoon/Evening
    return {
      tag: 'MIDWEEK PANTRY KIT',
      title: 'Monsoon Artisanal Pantry Kit',
      subtitle: 'Handpicked makhana, artisanal dark roast & gourmet health bites.',
      price: '₹449',
      oldPrice: '₹599',
      avatar1: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
      avatar2: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
      badge: '+3',
      items: [
        {
          id: 'mp-1',
          title: 'Slow-Roasted Himalayan Peri Peri Makhana',
          price: '₹180',
          priceNum: 180,
          originalPrice: '₹240',
          image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=80',
          category: 'GULP & SNACK',
        },
        {
          id: 'mp-2',
          title: 'Cold Pressed Extra Virgin Olive Oil (500ml)',
          price: '₹699',
          priceNum: 699,
          originalPrice: '₹899',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
          category: 'COOKING OIL',
        },
        {
          id: 'mp-3',
          title: 'Organic Roasted Chana Sattu Flour (1kg)',
          price: '₹160',
          priceNum: 160,
          originalPrice: '₹210',
          image: 'https://images.unsplash.com/photo-1627485937980-221c88ab04f9?w=500&auto=format&fit=crop&q=80',
          category: 'SUPERFOOD',
        },
        {
          id: 'mp-4',
          title: 'Pure Himalayan Pink Rock Salt Jar (1kg)',
          price: '₹120',
          priceNum: 120,
          originalPrice: '₹170',
          image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80',
          category: 'ESSENTIAL SPICE',
        },
        {
          id: 'mp-5',
          title: 'Dark Roast Single-Origin Chikmagalur Beans',
          price: '₹450',
          priceNum: 450,
          originalPrice: '₹590',
          image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
          category: 'GOURMET COFFEE',
        },
      ],
    };
  }, []);

  const dynamicEditorial = useMemo(() => {
    return getDynamicEditorialSection(locationSensitiveData.cityName, locationSensitiveData.products);
  }, [locationSensitiveData.cityName, locationSensitiveData.products]);

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
            <Reanimated.View style={[cartHeaderAnimStyle, { position: 'absolute', right: 0 }]}>
              <TouchableOpacity style={[styles.newCartBtn, isDarkMode && styles.newCartBtnDark]} onPress={() => router.push('/cart' as any)} activeOpacity={0.75}>
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
            <Reanimated.View style={[exploreHeaderAnimStyle, { position: 'absolute', right: 0 }]}>
              <TouchableOpacity
                style={styles.headerExploreMoreBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  router.push('/all-items');
                }}
                activeOpacity={0.8}
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

                        {/* 🎙️ Voice Recipe & Cart AI Mic Button */}
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                            setVoiceBuyVisible(true);
                          }}
                          activeOpacity={0.75}
                        >
                          <Ionicons name="mic" size={20} color="#FFFFFF" />
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

        

        {/* ─── FLOATING AI ASSISTANT CONCIERGE BUTTON (FAB) ─── */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 95,
            right: 18,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#10B981',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 24,
            gap: 8,
            shadowColor: '#10B981',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 10,
            elevation: 8,
            zIndex: 999,
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            setAiChatVisible(true);
          }}
          activeOpacity={0.88}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 }}>
            Ask AI
          </Text>
        </TouchableOpacity>

        {/* ─── MODALS ─── */}
        <AIAssistantChatModal
          visible={aiChatVisible}
          onClose={() => setAiChatVisible(false)}
          isDarkMode={isDarkMode}
        />
        <SearchModal visible={searchModalVisible} onClose={handleCloseSearchModal} initialMode={searchMode} isDarkMode={isDarkMode} />
        <SpinWinModal visible={spinWinModalVisible} onClose={() => setSpinWinModalVisible(false)} isDarkMode={isDarkMode} />
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
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(26, 26, 24, 0.68)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 200,
  },
  floatingToastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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

  // ─── NEW CLEAN UI STYLES ───

  // Compact Header
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  compactHeaderDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  compactMenuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  compactLocationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  compactLocationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: 140,
  },
  compactHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  compactBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Clean Scroll
  cleanScrollContent: {
    paddingTop: 12,
    paddingBottom: 110,
  },

  // Clean Search Bar
  cleanSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cleanSearchBarDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cleanSearchPlaceholder: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  cleanSearchMic: {
    padding: 4,
  },

  // Category Pills
  categoryPillsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryPillDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },

  // Banner Skeleton
  cleanBannerSkeleton: {
    marginHorizontal: 16,
    marginBottom: 16,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },

  // Quick Access Grid (4 tiles)
  quickAccessGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  quickAccessTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickAccessTileDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  quickAccessIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },

  // Section Headers
  cleanSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cleanSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  cleanSeeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cleanSeeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Product Card (horizontal rail)
  cleanProductCard: {
    width: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cleanProductCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cleanProductImgWrap: {
    width: '100%',
    height: 170,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  cleanProductImg: {
    width: '100%',
    height: '100%',
  },
  cleanWishBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cleanDiscountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cleanProductInfo: {
    padding: 10,
    gap: 4,
  },
  cleanProductTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 16,
  },
  cleanProductPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cleanProductPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  cleanProductOldPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  cleanRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cleanRatingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },

  // Flash Deal Card
  cleanFlashTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cleanFlashTimerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F43F5E',
  },
  cleanFlashCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    height: 220,
    position: 'relative',
  },
  cleanFlashImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cleanFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  cleanFlashBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cleanFlashBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cleanFlashDiscountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  cleanFlashDiscountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cleanFlashContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cleanFlashTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  cleanFlashPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cleanFlashOldPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  cleanFlashGrabBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cleanFlashGrabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },

  // 2-Column Grid
  twoColGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  twoColCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  twoColImgWrap: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  twoColImg: {
    width: '100%',
    height: '100%',
  },
  twoColInfo: {
    padding: 10,
    gap: 4,
  },
  twoColAddBtn: {
    marginLeft: 'auto',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Trust Strip
  cleanTrustStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-around',
  },
  cleanTrustItem: {
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
    cleanTrustText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },

  // ─── REF* STYLES (Reference-image inspired) ───

  // Header
  refHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  refHeaderDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#1E293B',
  },
  refMenuBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  refLocationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  refLocationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    maxWidth: 150,
  },
  refHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  refIconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  refBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  refBadgeTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Scroll
  refScrollContent: {
    paddingBottom: 120,
  },

  // Greeting
  refGreetingBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  refGreetHello: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 4,
  },
  refGreetQuestion: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 30,
    letterSpacing: -0.5,
  },

  // Search Bar
  refSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  refSearchBarDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  refSearchPlaceholder: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },

  // Category Pills
  refCategoryRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  refCategoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  refCategoryPillActive: {
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
  },
  refCategoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  refCategoryPillTextActive: {
    color: '#FFFFFF',
  },

  // Banner skeleton
  refBannerSkeleton: {
    marginHorizontal: 20,
    marginBottom: 20,
    height: 190,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },

  // Quick Access Grid
  refQuickGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
    marginBottom: 24,
  },
  refQuickTile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    gap: 7,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  refQuickTileDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  refQuickIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refQuickLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },

  // Section Header Row
  refSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  refSectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: -0.4,
  },
  refSeeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Product Card (horizontal rail — reference style)
  refProductCard: {
    width: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  refProductCardDark: {
    backgroundColor: '#1E293B',
  },
  refProductImgWrap: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  refProductImg: {
    width: '100%',
    height: '100%',
  },
  refHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  refDiscountTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  refDiscountTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  refProductBody: {
    padding: 12,
    gap: 5,
  },
  refProductName: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A2E',
    lineHeight: 18,
  },
  refProductPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refProductPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F97316',  // Orange accent — like the reference
  },
  refAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Tabs (Mockup Style Solid Pills)
  refTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
    gap: 10,
  },
  refTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9', // Light gray background for inactive
    alignItems: 'center',
    justifyContent: 'center',
  },
  refTabDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  refTabActive: {
    backgroundColor: '#0F172A', // Dark navy/black for active
  },
  refTabActiveDark: {
    backgroundColor: '#FFA451', // Accent orange for active in dark mode
  },
  refTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  refTabTextActive: {
    color: '#FFFFFF',
  },

  // 2-Column Grid under tabs
  refGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 4,
  },
  refGridCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  refGridImgWrap: {
    width: '100%',
    height: 155,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  refGridImg: {
    width: '100%',
    height: '100%',
  },
  refGridBody: {
    padding: 10,
    gap: 5,
  },

  // Flash Deal
  refFlashTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244,63,94,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  refFlashTimerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F43F5E',
  },
  refFlashCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 230,
    position: 'relative',
    marginBottom: 4,
  },
  refFlashImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  refFlashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  refFlashTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refFlashTagPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  refFlashTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  refFlashDiscountPill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  refFlashDiscountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  refFlashBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  refFlashTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  refFlashPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  refFlashOld: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    textDecorationLine: 'line-through',
  },
  refFlashGrabBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 22,
  },
  refFlashGrabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A2E',
  },

  // Trust Strip
  refTrustStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: '#FFF7F0',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    justifyContent: 'space-around',
  },
  refTrustItem: {
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  refTrustIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(249,115,22,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
    refTrustText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 13,
  },

  // ─── MOCKUP INSPIRED CUSTOM STYLES ───

  // Top header matching mockup
  newHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  newHeaderDark: {
    backgroundColor: 'transparent',
  },

  // Hero Banner Redesign
  heroBannerBackground: {
    width: '100%',
    height: 390,
    overflow: 'hidden',
  },
  heroBannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Premium dark slate overlay
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'flex-end',
  },
  refGreetingBlockHero: {
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  refGreetQuestionHero: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 34,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  translucentSearchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 26,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  translucentSearchPlaceholder: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 10,
    fontWeight: '500',
  },
  translucentSearchDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 12,
  },
  heroExploreBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 18,
    alignSelf: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  heroExploreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerExploreMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA451',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#FFA451',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  headerExploreMoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  newCartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  newCartBtnDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
  },
  newCartIconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newCartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFA451',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  newCartBadgeDark: {
    borderColor: '#0F172A',
  },
  newCartBadgeTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },

    // iPhone-style floating capsule search bar styles
  iosSearchCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  iosSearchCapsuleDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
  },
  iosSearchLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    gap: 10,
  },
  iosSearchPlaceholder: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  iosSearchDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  iosSearchFilterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

    // Product cards and buttons matching mockup
  refProductImgSquare: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    position: 'relative',
  },
  refProductImgInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  refProductPriceNew: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFA451', // Accent orange for price matching mockup
  },
  refHeartBtnNew: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  refAddBtnOutline: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFA451',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF7',
  },

  // Active tab salad card styles (horizontal list)
  refGridCardNew: {
    width: 150,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  refGridImgWrapNew: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  refGridImgNew: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  refHeartBtnNewGrid: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refGridBodyNew: {
    gap: 4,
  },
  refGridNameNew: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 13,
    fontWeight: '700',
    color: '#272A3F',
  },
  refGridPriceRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  refGridPriceNew: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFA451',
  },
  refAddBtnSolidNew: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA451',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom QuickBuy Footer Strip
  bottomQuickBuyStrip: {
    height: 48,
    backgroundColor: '#203437', // Slate dark green-blue color matching mockup
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
  },
  bottomQuickBuyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomQuickBuyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  bottomQuickBuyPill: {
    backgroundColor: 'rgba(255, 164, 81, 0.15)',
    borderWidth: 1.2,
    borderColor: '#FFA451',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bottomQuickBuyPillText: {
    color: '#FFA451',
    fontSize: 9,
    fontWeight: '800',
  },
  bottomQuickBuyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
    bottomQuickBuySeeAll: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  refEmptyContainer: {
    width: 260,
    height: 140,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 4,
  },
  refEmptyContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
    refEmptyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    },
});
