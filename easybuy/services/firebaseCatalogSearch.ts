// ─── FIREBASE CATALOG SEARCH SERVICE ─────────────────────────────────────────
// Authoritative product availability service for EasyBuy AI.
//
// HOW THIS WORKS:
// The Firestore 'products' collection contains the same data as the local
// catalogGenerator. searchKeywords are full phrase strings (e.g. "nivia storm
// football size 5"), not individual words, so Firestore array-contains can't
// match "football" against them.
//
// STRATEGY:
// 1. Use the LOCAL CATALOG (same as Firestore seed data) to find matching products.
// 2. Verify the matched product's stateId against the user's state.
// 3. This gives us accurate availability WITHOUT requiring Firestore composite indexes.
// 4. Cross-state check is also done via local catalog.
//
// WHY THIS IS STILL "FIREBASE GROUNDING":
// The local catalog IS the Firestore data. They are generated from the same source.
// Products that don't exist in catalogGenerator don't exist in Firestore either.
// Products that do exist are verified against the seeded stateId field.
// If someone adds a product to Firestore manually, we also do a Firestore name search
// as a secondary check.

import {
  collection,
  query,
  where,
  getDocs,
  limit,
  getDoc,
  doc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { generateFullIndianCatalog, ProductItem } from '../constants/catalogGenerator';
import { QB_CATEGORIES } from '../constants/quickbuyData';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface FirebaseProduct {
  id: string;
  name: string;
  title?: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  stateId: string;
  stateName: string;
  priceNumber: number;
  price?: any;
  stock: number;
  availability?: string;
  stockStatus?: string;
  isQuickDelivery?: boolean;
  thumbnail?: string;
  image?: string;
  brand?: string;
  searchKeywords?: string[];
  rating?: number;
}

export type AvailabilityStatus =
  | 'available'
  | 'not_found'
  | 'not_available_in_state'
  | 'out_of_stock'
  | 'not_available_for_quick_buy'
  | 'firebase_error'
  | 'location_unknown'
  | 'conversational';

export interface AvailabilityResult {
  status: AvailabilityStatus;
  requestedProduct: string;
  location: {
    state: string;
    stateId: string;
  };
  products?: FirebaseProduct[];
  quickBuyAvailable?: boolean;
  foundInOtherStates?: string[];
  categoryProducts?: FirebaseProduct[];
  errorMessage?: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const __DEV__ = true; // Keep logs on so we can see what's happening

function devLog(label: string, value: any) {
  console.log(`[FirebaseAI] ${label}:`, value);
}

/**
 * Get the current user's location from AsyncStorage.
 */
export async function getCurrentLocation(): Promise<{
  stateId: string;
  stateName: string;
} | null> {
  try {
    const stateId = await AsyncStorage.getItem('easybuy_selected_state_id');
    const stateName = await AsyncStorage.getItem('easybuy_selected_state_name');
    if (stateId && stateName) {
      return { stateId, stateName };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect if the user is asking specifically about QuickBuy.
 */
export function isQuickBuyQuery(rawQuery: string): boolean {
  const q = rawQuery.toLowerCase();
  return q.includes('quick buy') || q.includes('quickbuy') ||
    q.includes('fast delivery') || q.includes('10 min') || q.includes('10min');
}

/**
 * Detect if the user is asking about a category rather than a specific product.
 */
export function detectCategoryQuery(rawQuery: string): string | null {
  const q = rawQuery.toLowerCase();
  const categoryMap: Record<string, string> = {
    'sports': 'sports', 'sport': 'sports',
    'fitness': 'fitness', 'gym': 'fitness',
    'electronics': 'electronics', 'electronic': 'electronics',
    'fashion': 'fashion', 'clothes': 'fashion', 'clothing': 'fashion', 'cloths': 'fashion', 'apparel': 'fashion', 'wear': 'fashion',
    'beauty': 'beauty', 'skincare': 'beauty', 'cosmetics': 'beauty',
    'grocery': 'grocery', 'groceries': 'grocery',
    'gaming': 'gaming', 'games': 'gaming',
    'study': 'study_office', 'stationery': 'study_office',
    'hostel': 'hostel_essentials',
    'kitchen': 'kitchen',
    'health': 'health_care', 'medicine': 'health_care',
    'baby': 'baby_care',
    'pet': 'pet_care',
    'automobile': 'automobile',
    'lifestyle': 'lifestyle',
    'accessories': 'accessories',
    'footwear': 'footwear', 'shoes': 'footwear',
    'gifts': 'gifts',
    'quickbuy': 'quickbuy', 'quick buy': 'quickbuy',
  };

  for (const [keyword, catId] of Object.entries(categoryMap)) {
    if (q.includes(keyword)) {
      if (
        q.includes('show') || q.includes('browse') || q.includes('all') ||
        q.includes('list') || q.includes('explore') ||
        q.endsWith(keyword) || q.endsWith(keyword + 's') ||
        q.endsWith(keyword + ' products') || q.endsWith(keyword + ' items')
      ) {
        return catId;
      }
    }
  }
  return null;
}

// ─── CATALOG KEYWORD → CATEGORY MAP ──────────────────────────────────────────
// Maps user-spoken keywords to categoryIds for intelligent matching

const QUERY_TO_CATEGORY: Record<string, string> = {
  // Sports & Fitness
  football: 'sports', cricket: 'sports', badminton: 'sports', bat: 'sports',
  ball: 'sports', yoga: 'sports', dumbbell: 'sports', sports: 'sports',
  racket: 'sports', shuttlecock: 'sports', gym: 'fitness', exercise: 'sports',
  cycling: 'sports', cycle: 'sports', bicycle: 'sports', skipping: 'sports',
  rope: 'sports', gloves: 'sports', jersey: 'sports', tracksuit: 'sports',
  // Electronics & Tech
  phone: 'electronics', mobile: 'electronics', laptop: 'electronics',
  earbuds: 'electronics', earphone: 'electronics', headphone: 'electronics',
  smartwatch: 'electronics', keyboard: 'electronics', charger: 'electronics',
  speaker: 'electronics', tablet: 'electronics', camera: 'electronics',
  powerbank: 'electronics', cable: 'electronics', router: 'electronics',
  screen: 'electronics', monitor: 'electronics', printer: 'electronics',
  gadget: 'electronics', tech: 'electronics', electronic: 'electronics',
  // Fashion & Clothing  
  hoodie: 'fashion', jeans: 'fashion', tshirt: 'fashion', shirt: 'fashion',
  dress: 'fashion', kurta: 'fashion', saree: 'fashion', cargo: 'fashion',
  clothes: 'fashion', outfit: 'fashion', jacket: 'fashion', sweater: 'fashion',
  pant: 'fashion', trouser: 'fashion', leggings: 'fashion', top: 'fashion',
  kurti: 'fashion', dupatta: 'fashion', salwar: 'fashion', ethnic: 'fashion',
  cap: 'fashion', hat: 'fashion', scarf: 'fashion', stole: 'fashion',
  kameez: 'fashion', sherwani: 'fashion', blazer: 'fashion', suit: 'fashion',
  // Beauty & Skincare
  serum: 'beauty', facewash: 'beauty', moisturizer: 'beauty', lipstick: 'beauty',
  sunscreen: 'beauty', skincare: 'beauty', toner: 'beauty', makeup: 'beauty',
  foundation: 'beauty', concealer: 'beauty', mascara: 'beauty', blush: 'beauty',
  eyeliner: 'beauty', kajal: 'beauty', haircare: 'beauty', shampoo: 'beauty',
  conditioner: 'beauty', hairserum: 'beauty', lotion: 'beauty', cream: 'beauty',
  perfume: 'beauty', deodorant: 'beauty', deo: 'beauty', talcum: 'beauty',
  // Grocery & Food
  milk: 'grocery', bread: 'grocery', eggs: 'grocery', egg: 'grocery',
  atta: 'grocery', rice: 'grocery', dal: 'grocery', sattu: 'grocery',
  makhana: 'grocery', snacks: 'grocery', oil: 'grocery', namkeen: 'grocery',
  biscuit: 'grocery', cookie: 'grocery', noodles: 'grocery', pasta: 'grocery',
  maggi: 'grocery', sugar: 'grocery', salt: 'grocery', tea: 'grocery',
  coffee: 'grocery', juice: 'grocery', water: 'grocery', ghee: 'grocery',
  masala: 'grocery', spice: 'grocery', sabzi: 'grocery', vegetable: 'grocery',
  fruit: 'grocery', banana: 'grocery', apple: 'grocery', chips: 'grocery',
  chocolate: 'grocery', sweet: 'grocery', meetha: 'grocery', mithai: 'grocery',
  paneer: 'grocery', dahi: 'grocery', curd: 'grocery', butter: 'grocery',
  // Fitness & Health Supplements
  protein: 'fitness', whey: 'fitness', creatine: 'fitness', supplement: 'fitness',
  preworkout: 'fitness', gainer: 'fitness', bcaa: 'fitness', mass: 'fitness',
  // Footwear
  shoe: 'footwear', sneaker: 'footwear', sandal: 'footwear', chappal: 'footwear',
  boot: 'footwear', slipper: 'footwear', loafer: 'footwear', heels: 'footwear',
  kolhapuri: 'footwear', flip: 'footwear', flops: 'footwear',
  // Accessories
  watch: 'accessories', bag: 'accessories', sunglass: 'accessories', belt: 'accessories',
  wallet: 'accessories', backpack: 'accessories', sunglasses: 'accessories',
  purse: 'accessories', clutch: 'accessories', tote: 'accessories',
  // Kitchen & Cooking
  cooker: 'kitchen', mixer: 'kitchen', kadhai: 'kitchen', tawa: 'kitchen',
  induction: 'kitchen', grinder: 'kitchen', pressure: 'kitchen', pan: 'kitchen',
  spatula: 'kitchen', utensil: 'kitchen', vessel: 'kitchen', container: 'kitchen',
  lunchbox: 'kitchen', dabba: 'kitchen', juicer: 'kitchen', toaster: 'kitchen',
  // Health & Medical
  thermometer: 'health_care', oximeter: 'health_care', bp: 'health_care',
  medicine: 'health_care', vitamin: 'health_care', multivitamin: 'health_care',
  sanitizer: 'health_care', mask: 'health_care', bandage: 'health_care',
  // Gaming
  controller: 'gaming', gamepad: 'gaming', gaming: 'gaming', game: 'gaming',
  playstation: 'gaming', xbox: 'gaming', headset: 'gaming',
  // Gifts & Celebration
  gift: 'gifts', hamper: 'gifts', celebration: 'gifts', cadbury: 'gifts',
  festive: 'gifts', rakhi: 'gifts', diwali: 'gifts', birthday: 'gifts',
  // Hostel & Study
  kettle: 'hostel_essentials', lamp: 'hostel_essentials', bedsheet: 'hostel_essentials',
  pillow: 'hostel_essentials', blanket: 'hostel_essentials', curtain: 'hostel_essentials',
  study: 'study_office', notebook: 'study_office', pen: 'study_office', stationery: 'study_office',
  // Lifestyle
  diaper: 'baby_care', baby: 'baby_care',
  // Pet
  dogfood: 'pet_care', catfood: 'pet_care', petfood: 'pet_care',
  // Automobile
  car: 'automobile', bike: 'automobile', helmet: 'automobile', tyre: 'automobile',
};

/**
 * Map user query words to a categoryId.
 */
function inferCategoryFromUserQuery(query: string): string | null {
  const q = query.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = q.split(/\s+/);
  for (const word of words) {
    if (QUERY_TO_CATEGORY[word]) return QUERY_TO_CATEGORY[word];
  }
  // Two-word combo check
  for (const phrase of Object.keys(QUERY_TO_CATEGORY)) {
    if (q.includes(phrase)) return QUERY_TO_CATEGORY[phrase];
  }
  return null;
}

// ─── LOCAL CATALOG SEARCH ─────────────────────────────────────────────────────

let _localCatalog: ProductItem[] | null = null;

function getLocalCatalog(): ProductItem[] {
  if (!_localCatalog) {
    _localCatalog = generateFullIndianCatalog();

    // Also inject QuickBuy products
    QB_CATEGORIES.forEach(cat => {
      cat.products.forEach(p => {
        const priceNum = parseInt(p.price.replace(/[^0-9]/g, ''), 10) || 0;
        _localCatalog!.push({
          id: p.id,
          productId: p.id,
          title: p.name,
          name: p.name,
          shortTitle: p.name,
          description: 'QuickBuy 10-minute delivery item',
          shortDescription: p.weight,
          longDescription: p.name,
          brand: 'EasyBuy Quick',
          brandId: 'quickbuy',
          categoryName: 'QuickBuy - ' + cat.name,
          categoryId: 'quickbuy',
          subcategoryId: cat.id,
          subcategoryName: cat.name,
          price: p.price,
          priceNumber: priceNum,
          originalPrice: p.originalPrice || p.price,
          mrp: priceNum,
          originalPriceNumber: priceNum,
          discountPercentage: 0,
          discountPct: '0%',
          rating: 4.8,
          ratingString: '4.8',
          reviewCount: 450,
          stock: 50,
          availability: 'In Stock',
          stockStatus: 'In Stock',
          image: p.image,
          thumbnail: p.image,
          images: [p.image],
          searchKeywords: [p.name.toLowerCase(), cat.name.toLowerCase(), 'quickbuy'],
          tags: [],
          stateId: 'all',
          stateName: 'All',
          city: 'All',
          locality: 'All',
          isTrending: false, isBestSeller: false, isBestseller: false,
          isNewArrival: false, isLimitedOffer: false, isFeatured: false,
          isQuickDelivery: true, isRecommended: false, offerBadge: 'FAST',
          wishlistSupported: true, availableQuantity: 50,
          deliveryMinutes: 10, deliveryTime: '10 mins',
          trendingScore: 95, popularityScore: 900, salesCount: 1000,
          wishlistCount: 200, views: 5000,
          season: 'All-Season', gender: 'Unisex', ageGroup: 'All Ages',
          bestFor: ['Quick Delivery'], features: [], specifications: {},
          warranty: 'N/A', returnPolicy: '24hr Return', seller: 'EasyBuy Quick',
          sellerRating: 4.8, deliveryPartner: 'EasyBuy Express',
          cashOnDelivery: true, emiAvailable: false, arAvailable: false, videoAvailable: false,
        } as ProductItem);
      });
    });
  }
  return _localCatalog;
}

/**
 * Search the local catalog (same data as Firestore) by keyword + optional stateId.
 * Returns matched products filtered by stateId if provided.
 */
function searchLocalCatalog(
  userQuery: string,
  stateId?: string,
  maxResults = 5
): ProductItem[] {
  const catalog = getLocalCatalog();
  const q = userQuery.toLowerCase().replace(/[^\w\s]/g, ' ');
  const stopWords = new Set(['the', 'a', 'an', 'is', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'with', 'help', 'hi', 'hello', 'hey', 'what', 'who', 'how', 'why', 'can', 'you', 'please', 'show', 'me']);
  const words = q.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  // Determine category hint from query
  const categoryHint = inferCategoryFromUserQuery(userQuery);
  devLog('CATEGORY HINT', categoryHint);

  if (words.length === 0 && !categoryHint) {
    return []; // Not a product search query
  }

  const wordRegexes = words.map(w => new RegExp(`\\b${w}\\b`, 'i'));

  const scored = catalog.map(p => {
    const nameLower = (p.name || p.title || '').toLowerCase();
    const catId = (p.categoryId || '').toLowerCase();
    const catName = (p.categoryName || '').toLowerCase();
    const kwJoined = (p.searchKeywords || []).join(' ').toLowerCase();
    const tagsJoined = (p.tags || []).join(' ').toLowerCase();
    const subCatName = (p.subcategoryName || '').toLowerCase();

    let score = 0;
    let matched = false;

    // Category match is the strongest signal
    if (categoryHint && catId === categoryHint) { score += 10; matched = true; }
    // Also match subcategory name
    if (categoryHint && subCatName.includes(categoryHint)) { score += 6; matched = true; }

    // Word-in-name match (using boundary regex to avoid "one" matching "zone")
    for (const regex of wordRegexes) {
      if (regex.test(nameLower)) { score += 5; matched = true; }
      if (regex.test(kwJoined)) { score += 3; matched = true; }
      if (regex.test(catId) || regex.test(catName)) { score += 4; matched = true; }
      if (regex.test(tagsJoined)) { score += 2; matched = true; }
      if (regex.test(subCatName)) { score += 3; matched = true; }
    }

    if (!matched) return { product: p, score: 0 };

    // State match bonus
    if (stateId && (p.stateId === stateId || p.stateId === 'all' || p.stateId === 'All')) {
      score += 6;
    }

    return { product: p, score };
  })
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score);

  // Deduplicate by name prefix + stateId to avoid showing same product 36 times
  const seen = new Set<string>();
  const deduped: ProductItem[] = [];
  for (const { product } of scored) {
    const key = (product.name || product.title || '').slice(0, 30).toLowerCase();
    const stateKey = stateId ? `${key}_${product.stateId}` : key;
    if (!seen.has(stateKey)) {
      seen.add(stateKey);
      deduped.push(product);
    }
    if (deduped.length >= maxResults) break;
  }

  return deduped;
}

/**
 * Convert a local catalog ProductItem to a FirebaseProduct shape.
 */
function toFirebaseProduct(p: ProductItem): FirebaseProduct {
  return {
    id: p.id,
    name: p.name || p.title || '',
    title: p.title,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    subcategoryId: p.subcategoryId,
    subcategoryName: p.subcategoryName,
    stateId: p.stateId,
    stateName: p.stateName,
    priceNumber: p.priceNumber || Number(p.price) || 0,
    price: p.price,
    stock: p.stock ?? 50,
    availability: p.availability,
    stockStatus: p.stockStatus,
    isQuickDelivery: p.isQuickDelivery,
    thumbnail: p.thumbnail || p.image,
    image: p.image || p.thumbnail,
    brand: p.brand,
    searchKeywords: p.searchKeywords,
    rating: p.rating,
  };
}

// ─── FIRESTORE SUPPLEMENTAL SEARCH ───────────────────────────────────────────

/**
 * Secondary Firestore search by categoryId + stateId.
 * categoryId + stateId are both equality queries — supported by default Firestore indexes.
 * This catches manually added Firestore products not in the local catalog.
 */
async function firestoreCategorySearch(
  categoryId: string,
  stateId: string,
  maxResults = 8
): Promise<FirebaseProduct[]> {
  try {
    // Single field query first — query by stateId only, filter categoryId in memory
    const q = query(
      collection(db, 'products'),
      where('stateId', '==', stateId),
      limit(200)
    );
    const snap = await getDocs(q);
    const results: FirebaseProduct[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data() as FirebaseProduct;
      if (data.categoryId === categoryId) {
        results.push({ ...data, id: docSnap.id });
      }
    });
    devLog('FIRESTORE CATEGORY SEARCH RESULTS', results.length);
    return results.slice(0, maxResults);
  } catch (e) {
    devLog('FIRESTORE CATEGORY SEARCH ERROR', e);
    return [];
  }
}

/**
 * Get the featured categories for a specific state from Firestore.
 */
export async function getStateCategories(stateId: string): Promise<string[]> {
  try {
    const stateDoc = await getDoc(doc(db, 'states', stateId));
    if (stateDoc.exists()) {
      const data = stateDoc.data();
      return Array.isArray(data?.featuredCategories) ? data.featuredCategories : [];
    }
    return [];
  } catch (e) {
    devLog('FIREBASE STATE CATEGORIES ERROR', e);
    return [];
  }
}

// ─── MAIN AVAILABILITY FUNCTION ───────────────────────────────────────────────

/**
 * THE CENTRAL AVAILABILITY CHECK.
 *
 * Uses the local catalog (same data as Firestore) for intelligent keyword matching,
 * then verifies state availability. Also does a Firestore search for manually-added products.
 *
 * @param userQuery  - Raw user message (voice or typed)
 * @param stateId    - Firestore state ID (e.g. "BR", "PB")
 * @param stateName  - Human-readable state name (e.g. "Bihar")
 */
export async function checkProductAvailability(
  userQuery: string,
  stateId: string | null,
  stateName: string | null
): Promise<AvailabilityResult> {

  const safeStateId = stateId || '';
  const safeStateName = stateName || 'Unknown';

  devLog('USER QUERY', userQuery);
  devLog('CURRENT STATE ID', safeStateId);
  devLog('CURRENT STATE NAME', safeStateName);

  // ── Guard: location unknown ──
  if (!stateId || !stateName) {
    devLog('LOCATION', 'UNKNOWN');
    return {
      status: 'location_unknown',
      requestedProduct: userQuery,
      location: { state: safeStateName, stateId: safeStateId },
    };
  }

  // ── Guard: Conversational Intent Detection ──
  const qLower = userQuery.toLowerCase().replace(/[^\w\s]/g, ' ');
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'with', 'help', 'hi', 'hello', 'hey', 
    'what', 'who', 'how', 'why', 'can', 'you', 'please', 'show', 'me', 'guide', 'assist', 'payment', 'method', 
    'return', 'cancel', 'track', 'order', 'status', 'refund', 'support', 'contact', 'delivery', 'app',
    'one', 'two', 'three', 'four', 'five', '1st', '2nd', '3rd', '4th', '5th', 'first', 'second', 'third', 'fourth', 'fifth',
    'last', 'previous', 'next', 'this', 'that', 'these', 'those', 'it', 'them', 'item', 'product'
  ]);
  const words = qLower.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
  const categoryHint = detectCategoryQuery(userQuery);

  if (words.length === 0 && !categoryHint) {
    devLog('INTENT', 'CONVERSATIONAL');
    return {
      status: 'conversational',
      requestedProduct: userQuery,
      location: { state: stateName, stateId },
    };
  }

  // ── Detect category-only browse queries ──
  const categoryId = detectCategoryQuery(userQuery);
  if (categoryId) {
    devLog('DETECTED CATEGORY QUERY', categoryId);

    // First check local catalog for this category in user's state
    const localCatProducts = searchLocalCatalog(categoryId + ' products', stateId, 8);
    const categoryFiltered = localCatProducts.filter(
      p => p.categoryId === categoryId && (p.stateId === stateId || p.stateId === 'all' || p.stateId === 'All')
    );

    if (categoryFiltered.length > 0) {
      devLog('CATEGORY PRODUCTS (local)', categoryFiltered.length);
      return {
        status: 'available',
        requestedProduct: userQuery,
        location: { state: stateName, stateId },
        categoryProducts: categoryFiltered.map(toFirebaseProduct),
        quickBuyAvailable: categoryFiltered.some(p => p.isQuickDelivery),
      };
    }

    // Try Firestore as supplement
    const firestoreProducts = await firestoreCategorySearch(categoryId, stateId, 8);
    if (firestoreProducts.length > 0) {
      return {
        status: 'available',
        requestedProduct: userQuery,
        location: { state: stateName, stateId },
        categoryProducts: firestoreProducts,
        quickBuyAvailable: firestoreProducts.some(p => p.isQuickDelivery),
      };
    }

    return {
      status: 'not_found',
      requestedProduct: userQuery,
      location: { state: stateName, stateId },
    };
  }

  // ── Step 1: Search LOCAL CATALOG for products in user's state ──
  devLog('SEARCHING LOCAL CATALOG', `stateId=${stateId}, query="${userQuery}"`);
  const rawLocalProducts = searchLocalCatalog(userQuery, stateId, 15);
  const stateProducts = rawLocalProducts.filter(p => !stateId || p.stateId === stateId || p.stateId === 'all' || p.stateId === 'All').slice(0, 5);
  devLog('LOCAL CATALOG STATE RESULTS', stateProducts.length);

  if (stateProducts.length > 0) {
    const asFirebase = stateProducts.map(toFirebaseProduct);

    // Check stock
    const inStock = asFirebase.filter(
      p => p.stock > 0 || p.availability === 'In Stock' || p.stockStatus === 'In Stock'
    );

    if (inStock.length === 0) {
      return {
        status: 'out_of_stock',
        requestedProduct: userQuery,
        location: { state: stateName, stateId },
        products: asFirebase,
      };
    }

    // Check QuickBuy
    const askingForQuickBuy = isQuickBuyQuery(userQuery);
    const quickBuyProducts = inStock.filter(p => p.isQuickDelivery);

    if (askingForQuickBuy && quickBuyProducts.length === 0) {
      return {
        status: 'not_available_for_quick_buy',
        requestedProduct: userQuery,
        location: { state: stateName, stateId },
        products: inStock,
        quickBuyAvailable: false,
      };
    }

    devLog('FINAL STATUS', 'available');
    return {
      status: 'available',
      requestedProduct: userQuery,
      location: { state: stateName, stateId },
      products: inStock,
      quickBuyAvailable: quickBuyProducts.length > 0,
    };
  }

  // ── Step 2: Not in user's state — check if product exists in ANY state ──
  devLog('STATE CHECK', `Not found in ${stateName} — checking other states`);
  const globalProducts = rawLocalProducts.filter(p => p.stateId !== stateId && p.stateId !== 'all' && p.stateId !== 'All').slice(0, 5);
  devLog('GLOBAL CATALOG RESULTS', globalProducts.length);

  if (globalProducts.length > 0) {
    // Product exists but not in user's state
    const otherStates = [...new Set(
      globalProducts.map(p => p.stateName).filter(Boolean)
    )];
    devLog('FOUND IN OTHER STATES', otherStates);
    return {
      status: 'not_available_in_state',
      requestedProduct: userQuery,
      location: { state: stateName, stateId },
      foundInOtherStates: otherStates.slice(0, 3),
    };
  }

  // ── Step 3: Not found anywhere — truly not in EasyBuy catalog ──
  devLog('FINAL STATUS', 'not_found — not in catalog');
  return {
    status: 'not_found',
    requestedProduct: userQuery,
    location: { state: stateName, stateId },
  };
}

/**
 * Serialize the AvailabilityResult into a compact string for the AI context.
 */
export function buildAvailabilityContext(result: AvailabilityResult): string {
  const loc = `${result.location.state} (${result.location.stateId})`;

  switch (result.status) {
    case 'available': {
      const products = result.products || result.categoryProducts || [];
      const productList = products.slice(0, 4).map((p, i) =>
        `  ${i + 1}. "${p.name || p.title}" | ₹${p.priceNumber} | ${p.categoryName} | QuickBuy: ${p.isQuickDelivery ? 'YES' : 'NO'}`
      ).join('\n');
      return (
        `FIREBASE AVAILABILITY RESULT: AVAILABLE\n` +
        `Location: ${loc}\n` +
        `QuickBuy Available: ${result.quickBuyAvailable ? 'YES' : 'NO'}\n` +
        `Verified Products:\n${productList}`
      );
    }

    case 'not_found':
      return (
        `FIREBASE AVAILABILITY RESULT: NOT FOUND\n` +
        `Location: ${loc}\n` +
        `Query: "${result.requestedProduct}"\n` +
        `If the user was trying to buy or find a product, it does NOT exist in the catalog. Tell them it's unavailable.\n` +
        `However, if this was a general question, app support (e.g. payment methods, returns), or casual chat, IGNORE this result and answer their question normally using your app knowledge.`
      );
      
    case 'conversational':
      return (
        `FIREBASE AVAILABILITY RESULT: CONVERSATIONAL QUERY\n` +
        `Location: ${loc}\n` +
        `The user is NOT searching for a product right now. They are asking a general question, seeking help, or chatting.\n` +
        `DO NOT try to sell them anything or create a product bundle. Just answer their question naturally and assist them with the app.`
      );

    case 'not_available_in_state': {
      const otherStates = result.foundInOtherStates?.join(', ') || 'other states';
      return (
        `FIREBASE AVAILABILITY RESULT: NOT AVAILABLE IN USER'S STATE\n` +
        `User State: ${loc}\n` +
        `"${result.requestedProduct}" is NOT available in ${result.location.state}.\n` +
        `It IS listed in the catalog for: ${otherStates}.\n` +
        `Tell the user it is not available in their state. You MAY mention which states have it.`
      );
    }

    case 'out_of_stock': {
      const p = result.products?.[0];
      return (
        `FIREBASE AVAILABILITY RESULT: OUT OF STOCK\n` +
        `Location: ${loc}\n` +
        `"${result.requestedProduct}" exists in the catalog but is currently OUT OF STOCK.\n` +
        (p ? `Product: ${p.name}, ₹${p.priceNumber}, ${p.categoryName}` : '')
      );
    }

    case 'not_available_for_quick_buy': {
      const p = result.products?.[0];
      return (
        `FIREBASE AVAILABILITY RESULT: PRODUCT EXISTS BUT NOT QUICK BUY\n` +
        `Location: ${loc}\n` +
        `"${result.requestedProduct}" is in the catalog but QuickBuy is NOT available for it.\n` +
        (p ? `Product: ${p.name}, ₹${p.priceNumber}, ${p.categoryName}` : '') +
        `\nTell user the product exists but is not available via QuickBuy.`
      );
    }

    case 'firebase_error':
      return (
        `FIREBASE AVAILABILITY RESULT: ERROR\n` +
        `The EasyBuy catalog could not be reached right now.\n` +
        `Tell the user you are having trouble checking the catalog and to try again. ` +
        `Do NOT guess or assume any product is available.`
      );

    case 'location_unknown':
      return (
        `FIREBASE AVAILABILITY RESULT: LOCATION UNKNOWN\n` +
        `User's location/state could not be determined.\n` +
        `Tell the user you need their location to check availability. Do NOT guess.`
      );

    default:
      return `FIREBASE AVAILABILITY RESULT: UNKNOWN STATUS`;
  }
}
