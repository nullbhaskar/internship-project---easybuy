import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAddress } from '../../context/AddressContext';
import { ProductTransitionWrapper } from '../transition/ProductTransitionWrapper';

const { width, height } = Dimensions.get('window');

interface ProductItem {
  id: string;
  title: string;
  price: string;
  category: string;
  image: string;
  rating: string;
}

const SEARCH_DATABASE: ProductItem[] = [
  { id: '1', title: 'Air Max Pulse Gen-Z Edition', price: '$189', category: 'Fashion', rating: '4.9', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80' },
  { id: '2', title: 'Noise Cancelling Pro Headphones', price: '$299', category: 'Tech', rating: '5.0', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
  { id: '3', title: 'Cyberpunk Smartwatch V2', price: '$149', category: 'Tech', rating: '4.9', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80' },
  { id: '4', title: 'Minimalist Wood Lamp', price: '$65', category: 'Living', rating: '4.8', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80' },
  { id: '5', title: 'Organic Lavender Candle', price: '$32', category: 'Beauty', rating: '4.7', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80' },
  { id: '6', title: 'Pastel Ceramic Coffee Mug Set', price: '$42', category: 'Living', rating: '4.8', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80' },
];

const ROTATING_PLACEHOLDERS = [
  'Search "Nike Shoes"',
  'Search "Coffee Mug"',
  'Search "Gaming Mouse"',
  'Search "Backpack"',
  'Search "Protein"',
  'Search "Study Lamp"',
  'Search "Hostel Essentials"',
  'Search "AirPods"',
];

const TRENDING_KEYWORDS = [
  { tag: '#1 Air Jordans 🔥', query: 'Air Max' },
  { tag: '#2 Noise Cancelling Pro 🎧', query: 'Headphones' },
  { tag: '#3 Smartwatch V2 ⌚', query: 'Smartwatch' },
  { tag: '#4 Lavender Candle 🕯️', query: 'Candle' },
];

const AI_PROMPTS = [
  '✨ Suggest sneakers under $200',
  '✨ Find wireless headphones with ANC',
  '✨ Best minimalist room decor',
];

const CATEGORIES = ['All', 'Tech', 'Fashion', 'Beauty', 'Living'];

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'text' | 'voice' | 'camera';
  isDarkMode?: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  initialMode = 'text',
  isDarkMode = false,
}) => {
  const [queryText, setQueryText] = useState('');
  const [mode, setMode] = useState<'text' | 'voice' | 'camera'>(initialMode);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Wireless Headphones',
    'Sneakers',
    'Smartwatches',
  ]);

  // Loading moment state (250ms loading screen)
  const [isLoadingMoment, setIsLoadingMoment] = useState(true);
  const [loadingDots, setLoadingDots] = useState('.');

  // Rotating placeholder index
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const placeholderOpacity = useRef(new Animated.Value(1)).current;

  // Voice Breathing Anim
  const voiceBreatheAnim = useRef(new Animated.Value(1)).current;

  // Camera Pulse Anim
  const cameraPulseAnim = useRef(new Animated.Value(1)).current;

  // Staggered Section Reveals (Reanimated / Animated drivers)
  const animHeader = useRef(new Animated.Value(0)).current;
  const animCategories = useRef(new Animated.Value(0)).current;
  const animRecent = useRef(new Animated.Value(0)).current;
  const animTrending = useRef(new Animated.Value(0)).current;
  const animAI = useRef(new Animated.Value(0)).current;
  const animProducts = useRef(new Animated.Value(0)).current;

  // Morph Expansion Drivers
  const searchMorphAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsLoadingMoment(true);
      setQueryText('');
      setMode(initialMode);

      // Start Morph animation
      Animated.timing(searchMorphAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();

      // Loading Moment (250ms)
      const loadTimer = setTimeout(() => {
        setIsLoadingMoment(false);
        triggerStaggeredReveals();
      }, 280);

      return () => clearTimeout(loadTimer);
    } else {
      searchMorphAnim.setValue(0);
      resetStaggeredReveals();
    }
  }, [visible, initialMode]);

  // Rotating Dots for Loading Moment
  useEffect(() => {
    if (isLoadingMoment && visible) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isLoadingMoment, visible]);

  // Rotating Placeholder Loop
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      Animated.timing(placeholderOpacity, { toValue: 0, duration: 150, useNativeDriver: false }).start(() => {
        setPlaceholderIdx((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
        Animated.timing(placeholderOpacity, { toValue: 1, duration: 220, useNativeDriver: false }).start();
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [visible]);

  // Voice Breathing Loop
  useEffect(() => {
    if (!visible) return;
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(voiceBreatheAnim, { toValue: 1.08, duration: 1000, useNativeDriver: false }),
        Animated.timing(voiceBreatheAnim, { toValue: 1.0, duration: 1000, useNativeDriver: false }),
      ])
    );
    breatheLoop.start();
    return () => breatheLoop.stop();
  }, [visible]);

  // Camera Pulse Loop
  useEffect(() => {
    if (!visible) return;
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cameraPulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: false }),
        Animated.timing(cameraPulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: false }),
        Animated.delay(4200),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [visible]);

  const triggerStaggeredReveals = () => {
    resetStaggeredReveals();
    Animated.stagger(60, [
      Animated.timing(animHeader, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(animCategories, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(animRecent, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(animTrending, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(animAI, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(animProducts, { toValue: 1, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  const resetStaggeredReveals = () => {
    animHeader.setValue(0);
    animCategories.setValue(0);
    animRecent.setValue(0);
    animTrending.setValue(0);
    animAI.setValue(0);
    animProducts.setValue(0);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.timing(searchMorphAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      onClose();
    });
  };

  const { stateProducts, selectedStateName } = useAddress();

  const handleRemoveRecent = (term: string) => {
    Haptics.selectionAsync().catch(() => {});
    setRecentSearches((prev) => prev.filter((t) => t !== term));
  };

  const filteredProducts = stateProducts.filter((prod) => {
    const matchesQuery =
      prod.name.toLowerCase().includes(queryText.toLowerCase()) ||
      prod.brand.toLowerCase().includes(queryText.toLowerCase()) ||
      prod.categoryName.toLowerCase().includes(queryText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || prod.categoryName === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const getSectionStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={[styles.container, isDarkMode && styles.containerDark]}>

        {/* ─── SEARCH LOADING MOMENT (250ms) ─── */}
        {isLoadingMoment ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIconCircle}>
              <Ionicons name="search" size={36} color="#2F6E46" />
            </View>
            <Text style={[styles.loadingText, isDarkMode && { color: '#F8FAFC' }]}>
              Searching for the best{loadingDots}
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* ─── ① MORPHED SEARCH BAR HEADER ─── */}
            <Animated.View style={[styles.searchHeaderBox, isDarkMode && styles.searchHeaderBoxDark, getSectionStyle(animHeader)]}>
              <TouchableOpacity style={styles.backBtn} onPress={handleClose} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#F8FAFC' : '#0F172A'} />
              </TouchableOpacity>

              <View style={styles.inputCol}>
                <TextInput
                  style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
                  placeholder={ROTATING_PLACEHOLDERS[placeholderIdx]}
                  placeholderTextColor="#94A3B8"
                  value={queryText}
                  onChangeText={setQueryText}
                  autoFocus
                />
              </View>

              {queryText.length > 0 ? (
                <TouchableOpacity onPress={() => setQueryText('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}

              {/* Voice Button */}
              <TouchableOpacity activeOpacity={0.8} style={styles.actionIconBtn}>
                <Animated.View style={{ transform: [{ scale: voiceBreatheAnim }] }}>
                  <Ionicons name="mic" size={18} color="#8E44AD" />
                </Animated.View>
              </TouchableOpacity>

              {/* Camera Button */}
              <TouchableOpacity activeOpacity={0.8} style={styles.actionIconBtn}>
                <Animated.View style={{ transform: [{ scale: cameraPulseAnim }] }}>
                  <Ionicons name="camera" size={18} color="#3498DB" />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            {/* ─── REAL-TIME TYPING SUGGESTIONS ─── */}
            {queryText.length >= 2 ? (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.sectionTitleHeader}>SMART MATCHES ⚡</Text>
                {['wireless headphones', 'wireless headphones with mic', 'wireless headphones under 2000', 'best wireless headphones'].map((sug, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionRow}
                    onPress={() => setQueryText(sug)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="search-outline" size={16} color="#64748B" />
                    <Text style={[styles.suggestionText, isDarkMode && { color: '#F8FAFC' }]}>{sug}</Text>
                    <Ionicons name="arrow-forward-outline" size={14} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* ─── ② CATEGORY CHIPS ─── */}
            <Animated.View style={getSectionStyle(animCategories)}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        isDarkMode && styles.catChipDark,
                        isSelected && styles.catChipSelected,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setSelectedCategory(cat);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.catChipText,
                          isDarkMode && { color: '#94A3B8' },
                          isSelected && styles.catChipTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* ─── ③ RECENT SEARCHES ─── */}
            {recentSearches.length > 0 && queryText.length === 0 ? (
              <Animated.View style={[styles.sectionBlock, getSectionStyle(animRecent)]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitleHeader}>Recent Searches</Text>
                  <TouchableOpacity onPress={() => setRecentSearches([])}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tagWrap}>
                  {recentSearches.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={[styles.recentPill, isDarkMode && styles.recentPillDark]}
                      onPress={() => setQueryText(term)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.recentPillText, isDarkMode && { color: '#F8FAFC' }]}>{term}</Text>
                      <TouchableOpacity onPress={() => handleRemoveRecent(term)} style={{ marginLeft: 4 }}>
                        <Ionicons name="close" size={12} color="#94A3B8" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {/* ─── ④ TRENDING SEARCHES ─── */}
            {queryText.length === 0 ? (
              <Animated.View style={[styles.sectionBlock, getSectionStyle(animTrending)]}>
                <Text style={styles.sectionTitleHeader}>Trending Searches 🔥</Text>
                <View style={styles.tagWrap}>
                  {TRENDING_KEYWORDS.map((item) => (
                    <TouchableOpacity
                      key={item.tag}
                      style={[styles.trendingPill, isDarkMode && styles.trendingPillDark]}
                      onPress={() => setQueryText(item.query)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.trendingTagText}>{item.tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {/* ─── ⑤ AI SHOPPING PROMPTS ─── */}
            {queryText.length === 0 ? (
              <Animated.View style={[styles.sectionBlock, getSectionStyle(animAI)]}>
                <Text style={styles.sectionTitleHeader}>AI Shopping Prompts ✨</Text>
                {AI_PROMPTS.map((prompt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.aiCard, isDarkMode && styles.aiCardDark]}
                    onPress={() => setQueryText(prompt.replace('✨ ', ''))}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.aiCardText}>{prompt}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#8E44AD" />
                  </TouchableOpacity>
                ))}
              </Animated.View>
            ) : null}

            {/* ─── ⑥ RECOMMENDED PRODUCTS GRID ─── */}
            <Animated.View style={[styles.sectionBlock, getSectionStyle(animProducts)]}>
              <Text style={styles.sectionTitleHeader}>
                {queryText.length > 0 ? `Search Results (${filteredProducts.length})` : 'Popular Recommendations 🛍️'}
              </Text>

              <View style={styles.productsGrid}>
                {filteredProducts.map((prod) => {
                  const imageUrl = (prod as any).thumbnail || (prod as any).image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
                  return (
                    <ProductTransitionWrapper
                      key={prod.id}
                      productId={prod.id}
                      imageUrl={imageUrl}
                      style={[styles.prodCard, isDarkMode && styles.prodCardDark]}
                      activeOpacity={0.88}
                      onPress={handleClose}
                    >
                      <Image
                        source={{
                          uri: failedImages[prod.id]
                            ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
                            : ((prod as any).thumbnail || (prod as any).image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
                        }}
                        style={styles.prodImg}
                        onError={() => setFailedImages((prev) => ({ ...prev, [prod.id]: true }))}
                      />
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text style={styles.ratingText}>{(prod as any).rating}</Text>
                      </View>

                      <View style={styles.prodInfo}>
                        <Text style={[styles.prodTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
                          {(prod as any).name || (prod as any).title}
                        </Text>

                        <View style={styles.priceRow}>
                          <Text style={styles.prodPrice}>{prod.price}</Text>
                          <TouchableOpacity style={styles.addCartBtn}>
                            <Ionicons name="cart" size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ProductTransitionWrapper>
                  );
                })}
              </View>
            </Animated.View>

          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8EF',
    paddingTop: 12,
  },
  containerDark: {
    backgroundColor: '#090D16',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  searchHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#2F6E46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
  },
  searchHeaderBoxDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  backBtn: {
    padding: 4,
  },
  inputCol: {
    flex: 1,
  },
  searchInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionIconBtn: {
    padding: 4,
  },
  catRow: {
    gap: 8,
    marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  catChipSelected: {
    backgroundColor: '#2F6E46',
    borderColor: '#2F6E46',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  catChipTextSelected: {
    color: '#FFFFFF',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recentPillDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  recentPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  trendingPill: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  trendingPillDark: {
    backgroundColor: '#1E1B4B',
    borderColor: '#312E81',
  },
  trendingTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  aiCardDark: {
    backgroundColor: '#1E1B4B',
    borderColor: '#312E81',
  },
  aiCardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E44AD',
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
    position: 'relative',
  },
  prodCardDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  prodImg: {
    width: '100%',
    height: 140,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  prodInfo: {
    padding: 10,
  },
  prodTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    height: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prodPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2F6E46',
  },
  addCartBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2F6E46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
