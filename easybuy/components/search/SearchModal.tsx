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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter, router } from 'expo-router';
import { useAddress } from '../../context/AddressContext';
import { useCart } from '../../context/CartContext';
import { voiceRecognition } from '../../services/voiceRecognition';
import { parseVoiceSearchQuery, generateRecipeOccasionBundle, RecipeOccasionBundle } from '../../services/groqAI';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { generateFullIndianCatalog } from '../../constants/catalogGenerator';
import { ProductTransitionWrapper } from '../transition/ProductTransitionWrapper';

const { width, height } = Dimensions.get('window');

// Multi-lingual Hinglish, Hindi, and English Semantic Thesaurus
const HINGLISH_SYNONYMS: Record<string, string[]> = {
  // Food, Groceries & QuickBuy
  maggie: ['maggi', 'noodle', 'noodles', 'instant noodles', 'ramen', 'snack'],
  maggi: ['maggie', 'noodle', 'noodles', 'instant noodles', 'ramen', 'snack'],
  noodle: ['maggi', 'maggie', 'noodles', 'ramen'],
  noodles: ['maggi', 'maggie', 'noodle', 'ramen'],
  chai: ['tea', 'chai patti', 'tea leaves', 'green tea', 'milk', 'sugar', 'ginger'],
  tea: ['chai', 'chai patti', 'tea leaves', 'green tea'],
  doodh: ['milk', 'dairy', 'paneer', 'butter'],
  milk: ['doodh', 'dairy'],
  makhan: ['butter', 'ghee', 'dairy'],
  butter: ['makhan', 'ghee', 'amul'],
  ghee: ['desi ghee', 'butter', 'oil'],
  dahi: ['curd', 'yogurt'],
  curd: ['dahi', 'yogurt'],
  anda: ['egg', 'eggs'],
  ande: ['egg', 'eggs'],
  egg: ['anda', 'ande', 'eggs'],
  eggs: ['anda', 'ande', 'egg'],
  paani: ['water', 'mineral water'],
  water: ['paani', 'mineral water'],
  chawal: ['rice', 'basmati'],
  rice: ['chawal', 'basmati'],
  chini: ['sugar', 'cheeni'],
  cheeni: ['sugar', 'chini'],
  sugar: ['chini', 'cheeni'],
  namak: ['salt', 'spices'],
  salt: ['namak', 'spices'],
  masala: ['spices', 'blend', 'curry'],
  aloo: ['potato', 'potatoes'],
  potato: ['aloo', 'potatoes'],
  pyaaz: ['onion', 'onions'],
  pyaz: ['onion', 'onions'],
  onion: ['pyaaz', 'pyaz', 'onions'],
  tamatar: ['tomato', 'tomatoes'],
  tomato: ['tamatar', 'tomatoes'],
  tel: ['oil', 'mustard oil', 'cooking oil'],
  oil: ['tel', 'mustard oil'],
  coffee: ['cold coffee', 'filter coffee', 'nescafe'],
  biscuit: ['biscuits', 'cookies', 'snack'],
  chips: ['chip', 'wafers', 'crisps', 'snack', 'makhana'],
  snack: ['snacks', 'chips', 'makhana', 'biscuit', 'noodles'],

  // Regional items
  sattu: ['chana sattu', 'roasted chana', 'flour', 'bihar'],
  makhana: ['fox nuts', 'lotus seeds', 'roasted makhana', 'snack'],
  phulkari: ['dupatta', 'suit', 'punjab'],
  jutti: ['juti', 'mojari', 'shoes', 'footwear', 'punjab'],
  saree: ['sari', 'katan', 'silk', 'ethnic', 'banarasi'],
  sari: ['saree', 'katan', 'silk', 'ethnic', 'banarasi'],
  kurti: ['kurta', 'top', 'chikankari', 'ethnic'],
  kurta: ['kurti', 'top', 'sherwani', 'ethnic'],

  // Fashion & Tech
  hoodie: ['hoodies', 'sweatshirt', 'fleece', 'jacket', 'oversized'],
  hoodies: ['hoodie', 'sweatshirt', 'fleece', 'jacket'],
  sweatshirt: ['hoodie', 'hoodies', 'fleece'],
  shoes: ['shoe', 'sneaker', 'sneakers', 'kicks', 'footwear', 'running shoes', 'jutti', 'mojari'],
  shoe: ['shoes', 'sneaker', 'sneakers', 'footwear'],
  sneaker: ['sneakers', 'shoes', 'kicks', 'footwear'],
  sneakers: ['sneaker', 'shoes', 'kicks', 'footwear'],
  joote: ['shoes', 'sneakers', 'footwear'],
  kapde: ['clothes', 'fashion', 'shirt', 'kurti', 'hoodie', 'denim', 'jeans'],
  watch: ['watches', 'smartwatch', 'smart watch', 'ghadi', 'apple'],
  watches: ['watch', 'smartwatch', 'smart watch', 'ghadi'],
  smartwatch: ['watch', 'watches', 'smart watch', 'apple watch', 'ghadi'],
  ghadi: ['watch', 'smartwatch'],
  earbuds: ['earphones', 'airpods', 'tws', 'headphones', 'audio', 'boat'],
  earphones: ['earbuds', 'headphones', 'airpods', 'audio'],
  headphones: ['earbuds', 'earphones', 'anc', 'audio'],
  phone: ['smartphone', 'mobile', 'android', '5g'],
  mobile: ['phone', 'smartphone', '5g'],
};

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

  // Live Voice Input State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);

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

  // ── ENTRY ANIMATION: zoom-fill from transparent pill ──────────
  const entryScale   = useRef(new Animated.Value(0.08)).current; // starts tiny (pill-sized)
  const entryRadius  = useRef(new Animated.Value(30)).current;   // pill → square
  const entryOpacity = useRef(new Animated.Value(0)).current;    // fade in bg
  const flashOpacity = useRef(new Animated.Value(0)).current;    // white blink
  const [entryDone, setEntryDone] = useState(false);

  useEffect(() => {
    if (visible) {
      setEntryDone(false);
      setIsLoadingMoment(true);
      setQueryText('');
      setMode(initialMode);

      // Reset entry anim
      entryScale.setValue(0.08);
      entryRadius.setValue(30);
      entryOpacity.setValue(0);
      flashOpacity.setValue(0);

      // Phase 1: zoom-fill (120ms) → flash blink (80ms) → reveal UI
      Animated.sequence([
        Animated.parallel([
          Animated.timing(entryScale,   { toValue: 1,    duration: 220, easing: Easing.out(Easing.exp), useNativeDriver: true }),
          Animated.timing(entryRadius,  { toValue: 0,    duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: false }),
          Animated.timing(entryOpacity, { toValue: 1,    duration: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        // White flash blink
        Animated.timing(flashOpacity, { toValue: 0.55, duration: 55, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0,    duration: 90, useNativeDriver: true }),
      ]).start(() => {
        setEntryDone(true);
      });

      // Start stagger a bit after entry
      const loadTimer = setTimeout(() => {
        setIsLoadingMoment(false);
        triggerStaggeredReveals();
      }, 340);

      // Morph anim (existing)
      Animated.timing(searchMorphAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();

      return () => clearTimeout(loadTimer);
    } else {
      entryScale.setValue(0.08);
      entryOpacity.setValue(0);
      setEntryDone(false);
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
    if (isVoiceActive) {
      voiceRecognition.stop();
      setIsVoiceActive(false);
      setVoiceHint(null);
    }
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

  const toggleVoiceSearch = () => {
    if (isVoiceActive) {
      voiceRecognition.stop();
      setIsVoiceActive(false);
      setVoiceHint(null);
      return;
    }

    setIsVoiceActive(true);
    setVoiceHint('Listening... Speak now 🎙️');

    voiceRecognition.start({
      onStart: () => {
        setIsVoiceActive(true);
        setVoiceHint('Listening... Speak now 🎙️');
      },
      onResult: async (transcript, isFinal) => {
        setQueryText(transcript);
        if (isFinal) {
          setIsVoiceActive(false);
          setVoiceHint(null);
          try {
            const parsed = await parseVoiceSearchQuery(transcript);
            if (parsed && parsed.cleanQuery) {
              setQueryText(parsed.cleanQuery);
            }
          } catch {}
        }
      },
      onError: (err) => {
        setIsVoiceActive(false);
        setVoiceHint('Could not hear voice. Tap mic to try again.');
        setTimeout(() => setVoiceHint(null), 3000);
      },
      onEnd: () => {
        setIsVoiceActive(false);
        setVoiceHint(null);
      },
    });
  };

  const { addToCart } = useCart();
  const { stateProducts, selectedStateName } = useAddress();
  const [recipeKit, setRecipeKit] = useState<RecipeOccasionBundle | null>(null);
  const [recipeToast, setRecipeToast] = useState<string | null>(null);
  const [isRecipeExpanded, setIsRecipeExpanded] = useState(true);

  // Auto-detect recipe & meal requests in Search
  useEffect(() => {
    if (!queryText.trim() || queryText.trim().length < 3) {
      setRecipeKit(null);
      return;
    }

    const q = queryText.toLowerCase();
    const isMealQuery =
      q.includes('chai') ||
      q.includes('tea') ||
      q.includes('maggi') ||
      q.includes('maggie') ||
      q.includes('noodle') ||
      q.includes('pav bhaji') ||
      q.includes('pakora') ||
      q.includes('pakoda') ||
      q.includes('litti') ||
      q.includes('banana hai') ||
      q.includes('recipe') ||
      q.includes('breakfast') ||
      q.includes('dinner');

    if (isMealQuery) {
      let isCancelled = false;
      generateRecipeOccasionBundle(queryText, selectedStateName).then((kit) => {
        if (!isCancelled && kit && kit.ingredients && kit.ingredients.length > 0) {
          setRecipeKit(kit);
        }
      });
      return () => {
        isCancelled = true;
      };
    } else {
      setRecipeKit(null);
    }
  }, [queryText, selectedStateName]);

  const handleAddRecipeKitToCart = () => {
    if (!recipeKit) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    recipeKit.ingredients.forEach((ing) => {
      addToCart({
        id: ing.id || `rec_ing_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title: ing.name,
        price: `₹${ing.price || 40}`,
        image: ing.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        quantity: 1,
        unit: ing.quantity,
      });
    });

    setRecipeToast(`✨ Added all ${recipeKit.ingredients.length} items from ${recipeKit.recipeName} to Cart!`);
    setTimeout(() => setRecipeToast(null), 3000);
  };

  // Fetch live products directly from Firestore (same as Admin Panel!)
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadDbProducts() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          const list = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          setDbProducts(list);
        }
      } catch (e) {
        console.log('Firestore search query error:', e);
      }
    }
    loadDbProducts();
  }, []);

  // Combine Firestore products + stateProducts + clean catalog products (Deduplicated!)
  const allCatalogProducts = React.useMemo(() => {
    const map = new Map<string, any>();

    // Helper to clean title e.g. "Cosco Cricket Bat English Willow Grade 1 (Andhra Pradesh Edition)" -> "Cosco Cricket Bat English Willow Grade 1"
    const cleanTitle = (t: string) => t.replace(/\s*\([^)]+Edition\)/gi, '').trim();

    // 1. Add Firestore products first (Highest Priority - Live Admin Data!)
    dbProducts.forEach((p) => {
      const title = cleanTitle(p.title || p.name || '');
      if (title) {
        map.set(title, {
          ...p,
          title,
          image: p.thumbnail || (p.images && p.images[0]) || p.image || p.imageUrl,
        });
      }
    });

    // 2. Add stateProducts
    stateProducts.forEach((p) => {
      const title = cleanTitle(p.title || (p as any).name || '');
      if (title && !map.has(title)) {
        map.set(title, {
          ...p,
          title,
          image: p.thumbnail || (p.images && p.images[0]) || p.image,
        });
      }
    });

    // 3. Add full catalog base products (deduplicated by clean title)
    const full = generateFullIndianCatalog();
    full.forEach((p) => {
      const title = cleanTitle(p.title || p.name || p.shortTitle || '');
      if (!title) return;

      const img = p.thumbnail || (p.images && p.images[0]) || p.image || '';
      const isTrackOrGymImg = img.includes('photo-1461896836934') || img.includes('photo-1517838277536');

      if (!map.has(title) || isTrackOrGymImg) {
        let finalImg = img;
        if (isTrackOrGymImg || !img) {
          if (title.toLowerCase().includes('cricket') || title.toLowerCase().includes('bat')) {
            finalImg = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800';
          } else {
            finalImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
          }
        }
        map.set(title, {
          ...p,
          title,
          image: finalImg,
        });
      }
    });

    return Array.from(map.values());
  }, [dbProducts, stateProducts]);

  const handleRemoveRecent = (term: string) => {
    Haptics.selectionAsync().catch(() => {});
    setRecentSearches((prev) => prev.filter((t) => t !== term));
  };

  // Conversational Hindi/Hinglish/English stop-words to isolate core intent
  const cleanConversationalKeywords = (raw: string): string[] => {
    if (!raw) return [];
    const STOP_WORDS = new Set([
      'mujhe', 'mujhko', 'humko', 'humein', 'ek', 'do', 'teen', 'char', 'chahiye', 'chahie',
      'dikhao', 'dikhana', 'dikhaye', 'batao', 'batana', 'karna', 'karo', 'kar', 'hai', 'kya',
      'wali', 'wala', 'wale', 'achha', 'accha', 'acchi', 'achhi', 'sasta', 'sasti', 'badiya', 'best',
      'mehenga', 'bhi', 'aur', 'ka', 'ki', 'ke', 'liye', 'ko', 'mein', 'par', 'se', 'pas', 'paas',
      'i', 'want', 'need', 'show', 'me', 'please', 'give', 'find', 'search', 'for', 'a', 'an', 'the',
      'some', 'any', 'looking', 'to', 'buy', 'get', 'and', 'or', 'in', 'at', 'with', 'of', 'from'
    ]);

    const tokens = raw
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    const filtered = tokens.filter((t) => !STOP_WORDS.has(t));
    const baseList = filtered.length > 0 ? filtered : tokens;

    // Expand stems (e.g. hoodies -> hoodie, shoes -> shoe, sarees -> saree)
    const expanded = new Set<string>();
    baseList.forEach((kw) => {
      expanded.add(kw);
      if (kw.endsWith('ies') && kw.length > 4) {
        expanded.add(kw.slice(0, -3) + 'y');
        expanded.add(kw.slice(0, -1)); // hoodies -> hoodie
      } else if (kw.endsWith('es') && kw.length > 4) {
        expanded.add(kw.slice(0, -2));
      } else if (kw.endsWith('s') && kw.length > 3) {
        expanded.add(kw.slice(0, -1));
      }
    });

    // Expand Hinglish & Multi-lingual synonyms (e.g. maggie -> noodles, chai -> tea, joote -> shoes)
    const finalSet = new Set<string>(expanded);
    expanded.forEach((w) => {
      if (HINGLISH_SYNONYMS[w]) {
        HINGLISH_SYNONYMS[w].forEach((syn) => finalSet.add(syn));
      }
    });

    return Array.from(finalSet);
  };

  const filteredProducts = React.useMemo(() => {
    if (!queryText.trim()) return [];
    const q = queryText.toLowerCase().trim();
    const keywords = cleanConversationalKeywords(q);

    return allCatalogProducts.filter((prod) => {
      const title = String(prod.title || prod.name || prod.shortTitle || '').toLowerCase();
      const brand = String(prod.brand || '').toLowerCase();
      const category = String(prod.categoryName || prod.category || prod.categoryId || '').toLowerCase();
      const subcategory = String(prod.subcategoryName || prod.subcategory || '').toLowerCase();
      const desc = String(prod.description || prod.shortDescription || '').toLowerCase();
      const allText = `${title} ${brand} ${category} ${subcategory} ${desc}`;

      // 1. Direct exact phrase match
      const exactMatch = allText.includes(q);

      // 2. Multi-token semantic keyword match (e.g. "mujhe ek hoodie chahie" -> "hoodie")
      const keywordMatch = keywords.length > 0 && keywords.some((kw) => allText.includes(kw));

      const matchesCategory =
        selectedCategory === 'All' ||
        category.includes(selectedCategory.toLowerCase());

      return (exactMatch || keywordMatch) && matchesCategory;
    });
  }, [allCatalogProducts, queryText, selectedCategory]);

  // Suggestions based on query
  const suggestions = React.useMemo(() => {
    if (!queryText.trim()) return [];
    const titles = filteredProducts
      .map((p) => String(p.title || p.name || p.shortTitle || ''))
      .filter(Boolean);
    return Array.from(new Set(titles)).slice(0, 5);
  }, [filteredProducts, queryText]);

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
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      {/* ── ZOOM-FILL ENTRY ANIMATION WRAPPER ── */}
      <Animated.View
        style={[
          styles.entryWrapper,
          {
            opacity: entryOpacity,
            transform: [{ scale: entryScale }],
          },
        ]}
      >
        {/* Frosted glass base — pill shape that expands */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(10,10,18,0.55)', borderRadius: entryRadius },
          ]}
          pointerEvents="none"
        />

        {/* ── WHITE FLASH BLINK ── */}
        <Animated.View
          style={[styles.flashOverlay, { opacity: flashOpacity }]}
          pointerEvents="none"
        />

        {/* ── ACTUAL SEARCH UI: BlurView frosted glass ── */}
        <BlurView
          intensity={85}
          tint="dark"
          style={[StyleSheet.absoluteFillObject, { opacity: entryDone ? 1 : 0 }]}
        >
          <View style={styles.container}>



        {/* ── Loading flash ── */}
        {isLoadingMoment ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIconCircle}>
              <Ionicons name="search" size={28} color="#FFFFFF" />
            </View>
          </View>
        ) : (
          <>
            {/* ── TOP HEADER BAR ── */}
            <Animated.View style={[styles.topBar, getSectionStyle(animHeader)]}>
              <TouchableOpacity onPress={handleClose} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>EasyBuy</Text>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            </Animated.View>

            {/* ── SEARCH BAR ── */}
            <Animated.View style={[styles.searchBarWrap, isVoiceActive && { borderColor: '#10B981', borderWidth: 1.5 }, getSectionStyle(animHeader)]}>
              <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={isVoiceActive ? "Listening... Speak now 🎙️" : "Search anything..."}
                placeholderTextColor={isVoiceActive ? "#10B981" : "rgba(255,255,255,0.4)"}
                value={queryText}
                onChangeText={setQueryText}
                autoFocus={!isVoiceActive}
              />
              {queryText.length > 0 && (
                <TouchableOpacity onPress={() => setQueryText('')} activeOpacity={0.7} style={{ marginRight: 8 }}>
                  <Ionicons name="close-circle" size={18} color="#8A8FA8" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={toggleVoiceSearch}
                activeOpacity={0.7}
                style={{
                  padding: 4,
                  backgroundColor: isVoiceActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  borderRadius: 14,
                }}
              >
                <Animated.View style={{ transform: [{ scale: isVoiceActive ? voiceBreatheAnim : 1 }] }}>
                  <Ionicons name={isVoiceActive ? "mic" : "mic-outline"} size={20} color={isVoiceActive ? "#10B981" : "#8A8FA8"} />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            {/* Voice Status Pill if Listening */}
            {isVoiceActive && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 16,
                marginHorizontal: 16,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                gap: 8,
              }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#10B981' }}>
                  {voiceHint || 'Listening... Speak product name 🎙️'}
                </Text>
                <TouchableOpacity onPress={toggleVoiceSearch}>
                  <Ionicons name="close-circle" size={16} color="#10B981" />
                </TouchableOpacity>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── RECIPE TOAST NOTIFICATION ── */}
              {recipeToast && (
                <View style={{
                  backgroundColor: '#10B981',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF', flex: 1 }}>
                    {recipeToast}
                  </Text>
                </View>
              )}

              {/* ── ⚡ AI QUICK-COOK RECIPE & MEAL KIT CARD ── */}
              {recipeKit && (
                <View style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1.5,
                  borderColor: 'rgba(16, 185, 129, 0.35)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 26 }}>{recipeKit.emoji}</Text>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                          {recipeKit.recipeName}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '700' }}>
                          ⚡ AI Quick Recipe & Grocery Kit
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{ padding: 4 }}
                      onPress={() => setIsRecipeExpanded(!isRecipeExpanded)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isRecipeExpanded ? 'chevron-up-circle' : 'chevron-down-circle'}
                        size={22}
                        color="#10B981"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10, lineHeight: 16 }}>
                    {recipeKit.tagline}
                  </Text>

                  {isRecipeExpanded && (
                    <>
                      {/* Recipe Meta Badges */}
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                          <Ionicons name="people-outline" size={12} color="#10B981" />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>{recipeKit.servings}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                          <Ionicons name="time-outline" size={12} color="#10B981" />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>{recipeKit.prepTime}</Text>
                        </View>
                      </View>

                      {/* 3 Steps Instructions */}
                      {recipeKit.steps && recipeKit.steps.length > 0 && (
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 10, marginBottom: 12, gap: 4 }}>
                          {recipeKit.steps.map((st, i) => (
                            <Text key={i} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', lineHeight: 16 }}>
                              {st}
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* Ingredients List */}
                      <Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#8A8FA8', textTransform: 'uppercase', marginBottom: 6 }}>
                        RECIPE INGREDIENTS ({recipeKit.ingredients.length})
                      </Text>

                      <View style={{ gap: 6, marginBottom: 12 }}>
                        {recipeKit.ingredients.map((ing) => (
                          <View
                            key={ing.id}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: 10,
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                              <Text style={{ fontSize: 13, color: '#FFFFFF', fontWeight: '600' }} numberOfLines={1}>
                                {ing.name}
                              </Text>
                              <Text style={{ fontSize: 11, color: '#8A8FA8' }}>
                                ({ing.quantity})
                              </Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#10B981' }}>
                              ₹{ing.price}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* 1-Tap Add All Button */}
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#10B981',
                          paddingVertical: 12,
                          borderRadius: 14,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          shadowColor: '#10B981',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                        onPress={handleAddRecipeKitToCart}
                        activeOpacity={0.88}
                      >
                        <Ionicons name="flash" size={16} color="#FFFFFF" />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 }}>
                          ⚡ ADD ALL {recipeKit.ingredients.length} INGREDIENTS TO CART • ₹{recipeKit.totalPrice}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {/* ── ACTIVE SEARCH: SUGGESTIONS LIST ── */}
              {queryText.length >= 1 && suggestions.length > 0 && (
                <Animated.View style={[styles.section, getSectionStyle(animRecent)]}>
                  <Text style={styles.sectionLabel}>SUGGESTIONS</Text>
                  {suggestions.map((sug, idx) => {
                    // bold-highlight the matched portion
                    const lq = queryText.toLowerCase();
                    const li = sug.toLowerCase().indexOf(lq);
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.suggestionRow}
                        onPress={() => setQueryText(sug)}
                        activeOpacity={0.75}
                      >
                        <Ionicons name="search-outline" size={16} color="#8A8FA8" />
                        <Text style={styles.suggestionText}>
                          {li >= 0 ? (
                            <>
                              <Text style={styles.suggestionTextNormal}>{sug.slice(0, li)}</Text>
                              <Text style={styles.suggestionTextBold}>{sug.slice(li, li + queryText.length)}</Text>
                              <Text style={styles.suggestionTextNormal}>{sug.slice(li + queryText.length)}</Text>
                            </>
                          ) : sug}
                        </Text>
                        <Ionicons name="arrow-up-outline" size={14} color="#8A8FA8" style={{ marginLeft: 'auto' }} />
                      </TouchableOpacity>
                    );
                  })}
                </Animated.View>
              )}

              {/* ── ACTIVE SEARCH: PRODUCTS RESULT ── */}
              {queryText.length >= 1 && (
                <Animated.View style={[styles.section, getSectionStyle(animProducts)]}>
                  <Text style={styles.sectionLabel}>
                    {filteredProducts.length > 0 ? 'RESULTS' : 'NO RESULTS'}
                  </Text>

                  {filteredProducts.length === 0 ? (
                    <View style={styles.noResultsBox}>
                      <View style={styles.noResultsIcon}>
                        <Ionicons name="search-outline" size={32} color="#8A8FA8" />
                      </View>
                      <Text style={styles.noResultsTitle}>Nothing found for "{queryText}"</Text>
                      <Text style={styles.noResultsSub}>Check your spelling or try something else.</Text>
                      <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setQueryText('')} activeOpacity={0.85}>
                        <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                      </TouchableOpacity>
                      {/* Trending Topics */}
                      <Text style={[styles.sectionLabel, { marginTop: 20, marginBottom: 10 }]}>TRENDING TOPICS</Text>
                      <View style={styles.trendingRow}>
                        {TRENDING_KEYWORDS.map(item => (
                          <TouchableOpacity key={item.tag} style={styles.trendChip} onPress={() => setQueryText(item.query)} activeOpacity={0.8}>
                            <Text style={styles.trendChipText}>#{item.query}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.productsGrid}>
                      {filteredProducts.slice(0, 12).map((prod) => {
                        const prodId = prod.id || (prod as any).productId;
                        const displayTitle = prod.title || prod.name || prod.shortTitle || 'Product';
                        let imageUrl = prod.image || prod.thumbnail || (prod.images && prod.images[0]) || (prod as any).imageUrl || '';
                        const isTrackOrGymImg = typeof imageUrl === 'string' && (imageUrl.includes('photo-1461896836934') || imageUrl.includes('photo-1517838277536'));
                        if (!imageUrl || isTrackOrGymImg) {
                          if (displayTitle.toLowerCase().includes('cricket') || displayTitle.toLowerCase().includes('bat')) {
                            imageUrl = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800';
                          } else {
                            imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
                          }
                        }
                        const displayPrice = typeof prod.price === 'string' && prod.price.startsWith('₹') ? prod.price : `₹${prod.priceNumber || prod.price || 999}`;
                        const displayRating = String(prod.rating || prod.ratingString || '4.5');
                        const displayCategory = prod.categoryName || (prod as any).category || (prod as any).categoryId || 'General';

                        return (
                          <ProductTransitionWrapper
                            key={prodId}
                            productId={prodId}
                            imageUrl={imageUrl}
                            productParams={{
                              title: displayTitle,
                              price: displayPrice,
                              category: displayCategory,
                              image: imageUrl,
                            }}
                            style={styles.prodCard}
                            activeOpacity={0.88}
                            onPress={() => {
                              handleClose();
                              router.push({
                                pathname: '/product/[id]',
                                params: {
                                  id: prodId,
                                  title: displayTitle,
                                  price: displayPrice,
                                  category: displayCategory,
                                  image: imageUrl,
                                },
                              } as any);
                            }}
                          >
                            <Image
                              source={{ uri: failedImages[prodId] ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' : imageUrl }}
                              style={styles.prodImg}
                              onError={() => setFailedImages(prev => ({ ...prev, [prodId]: true }))}
                            />
                            <View style={styles.ratingBadge}>
                              <Ionicons name="star" size={9} color="#F6CC63" />
                              <Text style={styles.ratingText}>{displayRating}</Text>
                            </View>
                            <View style={styles.prodInfo}>
                              <Text style={styles.prodTitle} numberOfLines={2}>{displayTitle}</Text>
                              <View style={styles.priceRow}>
                                <Text style={styles.prodPrice}>{displayPrice}</Text>
                                <TouchableOpacity style={styles.addCartBtn}>
                                  <Ionicons name="add" size={14} color="#FFFFFF" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </ProductTransitionWrapper>
                        );
                      })}
                    </View>
                  )}
                </Animated.View>
              )}

              {/* ── IDLE STATE ── */}
              {queryText.length === 0 && (
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <Animated.View style={[styles.section, getSectionStyle(animRecent)]}>
                      <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Recent Searches</Text>
                        <TouchableOpacity onPress={() => setRecentSearches([])}>
                          <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                      </View>

                      {recentSearches.map((term) => (
                        <TouchableOpacity
                          key={term}
                          style={styles.recentRow}
                          onPress={() => setQueryText(term)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="time-outline" size={18} color="#8A8FA8" />
                          <Text style={styles.recentText}>{term}</Text>
                          <TouchableOpacity
                            onPress={() => handleRemoveRecent(term)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ marginLeft: 'auto' }}
                          >
                            <Ionicons name="close" size={16} color="#8A8FA8" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}

                  {/* Popular Right Now */}
                  <Animated.View style={[styles.section, getSectionStyle(animTrending)]}>
                    <Text style={styles.sectionTitle}>Popular Right Now</Text>
                    <View style={styles.trendingRow}>
                      {TRENDING_KEYWORDS.map((item) => (
                        <TouchableOpacity
                          key={item.tag}
                          style={styles.trendChip}
                          onPress={() => setQueryText(item.query)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="trending-up" size={12} color="#4A7CF7" style={{ marginRight: 4 }} />
                          <Text style={styles.trendChipText}>{item.query}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animated.View>
                </>
              )}

            </ScrollView>
          </>
        )}
          </View>{/* end inner container */}
        </BlurView>{/* end frosted glass */}
      </Animated.View>{/* end entryWrapper */}
    </Modal>
  );
};


const styles = StyleSheet.create({
  // ── Entry animation shell ──
  entryWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 99,
  },

  // ── Base ──
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },


  // ── Loading ──
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Top Header Bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Search Bar ──
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    // Frosted glass pill
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A2E',
  },

  // ── Scroll Content ──
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 48,
  },

  // ── Sections ──
  section: {
    paddingHorizontal: 18,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A8FA8',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A7CF7',
  },

  // ── Recent Searches (List) ──
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  recentText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },

  // ── Suggestions ──
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
  },
  suggestionTextNormal: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  suggestionTextBold: {
    color: '#7EB3FF',
    fontWeight: '700',
  },

  // ── Trending / Popular ──
  trendingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  trendChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },

  // ── No Results ──
  noResultsBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noResultsIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22222C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  noResultsSub: {
    fontSize: 13,
    color: '#8A8FA8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  clearSearchBtn: {
    backgroundColor: '#4A7CF7',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 40,
    alignSelf: 'stretch',
  },
  clearSearchBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // ── Product Grid ──
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  prodCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    backgroundColor: '#22222C',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2E2E3A',
    position: 'relative',
  },
  prodImg: {
    width: '100%',
    height: 130,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F6CC63',
  },
  prodInfo: {
    padding: 10,
  },
  prodTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E4EF',
    marginBottom: 6,
    lineHeight: 15,
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
    color: '#FFFFFF',
  },
  addCartBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4A7CF7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // legacy (unused but kept to avoid TS errors)
  containerDark: { backgroundColor: '#0C0C14' },
  inputCol: { flex: 1 },
  actionIconBtn: { padding: 4 },
  catRow: { gap: 8 },
  catChip: { padding: 8 },
  catChipDark: {},
  catChipSelected: {},
  catChipText: { fontSize: 12, color: '#888' },
  catChipTextSelected: { color: '#FFF' },
  sectionBlock: { marginBottom: 20 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentPill: { padding: 8 },
  recentPillDark: {},
  recentPillText: { fontSize: 12, color: '#CCC' },
  trendingPill: { padding: 8 },
  trendingPillDark: {},
  trendingTagText: { fontSize: 11, color: '#888' },
  aiCard: { padding: 12 },
  aiCardDark: {},
  aiCardText: { fontSize: 12, color: '#FFF' },
  suggestionsContainer: { padding: 12 },
  searchHeaderBox: { flexDirection: 'row', alignItems: 'center', height: 50 },
  searchHeaderBoxDark: {},
  loadingText: { fontSize: 14, color: '#FFF' },
  scrollContent_old: { paddingHorizontal: 16 },
});
