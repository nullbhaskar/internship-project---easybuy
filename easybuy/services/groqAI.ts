// ─── GROQ AI SERVICE ─────────────────────────────────────────────────────────
// Firebase-grounded EasyBuy AI — product availability ALWAYS comes from Firestore.
// The AI NEVER uses its own knowledge to claim a product exists.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { generateFullIndianCatalog, ProductItem } from '../constants/catalogGenerator';
import { QB_CATEGORIES } from '../constants/quickbuyData';
import {
  checkProductAvailability,
  buildAvailabilityContext,
  getCurrentLocation,
} from './firebaseCatalogSearch';
function getBaseApiUrl(): string {
  if (Platform.OS === 'web') {
    return '';
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8081`;
  }
  return process.env.EXPO_PUBLIC_API_URL || '';
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: { message: { role: string; content: string }; finish_reason: string }[];
}

export async function callGroq(messages: GroqMessage[], maxTokens = 512): Promise<string> {
  try {
    const baseUrl = getBaseApiUrl();
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        maxTokens,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Proxy API error ${res.status}: ${err}`);
    }
    const json: GroqResponse = await res.json();
    return json.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (e: any) {
    console.warn('[GroqAI] Request failed:', e?.message ?? e);
    throw e;
  }
}

export function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

// ─── 1. APP KNOWLEDGE BASE ───────────────────────────────────────────────────
// Comprehensive knowledge about EasyBuy app so AI can guide users correctly

const EASYBUY_APP_KNOWLEDGE = `
EasyBuy is a revolutionary Indian state-based Quick Commerce & E-commerce app built with a React Native and Firebase real-time backend.
DEVELOPMENT TEAM: EasyBuy was developed by Bhaskar. The project was built under the supervision of Abhishek Kumar Singh.
If anyone asks who made this app or who the supervisor is, state this fact!

APP STRUCTURE:
- Home Screen: 12 featured categories shown on homepage
- All Items / Explore Page: 22 total product categories
- QuickBuy Page: 10-20 min ultra-fast delivery for daily essentials (Milk, Bread, Eggs, Medicines, Sanitary Pads, Snacks)

22 PRODUCT CATEGORIES IN EXPLORE PAGE:
1. QuickBuy (10-20 min delivery) - milk, bread, eggs, daily essentials, medicine, hygiene
2. Electronics & Tech - phones, laptops, earbuds, smartwatches, keyboards
3. Fashion & Apparel - baggy jeans, cargo pants, oversized tees, hoodies, coord sets
4. Beauty & Cosmetics - serums, face wash, lip tints, moisturizers, Korean skincare
5. Home & Living - furniture, decor, lights, storage
6. Gaming Zone - controllers, gaming accessories, gaming chairs
7. Study & Office - notebooks, pens, desk organizers, calculators
8. Fitness & Gym - whey protein, creatine, gym gloves, resistance bands
9. Hostel Essentials - electric kettles, desk lamps, laptop stands, bedsheets
10. Grocery & Snacks - local snacks, packaged food, makhana, sattu
11. Kitchen & Appliances - pressure cooker, induction cooktop, mixer grinder
12. Lifestyle & Vibe - tumblers, galaxy projectors, aesthetic items
13. Accessories & Bags - watches, sunglasses, belts, backpacks
14. Footwear & Kicks - sneakers, sandals, sports shoes
15. Sports & Outdoors - cricket bat, badminton, football, yoga mat, dumbbells
16. Pet Care & Food - dog food, cat food, pet toys
17. Automobile & Bike - car accessories, bike helmets, tyre inflators
18. Baby Care & Toys - diapers, baby food, rattles, soft toys
19. Health & Wellness - thermometer, BP monitor, oximeter, vitamins
20. Gifts & Hampers - gift boxes, celebration kits, hampers
21. Kitchen (cookware) - kadhai, tawa, pressure cooker
22. Regional Specialties - state-specific products per location

STATE-BASED SYSTEM:
- EasyBuy is location-aware: products shown based on user's selected Indian state
- Bihar → Sattu, Makhana (Mithila), Litchi (Muzaffarpur), local study essentials
- Haryana → Dairy products, fitness gear, agri tools (NOT Sattu - that's Bihar)
- Punjab → Dairy, gym nutrition, Phulkari fashion
- Maharashtra/Mumbai → Streetwear, tech gadgets, K-beauty
- Karnataka/Bengaluru → Electronics, gaming, filter coffee, tech accessories
- Kerala → Spices, coconut oil, Ayurveda products
- Rajasthan → Handicrafts, Mojaris footwear, pickles
- Goa → Beachwear, lifestyle, beverages
- West Bengal/Kolkata → Darjeeling tea, Bengali sweets, fashion

IMPORTANT: EasyBuy does NOT carry luxury cricket brand bats like Kookaburra, Gray-Nicolls, or SS Ton.
EasyBuy carries generic/standard sports equipment in the Sports & Outdoors category.
EasyBuy does NOT carry: imported luxury items, premium foreign brands not listed above, custom artisan crafts not in catalog.
`;

// ─── 2. CATALOG SEARCH ENGINE ────────────────────────────────────────────────

let _catalog: ProductItem[] | null = null;

function getCatalog(): ProductItem[] {
  if (!_catalog) {
    try {
      _catalog = generateFullIndianCatalog();
      
      // Inject QuickBuy items into the catalog for AI to search
      const qbProducts: ProductItem[] = [];
      QB_CATEGORIES.forEach(cat => {
        cat.products.forEach(p => {
          const priceNum = parseInt(p.price.replace(/[^0-9]/g, ''), 10) || 0;
          const origPriceNum = p.originalPrice ? (parseInt(p.originalPrice.replace(/[^0-9]/g, ''), 10) || priceNum) : priceNum;
          
          qbProducts.push({
            id: p.id,
            productId: p.id,
            title: p.name,
            name: p.name,
            shortTitle: p.name,
            description: '10-minute QuickBuy delivery item',
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
            mrp: origPriceNum,
            originalPriceNumber: origPriceNum,
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
            searchKeywords: [p.name.toLowerCase(), cat.name.toLowerCase(), 'quickbuy', 'fast delivery', p.weight.toLowerCase()],
            stateName: 'All',
            stateId: 'all',
            city: 'All',
            locality: 'All'
          } as ProductItem);
        });
      });
      _catalog = [..._catalog, ...qbProducts];
    } catch {
      _catalog = [];
    }
  }
  return _catalog;
}

/**
 * Search the real EasyBuy catalog for products matching a query + state.
 * Returns top matches scored by relevance.
 */
export function searchCatalog(
  query: string,
  stateName?: string,
  categoryHint?: string,
  maxResults = 5
): ProductItem[] {
  const catalog = getCatalog();
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/).filter((t) => t.length > 2);

  // Hinglish synonym expansion
  const SYNONYMS: Record<string, string[]> = {
    bat: ['cricket', 'sports', 'badminton', 'baseball'],
    ball: ['cricket', 'football', 'sports'],
    chai: ['tea', 'tata tea', 'chai patti'],
    doodh: ['milk', 'dairy'],
    anda: ['eggs', 'farm fresh'],
    maggi: ['noodles', 'instant'],
    sattu: ['sattu', 'grocery', 'bihar', 'protein'],
    makhana: ['makhana', 'fox nuts', 'grocery', 'snack'],
    joote: ['shoes', 'sneakers', 'footwear'],
    kapde: ['clothes', 'fashion', 'hoodie', 'jeans'],
    ghadi: ['watch', 'smartwatch', 'accessories'],
    mobile: ['phone', 'smartphone', 'electronics'],
    laptop: ['laptop', 'macbook', 'electronics'],
    earphone: ['earbuds', 'headphone', 'electronics'],
    protein: ['whey', 'protein', 'fitness'],
    gym: ['fitness', 'protein', 'dumbbell'],
    gift: ['gift', 'hamper', 'celebration'],
    cricket: ['sports', 'cricket'],
    football: ['sports', 'football'],
    badminton: ['sports', 'badminton'],
    hoodie: ['fashion', 'hoodie', 'sweatshirt'],
    jeans: ['fashion', 'jeans', 'denim'],
    serum: ['beauty', 'serum', 'skincare'],
    pads: ['sanitary', 'whisper', 'stayfree', 'hygiene'],
    santry: ['sanitary', 'pads'],
    sanitary: ['pads', 'hygiene'],
    vitamin: ['multivitamin', 'health', 'supplements', 'gummies'],
    multivitamin: ['vitamin', 'health', 'supplements', 'gummies'],
  };

  // Expand terms with synonyms
  const allTerms = [...terms];
  for (const term of terms) {
    const syns = SYNONYMS[term];
    if (syns) allTerms.push(...syns);
  }

  const scored = catalog
    .filter((p) => {
      // State filter (prefer state match, but allow cross-state if scarce)
      if (stateName && p.stateName && stateName !== p.stateName) return true; // keep but lower score
      return true;
    })
    .map((p) => {
      const titleLow = (p.title || p.name || '').toLowerCase();
      const catLow = (p.categoryName || '').toLowerCase();
      const keyLow = (p.searchKeywords || []).join(' ').toLowerCase();
      const stateMatch = stateName && p.stateName === stateName;

      let score = 0;
      for (const t of allTerms) {
        if (titleLow.includes(t)) score += 5;
        if (keyLow.includes(t)) score += 3;
        if (catLow.includes(t)) score += 2;
        if ((p.categoryId || '').toLowerCase().includes(t)) score += 2;
      }
      if (stateMatch) score += 4;
      if (categoryHint && (p.categoryId || '').includes(categoryHint)) score += 3;

      return { product: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreak: prefer state-matching products
      const aSM = stateName && a.product.stateName === stateName ? 1 : 0;
      const bSM = stateName && b.product.stateName === stateName ? 1 : 0;
      return bSM - aSM;
    });

  // Deduplicate by category to avoid 5 identical products
  const seen = new Set<string>();
  const deduped: ProductItem[] = [];
  for (const { product } of scored) {
    const key = `${product.categoryId}_${product.title?.slice(0, 20)}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(product);
    }
    if (deduped.length >= maxResults) break;
  }

  return deduped;
}

/**
 * Check if a specific brand/product type is available in the catalog.
 * Returns true only if real catalog entries exist.
 */
export function isProductAvailable(query: string, stateName?: string): boolean {
  const results = searchCatalog(query, stateName, undefined, 3);
  return results.length > 0;
}

// ─── 3. TIME-AWARE SMART FEED ────────────────────────────────────────────────

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night' | 'latenight';

export function getCurrentTimeSlot(): TimeSlot {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 16) return 'afternoon';
  if (h >= 16 && h < 20) return 'evening';
  if (h >= 20 && h < 23) return 'night';
  return 'latenight';
}

const TIME_SLOT_CONTEXT: Record<TimeSlot, string> = {
  morning:   'It is early morning in India (6-11 AM). The user may want fresh groceries, milk, tea, bread, fruits, morning skincare, or study supplies.',
  afternoon: 'It is afternoon in India (11 AM-4 PM). The user may want snacks, beverages, tech accessories, stationery, or fashion.',
  evening:   'It is evening in India (4-8 PM). The user may want ethnic wear, beauty products, trending fashion, footwear, or home decor.',
  night:     'It is night in India (8-11 PM). The user may want cozy hoodies, gaming gear, Korean skincare, late-night snacks, or beverages.',
  latenight: 'It is late night in India (11 PM-5 AM). The user may want instant food, earbuds, Maggi, Horlicks, or comfort snacks.',
};

export async function getTimeAwareKeywords(stateName?: string): Promise<string[]> {
  const slot = getCurrentTimeSlot();
  const locationHint = stateName ? ` The user is located in ${stateName}, India.` : ' The user is in India.';
  try {
    const reply = await callGroq(
      [
        { role: 'system', content: 'You are an AI shopping personalisation engine for EasyBuy, an Indian e-commerce app. Reply ONLY with a valid JSON array of exactly 5 short product search keywords (strings). No markdown, no explanation.' },
        { role: 'user', content: TIME_SLOT_CONTEXT[slot] + locationHint + ' Suggest 5 short product search terms (1-3 words each) that are most relevant for a shopping homepage right now. Example output: ["fresh milk","whole wheat bread","morning serum","green tea","study lamp"]' },
      ],
      120
    );
    const keywords: string[] = cleanAndParseJSON(reply);
    if (Array.isArray(keywords) && keywords.every((k) => typeof k === 'string')) {
      return keywords.slice(0, 5);
    }
  } catch {}

  const FALLBACKS: Record<TimeSlot, string[]> = {
    morning:   ['fresh milk', 'bread', 'green tea', 'fruit bowl', 'face wash'],
    afternoon: ['cold drink', 'snacks', 'earbuds', 'cargo pants', 'study lamp'],
    evening:   ['ethnic wear', 'lipstick', 'hoodies', 'sneakers', 'perfume'],
    night:     ['Maggi instant', 'Korean serum', 'gaming headset', 'hoodies', 'makhana'],
    latenight: ['instant noodles', 'Horlicks', 'earbuds', 'dark chocolate', 'cozy socks'],
  };
  return FALLBACKS[slot];
}

// ─── 4. VOICE SEARCH PARSER ──────────────────────────────────────────────────

export interface ParsedCartItem {
  name: string;
  quantity: number;
  category: string;
}

export async function parseVoiceToCart(spokenText: string): Promise<ParsedCartItem[]> {
  try {
    const reply = await callGroq(
      [
        { role: 'system', content: 'You are a shopping cart parser for an Indian e-commerce app called EasyBuy. Extract product names, quantities, and categories from spoken requests in English, Hindi, or Hinglish. Reply ONLY with a valid JSON array: [{ "name": string, "quantity": number, "category": string }]. No markdown.' },
        { role: 'user', content: `User said: "${spokenText}". Parse into cart items.` },
      ],
      256
    );
    const items: ParsedCartItem[] = cleanAndParseJSON(reply);
    if (Array.isArray(items)) return items;
  } catch {}
  return [];
}

export interface ParsedVoiceSearch {
  cleanQuery: string;
  category?: string;
  maxPrice?: number;
  isQuickBuy?: boolean;
}

export async function parseVoiceSearchQuery(spokenText: string): Promise<ParsedVoiceSearch> {
  try {
    const reply = await callGroq(
      [
        { role: 'system', content: 'You are an Indian e-commerce search query cleaner for EasyBuy. Convert natural language/voice input into clean search keywords. Reply ONLY with valid JSON: { "cleanQuery": string, "category"?: string, "maxPrice"?: number, "isQuickBuy"?: boolean }. No markdown.' },
        { role: 'user', content: `User voice search: "${spokenText}"` },
      ],
      150
    );
    const parsed = cleanAndParseJSON(reply);
    if (parsed && parsed.cleanQuery) return parsed;
  } catch {}
  const clean = spokenText.replace(/(mujhe|dikhao|chahiye|search|show me|find|buy|want|under|below|ke andar)/gi, '').trim();
  return { cleanQuery: clean || spokenText };
}

// ─── 5. CATALOG-GROUNDED UNIVERSAL AI SHOPPING ───────────────────────────────
// This is the CORE AI engine — it ONLY shows products that ACTUALLY exist in the catalog.

export interface UniversalAIItem {
  id: string;
  name: string;
  quantity?: string;
  price: number;
  category: string;
  reason?: string;
  image?: string;
}

export interface UniversalAIShoppingResult {
  isAIResult: boolean;
  type: 'gift' | 'recipe' | 'outfit' | 'fitness' | 'study' | 'grocery' | 'beauty' | 'general' | 'unavailable';
  title: string;
  emoji: string;
  chatReply: string;
  tagline: string;
  metaBadge?: string;
  steps?: string[];
  items: UniversalAIItem[];
  totalPrice: number;
}

// Detect if user is asking for a very specific unavailable brand/product
function detectUnavailableBrand(userInput: string): string | null {
  const q = userInput.toLowerCase();
  // Specific brand bats not in catalog
  if ((q.includes('kookaburra') || q.includes('kokabura') || q.includes('ss ton') || q.includes('gray nicolls') || q.includes('sg bat') || q.includes('mrf bat')) && q.includes('bat')) {
    return `${userInput.trim()} (premium cricket brand)`;
  }
  // Specific luxury items not in catalog
  if (q.includes('rolex') || q.includes('louis vuitton') || q.includes('gucci') || q.includes('prada')) {
    return userInput.trim();
  }
  return null;
}

// Map a user query to a category ID for catalog search
function inferCategoryFromQuery(q: string): string | undefined {
  const ql = q.toLowerCase();
  if (ql.match(/bat|cricket|football|badminton|tennis|yoga|dumbbell|fitness equipment/)) return 'sports';
  if (ql.match(/phone|laptop|earbud|headphone|keyboard|smartwatch|charger|cable/)) return 'electronics';
  if (ql.match(/hoodie|jeans|tshirt|tee|shirt|dress|kurta|saree|cargo|outfit/)) return 'fashion';
  if (ql.match(/serum|face|beauty|lipstick|moisturizer|sunscreen|skincare/)) return 'beauty';
  if (ql.match(/protein|whey|gym|creatine|supplement/)) return 'fitness';
  if (ql.match(/milk|bread|egg|grocery|snack|sattu|makhana|atta|dal|rice|oil/)) return 'grocery';
  if (ql.match(/gift|hamper|birthday gift|celebration/)) return 'gifts';
  if (ql.match(/study|notebook|pen|stationery|office/)) return 'study_office';
  if (ql.match(/kettle|lamp|hostel|bedsheet|pillow/)) return 'hostel_essentials';
  if (ql.match(/game|gaming|controller|gamepad/)) return 'gaming';
  if (ql.match(/shoe|sneaker|sandal|chappal|boot/)) return 'footwear';
  if (ql.match(/watch|bag|sunglass|belt|wallet/)) return 'accessories';
  if (ql.match(/baby|diaper|toy|rattle/)) return 'baby_care';
  if (ql.match(/health|medicine|thermometer|bp monitor|oximeter/)) return 'health_care';
  if (ql.match(/pet|dog|cat|animal food/)) return 'pet_care';
  if (ql.match(/car|bike|tyre|helmet|automobile/)) return 'automobile';
  if (ql.match(/kitchen|cooker|mixer|grinder|tawa|kadhai/)) return 'kitchen';
  return undefined;
}

/**
 * MAIN AI SHOPPING FUNCTION — Catalog-Grounded.
 */
export async function processUniversalAIShopping(
  userInput: string,
  stateName?: string
): Promise<UniversalAIShoppingResult> {
  const q = userInput.toLowerCase().trim();

  // ── Step 1: Check for specific unavailable brand ──
  const unavailableBrand = detectUnavailableBrand(userInput);

  // ── Step 2: Search actual catalog ──
  const categoryHint = inferCategoryFromQuery(q);
  const catalogResults = searchCatalog(userInput, stateName, categoryHint, 5);

  // ── Step 3: Build prompt with catalog context ──
  const locationHint = stateName
    ? `The user is in ${stateName}, India. Prioritize products and cultural context relevant to ${stateName}.`
    : 'The user is in India.';

  // Prepare catalog snapshot for AI context (real products)
  const catalogContext = catalogResults.length > 0
    ? 'REAL PRODUCTS FOUND IN EASYBUY CATALOG:\n' +
      catalogResults.map((p, i) =>
        `${i + 1}. "${p.name}" | Category: ${p.categoryName} | Price: ₹${p.priceNumber} | ID: ${p.id}`
      ).join('\n')
    : 'NO MATCHING PRODUCTS FOUND IN THE CATALOG.';

  const systemPrompt =
    'You are "EasyBuy AI Concierge" — the most advanced, emotionally intelligent, and ultra-fast shopping assistant ever built. You operate on the ChatGPT-4 level of conversational intelligence but with real-time Quick Commerce capabilities.\n' +
    EASYBUY_APP_KNOWLEDGE + '\n\n' +
    '🔥 CORE PERSONA & TONE:\n' +
    '- Think like a highly intelligent AI meets a high-end luxury personal shopper.\n' +
    '- You possess HIGH Emotional Intelligence (EQ). If a user is stressed (e.g., "Exam tomorrow"), be encouraging and fast. If they are sad (e.g., "Heartbreak"), be comforting and suggest chocolates/ice cream.\n' +
    '- Use witty, sharp, and highly engaging language. Never sound robotic.\n' +
    '- Multilingual Mastery: Seamlessly blend English and Hinglish (Hindi/English) if the user speaks in Hinglish. Match their exact vibe.\n\n' +
    '📍 HYPER-PERSONALIZATION (STATE-AWARE):\n' +
    '- Explicitly use the user\'s location to build rapport (e.g., "Since you are in Delhi, the pollution is crazy right now, let me suggest...", or "For a true Bihar vibe...").\n\n' +
    '⚡ TECH FLEX (FOR PRESENTATION):\n' +
    '- Casually brag about EasyBuy\'s tech stack. Mention how our "10-Minute Firebase Real-time Backend" or "Spatial Navigation Engine" ensures they get what they want instantly.\n\n' +
    '🚫 STRICT GUARDRAILS (ZERO HALLUCINATION):\n' +
    '1. You MUST ONLY recommend products that exist in the catalog context below. NEVER invent products or prices.\n' +
    '2. If the user asks for a specific brand/item NOT in the catalog, politely say: "I checked our live 10-minute inventory, and we are out of [Brand], but I pulled some incredible premium alternatives for you."\n\n' +
    'FORMAT:\n' +
    'Reply ONLY in this exact JSON structure — no markdown blocks:\n' +
    '{\n' +
    '  "isAIResult": true,\n' +
    '  "type": "gift"|"recipe"|"outfit"|"fitness"|"study"|"grocery"|"beauty"|"general"|"unavailable",\n' +
    '  "title": "A witty, ultra-catchy title with emoji",\n' +
    '  "emoji": "🔥",\n' +
    '  "chatReply": "A highly empathetic, brilliant 2-4 sentence conversational reply matching their exact emotional state.",\n' +
    '  "tagline": "Short punchy subtitle",\n' +
    '  "metaBadge": "e.g. 10-Min Delivery",\n' +
    '  "steps": ["optional steps only if recipe/guide"],\n' +
    '  "items": [ { "id": "REAL_ID", "name": "EXACT_NAME", "price": 0, "quantity": "1", "category": "cat", "reason": "Brilliant reason why you picked this" } ],\n' +
    '  "totalPrice": 0\n' +
    '}';

  const userPrompt =
    `User request: "${userInput}"\n` +
    locationHint + '\n\n' +
    (unavailableBrand ? `NOTE: The user specifically asked for "${unavailableBrand}" which is NOT available in EasyBuy catalog. Do NOT show this brand.\n\n` : '') +
    catalogContext;

  try {
    const reply = await callGroq(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      1200
    );

    const parsed = cleanAndParseJSON(reply);
    if (parsed && parsed.title) {
      // ── CRITICAL: Replace AI-hallucinated items with real catalog products ──
      if (Array.isArray(parsed.items) && catalogResults.length > 0) {
        parsed.items = parsed.items.map((aiItem: any) => {
          // Try to match AI's suggested product name with a real catalog product
          const matchedReal = catalogResults.find((r) =>
            r.id === aiItem.id ||
            (r.name || r.title).toLowerCase().includes((aiItem.name || '').toLowerCase().slice(0, 12))
          );
          if (matchedReal) {
            return {
              id: matchedReal.id,
              name: matchedReal.name || matchedReal.title,
              price: matchedReal.priceNumber || matchedReal.price,
              quantity: aiItem.quantity || '1 pc',
              category: matchedReal.categoryId,
              reason: aiItem.reason,
              image: matchedReal.thumbnail || matchedReal.image,
            };
          }
          // If AI item doesn't match anything real, use a real catalog product instead
          const fallbackReal = catalogResults[0];
          return {
            id: fallbackReal.id,
            name: fallbackReal.name || fallbackReal.title,
            price: fallbackReal.priceNumber || Number(fallbackReal.price) || 199,
            quantity: aiItem.quantity || '1 pc',
            category: fallbackReal.categoryId,
            reason: aiItem.reason || 'Available on EasyBuy',
            image: fallbackReal.thumbnail || fallbackReal.image,
          };
        });
      } else if (parsed.type === 'unavailable' || catalogResults.length === 0) {
        // No catalog match — honest "not available" response
        parsed.items = [];
        parsed.type = 'unavailable';
      }

      const totalPrice = (parsed.items || []).reduce((s: number, it: any) => s + (Number(it.price) || 0), 0);
      return {
        ...parsed,
        isAIResult: true,
        items: parsed.items || [],
        totalPrice,
      };
    }
  } catch (e) {
    console.log('[GroqAI] Universal AI processing error:', e);
  }

  // ── Fallback: catalog-only response without AI ──
  if (catalogResults.length > 0) {
    return buildCatalogFallback(userInput, catalogResults, stateName);
  }

  // ── No products at all: honest unavailable response ──
  return buildUnavailableResponse(userInput, stateName, unavailableBrand);
}

function buildCatalogFallback(
  userInput: string,
  products: ProductItem[],
  stateName?: string
): UniversalAIShoppingResult {
  const first = products[0];
  const emoji = inferEmoji(first?.categoryId || 'general');
  return {
    isAIResult: true,
    type: 'general',
    title: `${emoji} Best Matches for "${userInput.slice(0, 20)}"`,
    emoji,
    chatReply: `Aapke liye EasyBuy par ye products available hain${stateName ? ` in ${stateName}` : ''}. Ye sab genuine aur fast delivery ke saath aate hain!`,
    tagline: `${products.length} products found in EasyBuy catalog`,
    metaBadge: `${products.length} Items Found`,
    items: products.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name || p.title,
      price: p.priceNumber || Number(p.price) || 199,
      quantity: '1 pc',
      category: p.categoryId,
      reason: `Available in ${p.categoryName}`,
      image: p.thumbnail || p.image,
    })),
    totalPrice: products.slice(0, 4).reduce((s, p) => s + (p.priceNumber || Number(p.price) || 199), 0),
  };
}

function buildUnavailableResponse(
  userInput: string,
  stateName?: string,
  brandName?: string | null
): UniversalAIShoppingResult {
  const stateContext = stateName ? ` in ${stateName}` : '';
  const brandMsg = brandName
    ? `"${brandName}" abhi EasyBuy par available nahi hai. `
    : `"${userInput}" ke liye koi exact match nahi mila${stateContext}. `;

  return {
    isAIResult: true,
    type: 'unavailable',
    title: '🔍 Product Not Available',
    emoji: '🔍',
    chatReply:
      brandMsg +
      'EasyBuy par sports equipment, electronics, fashion, grocery, fitness aur bahut kuch available hai. ' +
      'Aap Sports & Outdoors ya related category explore kar sakte hain!',
    tagline: 'This item is not currently in our catalog',
    metaBadge: 'Not Available',
    items: [],
    totalPrice: 0,
  };
}

function inferEmoji(categoryId: string): string {
  const map: Record<string, string> = {
    sports: '🏏', electronics: '📱', fashion: '👕', beauty: '✨',
    grocery: '🛒', fitness: '💪', gifts: '🎁', study_office: '📚',
    hostel_essentials: '🏠', gaming: '🎮', footwear: '👟',
    accessories: '⌚', kitchen: '🍳', lifestyle: '🌟', quickbuy: '⚡',
    health_care: '💊', baby_care: '👶', pet_care: '🐾', automobile: '🚗',
  };
  return map[categoryId] || '🛍️';
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity?: string;
  price: number;
  category: string;
  image?: string;
}

export interface RecipeOccasionBundle {
  isRecipe: boolean;
  recipeName: string;
  emoji: string;
  tagline: string;
  servings: string;
  prepTime: string;
  steps: string[];
  ingredients: RecipeIngredient[];
  totalPrice: number;
}

// Backward compat alias
export const generateRecipeOccasionBundle = async (
  spokenText: string,
  stateName?: string
): Promise<RecipeOccasionBundle> => {
  const res = await processUniversalAIShopping(spokenText, stateName);
  return {
    isRecipe: true,
    recipeName: res.title,
    emoji: res.emoji,
    tagline: res.tagline,
    servings: res.metaBadge || 'Serves 2-4',
    prepTime: '15 Mins',
    steps: res.steps || ['1. Review items and click Add to Cart to order.'],
    ingredients: res.items.map((it) => ({
      id: it.id,
      name: it.name,
      quantity: it.quantity || '1 pack',
      price: it.price,
      category: it.category,
      image: it.image,
    })),
    totalPrice: res.totalPrice,
  };
};

// ─── 6. TWO-WAY CONVERSATIONAL AI CHAT ───────────────────────────────────────
// Catalog-grounded chat: searches catalog BEFORE generating response

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatResponse {
  replyText: string;
  hasProducts: boolean;
  action?: 'ADD_TO_CART' | 'ADD_TO_WISHLIST';
  learnedFact?: string;
  bundle?: {
    title: string;
    emoji: string;
    tagline?: string;
    items: {
      id: string; name: string; price: number;
      quantity?: string; category?: string; reason?: string; image?: string;
    }[];
    totalPrice: number;
  };
}

export async function chatWithEasyBuyAI(
  conversationHistory: AIChatMessage[],
  stateName?: string,
  isPureVoiceMode: boolean = false
): Promise<AIChatResponse> {
  const lastUserMsg = [...conversationHistory].reverse().find((m) => m.role === 'user')?.content || '';

  // ── Load user taught facts ──
  let userTaughtFacts = '';
  try {
    const savedFacts = await AsyncStorage.getItem('learned_facts');
    if (savedFacts) {
      userTaughtFacts = '\n\nUSER TAUGHT FACTS (CRITICAL MEMORY):\n' + savedFacts + '\n';
    }
  } catch (e) {
    console.log('Failed to load facts', e);
  }

  // ── Step 1: Get actual user location from AsyncStorage (set by location service) ──
  const locationData = await getCurrentLocation();
  const stateId = locationData?.stateId || null;
  const resolvedStateName = locationData?.stateName || stateName || null;

  console.log('[EasyBuy AI] USER QUERY:', lastUserMsg);
  console.log('[EasyBuy AI] CURRENT LOCATION:', resolvedStateName, '/', stateId);

  // ── Step 2: Check Firebase for real product availability (BEFORE calling Groq) ──
  // This is the ONLY source of truth. Groq only generates the natural-language reply.
  const availabilityResult = await checkProductAvailability(
    lastUserMsg,
    stateId,
    resolvedStateName
  );

  console.log('[EasyBuy AI] FIREBASE RESULT STATUS:', availabilityResult.status);

  // ── Step 3: Build the availability context for Groq ──
  const availabilityContext = buildAvailabilityContext(availabilityResult);

  // ── Step 4: Build system prompts with STRICT Firebase-grounding rules ──
  const FIREBASE_GUARDRAILS =
    '\n\n🔴 ABSOLUTE FIREBASE GROUNDING RULES (HIGHEST PRIORITY — OVERRIDE EVERYTHING ELSE):\n' +
    '1. The FIREBASE AVAILABILITY RESULT in the user message is the ONLY source of truth for product availability.\n' +
    '2. If FIREBASE AVAILABILITY RESULT says NOT FOUND: You MUST tell the user that product is not in the EasyBuy catalog. Do NOT say it exists. Do NOT suggest it might be available.\n' +
    '3. If FIREBASE AVAILABILITY RESULT says NOT AVAILABLE IN USER\'S STATE: Tell user it is not available in their state. You MAY mention other states if listed.\n' +
    '4. If FIREBASE AVAILABILITY RESULT says OUT OF STOCK: Tell user it is out of stock.\n' +
    '5. If FIREBASE AVAILABILITY RESULT says NOT QUICK BUY: Tell user the product exists but QuickBuy is not available for it.\n' +
    '6. If FIREBASE AVAILABILITY RESULT says ERROR: Tell user catalog is temporarily unavailable. Do NOT guess availability.\n' +
    '7. If FIREBASE AVAILABILITY RESULT says LOCATION UNKNOWN: Ask user to enable location. Do NOT assume any state.\n' +
    '8. If FIREBASE AVAILABILITY RESULT says AVAILABLE: Use the verified product list provided. Set hasProducts: true.\n' +
    '9. NEVER use your general world knowledge to decide if EasyBuy has a product. Firebase decides. Period.\n' +
    '10. NEVER invent product names, prices, categories, brands, stock status, or delivery estimates.\n';

  const APP_KNOWLEDGE =
    '\n\n🧠 EASYBUY SYSTEM & FIREBASE ARCHITECTURE KNOWLEDGE:\n' +
    'You possess full knowledge of how EasyBuy is built. If the user asks about your backend, Firebase, or app structure, you can explain:\n' +
    '- Tech Stack: React Native (Expo) frontend, Firebase/Firestore backend, Groq API for LLM processing, and OpenAI TTS for voice.\n' +
    '- Firebase Structure: Data is stored in collections like `products` (contains documents with name, price, stateId, searchKeywords arrays, and stock), `states` (contains state-specific metadata and featured categories), and user data collections.\n' +
    '- Calendar & Events: EasyBuy supports future tracking of product launches, flash sales, and calendar events seamlessly integrated into the shopping experience.\n' +
    '- Search Mechanism: Your search does not rely on direct exact-match Firestore queries alone; it uses a hybrid RAG (Retrieval-Augmented Generation) pipeline where the app first runs a local catalog verification, resolves keywords and tags, and then feeds you the exact, truthful context.\n';

  let systemPrompt = '';

  if (isPureVoiceMode) {
    systemPrompt =
      'You are "EasyBuy Assistant" — a smart, warm, and friendly voice assistant for EasyBuy, built for Indian users. ' +
      'YOU ARE IN VOICE ASSISTANT MODE — your reply will be READ ALOUD by a text-to-speech engine.\n' +
      'DEVELOPMENT TEAM: EasyBuy was developed by Bhaskar under the supervision of Abhishek Kumar Singh.\n' +
      userTaughtFacts +
      FIREBASE_GUARDRAILS +
      '\nLANGUAGE RULES:\n' +
      '- YOU MUST ALWAYS REPLY IN ENGLISH ONLY. The TTS engine cannot pronounce Hindi correctly.\n' +
      '- Even if the user speaks Hindi or Hinglish, always reply in clear simple English.\n\n' +
      'VOICE RESPONSE RULES:\n' +
      '1. SHORT: Maximum 2 short sentences.\n' +
      '2. ENGLISH ONLY: Always reply in English.\n' +
      '3. NO SYMBOLS: Never use *, #, -, bullet points, emojis, or markdown.\n' +
      '4. WARM TONE: Sound like a friendly, helpful person.\n' +
      '5. MEMORY: If user shares a personal fact, include it in the learnedFact field.\n\n' +
      'FORMAT: Reply ONLY in pure JSON. No markdown.\n' +
      '{ "replyText": "your English only spoken response", "hasProducts": false, "learnedFact": "optional" }';
  } else {
    systemPrompt =
      'You are "EasyBuy AI" — an advanced, witty, and highly empathetic Shopping Assistant for Indian e-commerce.\n' +
      'DEVELOPMENT TEAM: EasyBuy was developed by Bhaskar under the supervision of Abhishek Kumar Singh.\n' +
      userTaughtFacts +
      APP_KNOWLEDGE +
      FIREBASE_GUARDRAILS +
      '\n🔥 PERSONA:\n' +
      '1. High EQ & Conversational Brilliance: Chat casually, offer emotional support, and vibe with the user.\n' +
      '2. Multilingual: If the user types in Hindi, Hinglish, or English, reply naturally matching their language.\n' +
      '3. State-Aware: Reference their verified location to build trust.\n' +
      '4. LEARNING: If the user tells you a fact about themselves, include a "learnedFact" field in your JSON.\n\n' +
      'FORMAT: Reply ONLY in pure JSON (NO MARKDOWN, NO ```json).\n' +
      'If shopping (hasProducts true): { "replyText": "reply", "hasProducts": true, "learnedFact": "optional", "bundle": { "title": "title", "emoji": "🔥", "tagline": "...", "items": [ { "id": "real ID from Firebase result", "name": "exact name", "price": number, "quantity": "1", "category": "cat", "reason": "reason" } ], "totalPrice": number } }\n' +
      'If not available / just chatting: { "replyText": "your response", "hasProducts": false, "learnedFact": "optional" }';
  }

  // ── Step 5: Build the user prompt — Firebase result is the grounding context ──
  const locationHint = resolvedStateName
    ? `User location: ${resolvedStateName}${stateId ? ` (${stateId})` : ''}, India.`
    : 'User location: Unknown.';

  const userPrompt =
    locationHint + '\n\n' +
    availabilityContext + '\n\n' +
    'User message: "' + lastUserMsg + '"';

  // ── Step 6: Call Groq with the grounded context ──
  try {
    const groqMessages: AIChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-4), // keep recent context for memory
    ];
    // Override the last user message with the Firebase-enriched prompt
    groqMessages[groqMessages.length - 1] = { role: 'user', content: userPrompt };

    const reply = await callGroq(groqMessages, 600);
    const parsed = cleanAndParseJSON(reply);

    if (parsed && parsed.replyText) {
      let bundle = parsed.bundle;

      // ── Anchor AI bundle items to REAL Firebase products ──
      // The AI picks which products from the Firebase result to show — we enforce that
      // the data (id, name, price) comes from verified Firebase results, not AI imagination.
      const firebaseProducts = [
        ...(availabilityResult.products || []),
        ...(availabilityResult.categoryProducts || []),
      ];

      if (bundle && Array.isArray(bundle.items) && firebaseProducts.length > 0) {
        bundle.items = bundle.items.map((aiItem: any) => {
          // Try to match by ID first, then by name prefix
          const real = firebaseProducts.find((r) =>
            r.id === aiItem.id ||
            (r.name || r.title || '').toLowerCase().includes((aiItem.name || '').toLowerCase().slice(0, 10))
          ) || firebaseProducts[0];
          return {
            id: real.id,
            name: real.name || real.title,
            price: real.priceNumber || Number(real.price) || 0,
            quantity: aiItem.quantity || '1 pc',
            category: real.categoryId,
            reason: aiItem.reason || `Verified in EasyBuy ${real.categoryName}`,
            image: real.thumbnail || real.image,
          };
        });
        bundle.totalPrice = bundle.items.reduce((s: number, it: any) => s + Number(it.price), 0);
      } else if (availabilityResult.status !== 'available') {
        // Firebase says not available — force clear any bundle the AI tried to create
        bundle = undefined;
        parsed.hasProducts = false;
      }

      // Save learned facts to AsyncStorage
      if (parsed.learnedFact) {
        try {
          const oldFacts = await AsyncStorage.getItem('learned_facts') || '';
          const newFacts = oldFacts ? oldFacts + '\n- ' + parsed.learnedFact : '- ' + parsed.learnedFact;
          await AsyncStorage.setItem('learned_facts', newFacts);
          console.log('[EasyBuy AI] Learned new fact:', parsed.learnedFact);
        } catch (e) {}
      }

      return {
        replyText: parsed.replyText,
        hasProducts: Boolean(parsed.hasProducts && bundle?.items?.length),
        action: parsed.action,
        learnedFact: parsed.learnedFact,
        bundle,
      };
    }
  } catch (e) {
    console.log('[GroqAI] Chat assistant error:', e);
  }

  // ── Fallback: If Groq call fails, generate a safe response from Firebase result directly ──
  if (availabilityResult.status === 'available') {
    const firebaseProducts = [
      ...(availabilityResult.products || []),
      ...(availabilityResult.categoryProducts || []),
    ];
    if (firebaseProducts.length > 0) {
      const fallback = buildCatalogFallback(lastUserMsg, firebaseProducts.map(p => ({
        ...p,
        title: p.name || p.title || '',
        name: p.name || p.title || '',
        priceNumber: p.priceNumber,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
      } as any)), resolvedStateName || undefined);
      return {
        replyText: fallback.chatReply,
        hasProducts: true,
        bundle: {
          title: fallback.title,
          emoji: fallback.emoji,
          tagline: fallback.tagline,
          items: fallback.items,
          totalPrice: fallback.totalPrice,
        },
      };
    }
  }

  // Firebase says not available — return a clean, honest response
  const unavailableReply = (() => {
    switch (availabilityResult.status) {
      case 'not_found':
        return `Sorry, I couldn't find "${lastUserMsg.slice(0, 40)}" in the EasyBuy catalog right now. Feel free to explore our categories!`;
      case 'not_available_in_state':
        return `Sorry, that product isn't currently available in ${resolvedStateName || 'your area'}.` +
          (availabilityResult.foundInOtherStates?.length
            ? ` It is listed in ${availabilityResult.foundInOtherStates.slice(0, 2).join(' and ')}.`
            : '');
      case 'out_of_stock':
        return `That product is currently out of stock. Please check back soon!`;
      case 'firebase_error':
        return `I'm having trouble checking the EasyBuy catalog right now. Please try again in a moment.`;
      case 'location_unknown':
        return `I need your location to check product availability for your area. Please enable location access in settings.`;
      default:
        return `I'm here to help! Try asking me about groceries, electronics, fashion, fitness gear, and more.`;
    }
  })();

  return {
    replyText: unavailableReply,
    hasProducts: false,
  };
}

// ─── 7. SIMPLE SUGGESTION HELPER ─────────────────────────────────────────────

export async function getAISuggestion(query: string, stateName?: string): Promise<string> {
  const locationHint = stateName ? ` The user is in ${stateName}, India.` : ' The user is in India.';
  return callGroq(
    [
      { role: 'system', content: 'You are EasyBuy AI, a friendly Indian shopping assistant. Help users find products from categories: grocery, beauty, fashion, electronics, fitness, sports, hostel essentials. Be helpful and concise. Max 3 sentences.' },
      { role: 'user', content: query + locationHint },
    ],
    200
  );
}



