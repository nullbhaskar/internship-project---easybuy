import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../context/CartContext';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { generateFullIndianCatalog } from '../constants/catalogGenerator';

const { width } = Dimensions.get('window');

const CATEGORY_VISUALS: Record<string, { image: string; countText: string }> = {
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

const ALL_SPOTLIGHT_POOL = [
  { id: 'automobile', name: 'Automobile & Bike', badge: '⚡ RIDING GEAR', tag: '36 items • Helmets & Care' },
  { id: 'health_care', name: 'Health & Wellness', badge: '🩺 ESSENTIALS', tag: '37 items • BP & Supplements' },
  { id: 'pet_care', name: 'Pet Care & Food', badge: '🐾 PET CARE', tag: '37 items • Dog & Cat Food' },
  { id: 'gifts', name: 'Gifts & Hampers', badge: '🎁 GIFT SPECIAL', tag: '36 items • Gourmet Hampers' },
  { id: 'sports', name: 'Sports & Outdoors', badge: '⚽ SPORTS', tag: '37 items • Cricket & Football' },
  { id: 'footwear', name: 'Footwear & Kicks', badge: '👟 KICKS', tag: '38 items • Sneakers & Boots' },
  { id: 'baby_care', name: 'Baby Care & Toys', badge: '🍼 BABY CARE', tag: '6 items • Bath & Toys' },
  { id: 'kitchen', name: 'Kitchen & Appliances', badge: '🍳 HOME CHEF', tag: '38 items • Air Fryers & Cookware' },
  { id: 'lifestyle', name: 'Lifestyle & Vibe', badge: '🎧 AESTHETICS', tag: '41 items • Vinyl & Cameras' },
  { id: 'accessories', name: 'Accessories & Bags', badge: '👜 BAGS & WATCHES', tag: '38 items • Backpacks & Watches' },
  { id: 'fitness', name: 'Fitness & Gym', badge: '🏋️ WORKOUT', tag: '37 items • Home Gym & Mats' },
  { id: 'gaming', name: 'Gaming Zone', badge: '🎮 GAMING SETUP', tag: '38 items • PS5 & RGB Gear' },
  { id: 'grocery', name: 'Supermarket Grocery', badge: '🛒 DAILY FRESH', tag: '377 items • Snacks & Staples' },
  { id: 'study_office', name: 'Study & Office', badge: '📚 WORKSPACE', tag: '15 items • Desk Lamps & Organizers' },
  { id: 'hostel_essentials', name: 'Hostel Essentials', badge: '🛏️ DORM LIFE', tag: '23 items • Storage & Lighting' },
];

// Helper function to get 24-hour rotating spotlight categories based on current day
const getDailySpotlightCategories = () => {
  // Epoch day count changes every 24 hours at midnight
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  
  // Deterministic shuffle seeded by dayIndex
  const shuffled = [...ALL_SPOTLIGHT_POOL];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((dayIndex * 1664525 + (i * 1013904223)) % (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled.slice(0, 7);
};

const TAB_CATEGORY_PRIORITY: Record<string, string[]> = {
  Trending: ['sports', 'footwear', 'pet_care', 'automobile', 'health_care', 'gaming'],
  'New Arrivals': ['baby_care', 'gifts', 'lifestyle', 'kitchen', 'accessories'],
  'Top Rated': ['health_care', 'footwear', 'automobile', 'gaming', 'electronics'],
  Offers: ['gifts', 'pet_care', 'sports', 'hostel_essentials', 'grocery'],
};

export default function AllItemsScreen() {
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const isDark = isDarkMode;
  const { openCart, totalItems: cartCount } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedQuote, setSelectedQuote] = useState('');

  const dailySpotlights = useMemo(() => getDailySpotlightCategories(), []);

  const skeletonFade = useRef(new Animated.Value(0.5)).current;

  // Entrance animations values
  const headerY = useRef(new Animated.Value(-40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const searchScale = useRef(new Animated.Value(0.92)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;

  // Splash animation refs
  const pulseScale = useRef(new Animated.Value(0.95)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Stagger anim values for the 7 collage rows
  const rowAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 0.12],
    extrapolate: 'clamp',
  });

  const headerElevation = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 6],
    extrapolate: 'clamp',
  });

  const backToTopOpacity = scrollY.interpolate({
    inputRange: [180, 280],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const backToTopScale = scrollY.interpolate({
    inputRange: [180, 280],
    outputRange: [0.6, 1],
    extrapolate: 'clamp',
  });

  const getRowScrollStyle = (index: number, approxY: number, isLastRow?: boolean) => {
    const anim = getRowAnim(index);

    // Parallax lift as card enters/leaves viewport (NO opacity dimming — always fully visible)
    const scrollTranslateY = scrollY.interpolate({
      inputRange: [approxY - 400, approxY - 40, approxY + 380],
      outputRange: [30, 0, -20],
      extrapolate: 'clamp',
    });

    // Subtle depth scale — cards breathe as they move through viewport (no shrink-to-gray)
    const scrollScale = scrollY.interpolate({
      inputRange: isLastRow
        ? [approxY - 500, approxY - 220, approxY - 40, approxY + 800]
        : [approxY - 450, approxY - 220, approxY - 40, approxY + 120, approxY + 450],
      outputRange: isLastRow
        ? [0.96, 0.99, 1.03, 1.03]
        : [0.96, 0.99, 1.03, 0.99, 0.96],
      extrapolate: 'clamp',
    });

    return {
      opacity: anim, // always 1.0 once entrance completes — no gray fade
      transform: [
        {
          translateY: Animated.add(
            anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
            scrollTranslateY
          ),
        },
        { scale: scrollScale },
      ],
    };
  };

  // Safe accessor helper for rowAnims to prevent undefined errors during fast-refresh or re-renders
  const getRowAnim = (index: number) => {
    if (!rowAnims[index]) {
      rowAnims[index] = new Animated.Value(1);
    }
    return rowAnims[index];
  };

  // Select quote on mount
  useEffect(() => {
    const quotes = [
      "Diving into your own world...",
      "Curating your perfect aesthetic...",
      "Discovering endless possibilities...",
      "Finding something you'll love...",
      "Getting things ready for you...",
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setSelectedQuote(quotes[randomIndex]);
  }, []);

  // Splash loop & loading state animations
  useEffect(() => {
    if (loading) {
      // Fade in logo & quote
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(quoteOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start();

      // Breathing loop for logo
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 0.95, duration: 1200, useNativeDriver: true }),
        ])
      ).start();

      // Looping dots
      const pulseDot = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.delay(600 - delay),
          ])
        );

      pulseDot(dot1, 0).start();
      pulseDot(dot2, 200).start();
      pulseDot(dot3, 400).start();
    } else {
      // Stagger entry trigger when loading finishes
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
        Animated.timing(searchOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(searchScale, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }),
        Animated.stagger(100, rowAnims.map((anim) => 
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 50,
            useNativeDriver: true
          })
        ))
      ]).start();
    }
  }, [loading]);

  // Pulse skeleton loader fallback
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonFade, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(skeletonFade, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(false);
    const startTime = Date.now();
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const dbCategories: any[] = [];
      querySnapshot.forEach((doc) => {
        dbCategories.push({ id: doc.id, ...doc.data() });
      });

      if (dbCategories.length > 0) {
        const sorted = dbCategories.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
        // Ensure men, women, ethnic_wear exist
        ['men', 'women', 'ethnic_wear'].forEach((reqId) => {
          if (!sorted.some(c => c.id === reqId)) {
            sorted.push({
              id: reqId,
              name: reqId === 'men' ? "Men's Fashion" : reqId === 'women' ? "Women's Fashion" : "Ethnic Wear",
              displayOrder: 30
            });
          }
        });
        setCategories(sorted);
      } else {
        const fullCatalog = generateFullIndianCatalog();
        const offlineCategories = Array.from(new Set(fullCatalog.map(p => p.categoryId))).map((id, index) => ({
          id,
          name: id.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          displayOrder: index + 1
        })).filter(c => c.id !== 'quickbuy');
        ['men', 'women', 'ethnic_wear'].forEach((reqId) => {
          if (!offlineCategories.some(c => c.id === reqId)) {
            offlineCategories.push({
              id: reqId,
              name: reqId === 'men' ? "Men's Fashion" : reqId === 'women' ? "Women's Fashion" : "Ethnic Wear",
              displayOrder: 30
            });
          }
        });
        setCategories(offlineCategories);
      }
    } catch (err) {
      setError(true);
    } finally {
      // Enforce premium minimum loading time of 1800ms so splash details are visible
      const elapsedTime = Date.now() - startTime;
      const minDuration = 1800;
      if (elapsedTime < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsedTime));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryPress = (catId: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push({
      pathname: '/category-products',
      params: { categoryId: catId }
    });
  };

  // Filter Categories by Search
  const filteredCategories = categories.filter((cat) => {
    const nameMatch = cat.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch && cat.id !== 'quickbuy';
  });

  // Render individual card helper
  const renderCard = (id: string, layoutType: 'tall' | 'wide' | 'square') => {
    const cat = categories.find(c => c.id === id);
    const meta = CATEGORY_VISUALS[id];
    if (!cat || !meta) return null;

    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.cardBase,
          layoutType === 'tall' && styles.cardTall,
          layoutType === 'wide' && styles.cardWide,
          layoutType === 'square' && styles.cardSquare,
          isDark && styles.cardDark,
        ]}
        onPress={() => handleCategoryPress(id)}
        activeOpacity={0.88}
      >
        <Image source={{ uri: meta.image }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardGradientOverlay} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {cat.name}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardCount}>{meta.countText}</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.splashRoot, isDark && styles.rootDark]} edges={['top', 'bottom']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.splashContent}>
          <Animated.View style={{ transform: [{ scale: pulseScale }], opacity: logoOpacity }}>
            <Image
              source={require('../assets/images/easybuy_logo.png')}
              style={styles.splashLogoImg}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text style={[styles.splashQuoteTxt, isDark && styles.textLight, { opacity: quoteOpacity }]}>
            {selectedQuote || "Diving into your own world..."}
          </Animated.Text>

          {/* Elegant Loading Dots */}
          <View style={styles.dotsRow}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.splashDot,
                  {
                    opacity: dot,
                    transform: [{ scale: dot }],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, isDark && styles.rootDark]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ─── STICKY HEADER ─── */}
      <Animated.View style={[
        styles.header, 
        isDark && styles.headerDark,
        {
          opacity: headerOpacity,
          shadowOpacity: headerShadowOpacity,
          elevation: headerElevation,
          transform: [{ translateY: headerY }]
        }
      ]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtnCircle, isDark && styles.backBtnCircleDark]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, isDark && styles.textLight]}>
            Explore
          </Text>
          <Text style={styles.headerSubtitle}>Endless choices</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={openCart}
            style={[styles.headerActionBtn, isDark && styles.headerActionBtnDark]}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeTxt}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        
        {/* ─── SEARCH INPUT BAR ─── */}
        <Animated.View style={[
          styles.searchBarContainer, 
          isDark && styles.searchBarContainerDark,
          {
            opacity: searchOpacity,
            transform: [{ scale: searchScale }]
          }
        ]}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, isDark && styles.textLight]}
            placeholder="Search categories or products..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <Ionicons name="mic-outline" size={18} color="#7C3AED" style={{ marginLeft: 8 }} />
        </Animated.View>

        {/* ─── QUICK DISCOVERY TAB CONTROLS ─── */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.badgesRow}
        >
          {['All', 'Trending', 'New Arrivals', 'Top Rated', 'QuickBuy', 'Offers'].map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setSelectedTab(tab);
                }}
                style={[
                  styles.tabPill,
                  isDark && styles.tabPillDark,
                  isActive && styles.tabPillActive,
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.tabPillTxt, 
                  isDark && styles.tabPillTxtDark,
                  isActive && styles.tabPillTxtActive
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
            <Text style={[styles.errorTitle, isDark && styles.textLight]}>Couldn&apos;t load categories</Text>
            <Text style={styles.errorSub}>Please check your connection and try again</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchCategories} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Categories Section */}
        {!loading && !error && (
          <>
            {/* ─── FEATURED SPOTLIGHT CAROUSEL FOR UNDER-REPRESENTED CATEGORIES ─── */}
            <View style={styles.spotlightSection}>
              <View style={styles.spotlightHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={16} color="#7C3AED" />
                  <Text style={[styles.spotlightHeaderTitle, isDark && styles.textLight]}>
                    Category Spotlights
                  </Text>
                </View>
                <Text style={styles.spotlightHeaderSub}>Curated for you today</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.spotlightScroll}
              >
                {dailySpotlights.map((item: any) => {
                  const meta = CATEGORY_VISUALS[item.id];
                  if (!meta) return null;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.spotlightCard, isDark && styles.spotlightCardDark]}
                      onPress={() => handleCategoryPress(item.id)}
                      activeOpacity={0.88}
                    >
                      <Image source={{ uri: meta.image }} style={styles.spotlightImg} resizeMode="cover" />
                      <View style={styles.spotlightGradient} />
                      <View style={styles.spotlightBadgePill}>
                        <Text style={styles.spotlightBadgeTxt}>{item.badge}</Text>
                      </View>
                      <View style={styles.spotlightInfo}>
                        <Text style={styles.spotlightCardTitle} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.spotlightCardTag} numberOfLines={1}>
                          {item.tag}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Explore by Category</Text>
              <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
                <Text style={styles.sortText}>Featured</Text>
                <Ionicons name="chevron-down" size={14} color="#7C3AED" />
              </TouchableOpacity>
            </View>

            {searchQuery.length > 0 && filteredCategories.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={44} color="#94A3B8" />
                <Text style={[styles.emptyTitle, isDark && styles.textLight]}>No Categories Found</Text>
                <Text style={styles.emptySub}>We couldn&apos;t find any categories matching &quot;{searchQuery}&quot;</Text>
              </View>
            ) : (
              <View style={styles.collageGrid}>
                {/* Collage Row 1: Electronics (Tall Left) + Study & Hostel (Stack Right) */}
                {filteredCategories.some(c => c.id === 'electronics' || c.id === 'study_office' || c.id === 'hostel_essentials') && (
                  <Animated.View style={[
                    styles.collageBlock,
                    getRowScrollStyle(0, 120)
                  ]}>
                    <View style={styles.collageLeftCol}>
                      {renderCard('electronics', 'tall')}
                    </View>
                    <View style={styles.collageRightCol}>
                      {renderCard('study_office', 'wide')}
                      {renderCard('hostel_essentials', 'wide')}
                    </View>
                  </Animated.View>
                )}

                {/* Collage Row 2: Beauty & Home (Stack Left) + Fashion (Tall Right) */}
                {filteredCategories.some(c => c.id === 'fashion' || c.id === 'beauty' || c.id === 'home_living') && (
                  <Animated.View style={[
                    styles.collageBlock,
                    getRowScrollStyle(1, 340)
                  ]}>
                    <View style={styles.collageLeftCol}>
                      {renderCard('beauty', 'wide')}
                      {renderCard('home_living', 'wide')}
                    </View>
                    <View style={styles.collageRightCol}>
                      {renderCard('fashion', 'tall')}
                    </View>
                  </Animated.View>
                )}

                {/* Collage Row 3: Fashion Collections (Men, Women, Ethnic Wear) */}
                {filteredCategories.some(c => c.id === 'men' || c.id === 'women' || c.id === 'ethnic_wear') && (
                  <Animated.View style={[
                    styles.collageBlock,
                    getRowScrollStyle(2, 560)
                  ]}>
                    <View style={styles.collageLeftCol}>
                      {renderCard('men', 'wide')}
                      {renderCard('women', 'wide')}
                    </View>
                    <View style={styles.collageRightCol}>
                      {renderCard('ethnic_wear', 'tall')}
                    </View>
                  </Animated.View>
                )}

                {/* Collage Row 4: Gaming (Square) + Fitness (Square) + Grocery (Square) */}
                {filteredCategories.some(c => c.id === 'gaming' || c.id === 'fitness' || c.id === 'grocery') && (
                  <Animated.View style={[
                    styles.collageThreeCol,
                    getRowScrollStyle(3, 780)
                  ]}>
                    {renderCard('gaming', 'square')}
                    {renderCard('fitness', 'square')}
                    {renderCard('grocery', 'square')}
                  </Animated.View>
                )}

                {/* Collage Row 5: Kitchen (Tall Left) + Lifestyle & Accessories (Stack Right) */}
                {filteredCategories.some(c => c.id === 'kitchen' || c.id === 'lifestyle' || c.id === 'accessories') && (
                  <Animated.View style={[
                    styles.collageBlock,
                    getRowScrollStyle(4, 910)
                  ]}>
                    <View style={styles.collageLeftCol}>
                      {renderCard('kitchen', 'tall')}
                    </View>
                    <View style={styles.collageRightCol}>
                      {renderCard('lifestyle', 'wide')}
                      {renderCard('accessories', 'wide')}
                    </View>
                  </Animated.View>
                )}

                {/* Collage Row 6: Sports & Pet Care (Stack Left) + Footwear (Tall Right) */}
                {filteredCategories.some(c => c.id === 'footwear' || c.id === 'sports' || c.id === 'pet_care') && (
                  <Animated.View style={[
                    styles.collageBlock,
                    getRowScrollStyle(5, 1130)
                  ]}>
                    <View style={styles.collageLeftCol}>
                      {renderCard('sports', 'wide')}
                      {renderCard('pet_care', 'wide')}
                    </View>
                    <View style={styles.collageRightCol}>
                      {renderCard('footwear', 'tall')}
                    </View>
                  </Animated.View>
                )}

                {/* Collage Row 7: 2x2 Clean Squares for remaining items (Automobile, Baby, Health, Gifts) */}
                {filteredCategories.some(c => c.id === 'automobile' || c.id === 'baby_care' || c.id === 'health_care' || c.id === 'gifts') && (
                  <Animated.View style={[
                    styles.collageTwoByTwo,
                    getRowScrollStyle(6, 1350, true)
                  ]}>
                    <View style={styles.twoByTwoRow}>
                      {renderCard('automobile', 'wide')}
                      {renderCard('baby_care', 'wide')}
                    </View>
                    <View style={styles.twoByTwoRow}>
                      {renderCard('health_care', 'wide')}
                      {renderCard('gifts', 'wide')}
                    </View>
                  </Animated.View>
                )}
              </View>
            )}

            {/* ─── NORMAL HELP BOX BELOW ALL CATEGORIES ─── */}
            <View style={[styles.helpCardContainer, isDark && styles.helpCardContainerDark]}>
              <View style={styles.helpCardContent}>
                <View style={styles.helpIconCircle}>
                  <Ionicons name="headset-outline" size={22} color="#7C3AED" />
                </View>
                <View style={styles.helpTextWrap}>
                  <Text style={[styles.helpTitle, isDark && styles.textLight]}>
                    Need Help Finding Something?
                  </Text>
                  <Text style={styles.helpSubtitle}>
                    24/7 shopping assistance available
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.helpBtn}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push('/support' as any);
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={15} color="#FFFFFF" />
                <Text style={styles.helpBtnTxt}>Need Help?</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </Animated.ScrollView>
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
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  backBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnCircleDark: {
    backgroundColor: '#334155',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  textLight: {
    color: '#F8FAFC',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  headerActionBtnDark: {
    backgroundColor: '#334155',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#7C3AED',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    marginTop: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBarContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  badgesRow: {
    gap: 8,
    paddingBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabPillDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  tabPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  tabPillTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabPillTxtDark: {
    color: '#94A3B8',
  },
  tabPillTxtActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  collageGrid: {
    gap: 12,
  },
  collageBlock: {
    flexDirection: 'row',
    height: 212,
    gap: 12,
  },
  collageLeftCol: {
    flex: 1,
    gap: 12,
  },
  collageRightCol: {
    flex: 1,
    gap: 12,
  },
  collageThreeCol: {
    flexDirection: 'row',
    height: 110,
    gap: 12,
  },
  collageTwoByTwo: {
    gap: 12,
  },
  twoByTwoRow: {
    flexDirection: 'row',
    height: 100,
    gap: 12,
  },
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardTall: {
    flex: 1,
    height: '100%',
  },
  cardWide: {
    flex: 1,
    height: '100%',
  },
  cardSquare: {
    flex: 1,
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    zIndex: 2,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardCount: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
  skeletonLarge: {
    flex: 1,
    height: 160,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
  },
  skeletonMedium: {
    flex: 1,
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
  },
  errorSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  splashRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  splashLogoImg: {
    width: 180,
    height: 70,
    marginBottom: 24,
  },
  splashQuoteTxt: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  splashDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotlightSection: {
    marginVertical: 14,
  },
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  spotlightHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  spotlightHeaderSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  spotlightScroll: {
    gap: 12,
    paddingRight: 16,
  },
  spotlightCard: {
    width: 170,
    height: 115,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  spotlightCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  spotlightImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  spotlightGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  spotlightBadgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  spotlightBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  spotlightInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  spotlightCardTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  spotlightCardTag: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  helpCardContainer: {
    marginTop: 110,
    marginBottom: 6,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  helpCardContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  helpCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  helpIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTextWrap: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  helpSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  helpBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  helpBtnTxt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
