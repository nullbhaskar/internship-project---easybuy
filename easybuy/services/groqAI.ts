// ─── GROQ AI SERVICE ─────────────────────────────────────────────────────────
// Catalog-grounded, state-aware EasyBuy AI — NEVER hallucinates products.

import { generateFullIndianCatalog, ProductItem } from '../constants/catalogGenerator';

const GROQ_API_KEY = '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';
const GROQ_MODEL   = 'openai/gpt-oss-120b';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: { message: { role: string; content: string }; finish_reason: string }[];
}

export async function callGroq(messages: GroqMessage[], maxTokens = 512): Promise<string> {
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.4, // lower = more consistent, less hallucination
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err}`);
    }
    const json: GroqResponse = await res.json();
    return json.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (e: any) {
    console.warn('[GroqAI] Request failed:', e?.message ?? e);
    throw e;
  }
}

// ─── 1. APP KNOWLEDGE BASE ───────────────────────────────────────────────────
// Comprehensive knowledge about EasyBuy app so AI can guide users correctly

const EASYBUY_APP_KNOWLEDGE = `
EasyBuy is an Indian state-based Quick Commerce & E-commerce app.

APP STRUCTURE:
- Home Screen: 12 featured categories shown on homepage
- All Items / Explore Page: 22 total product categories

22 PRODUCT CATEGORIES IN EXPLORE PAGE:
1. QuickBuy (10-20 min delivery) - milk, bread, eggs, daily essentials
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
    const keywords: string[] = JSON.parse(reply);
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
    const items: ParsedCartItem[] = JSON.parse(reply);
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
    const parsed = JSON.parse(reply);
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
    'You are EasyBuy AI Concierge — a catalog-grounded assistant for EasyBuy, an Indian quick-commerce app.\n' +
    EASYBUY_APP_KNOWLEDGE + '\n\n' +
    'STRICT RULES:\n' +
    '1. You MUST ONLY recommend products that exist in the EasyBuy catalog provided below. NEVER invent products, brands, or prices.\n' +
    '2. If the user asks for a SPECIFIC BRAND or item that is NOT in the catalog (like Kookaburra bat, Rolex watch, Louis Vuitton), you MUST say it is not available and suggest what IS available.\n' +
    '3. If catalog has 0 results for the query, say the product is not available and offer related categories.\n' +
    '4. Be state-aware: if user is in Bihar, mention Sattu, Makhana, Litchi context; if Haryana, mention dairy/fitness; if Punjab, mention gym nutrition etc.\n' +
    '5. Never repeat the same response. Vary your tone and wording each time.\n' +
    '6. Reply ONLY in this valid JSON format — no markdown, no backticks:\n' +
    '{\n' +
    '  "isAIResult": true,\n' +
    '  "type": "gift"|"recipe"|"outfit"|"fitness"|"study"|"grocery"|"beauty"|"general"|"unavailable",\n' +
    '  "title": "Short engaging title with emoji",\n' +
    '  "emoji": "single emoji",\n' +
    '  "chatReply": "2-3 sentence warm conversational response. If unavailable, explain why and suggest alternatives.",\n' +
    '  "tagline": "Short subtitle",\n' +
    '  "metaBadge": "e.g. 3 Items Found",\n' +
    '  "steps": ["optional recipe steps only if cooking request"],\n' +
    '  "items": [ { "id": "use real product ID from catalog", "name": "EXACT product name from catalog", "price": REAL price number, "quantity": "1 pc", "category": "category", "reason": "why recommended" } ],\n' +
    '  "totalPrice": sum of all item prices\n' +
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
      700
    );

    const parsed = JSON.parse(reply);
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
  stateName?: string
): Promise<AIChatResponse> {
  const lastUserMsg = [...conversationHistory].reverse().find((m) => m.role === 'user')?.content || '';
  const q = lastUserMsg.toLowerCase();

  // Check for unavailable brand first
  const unavailableBrand = detectUnavailableBrand(lastUserMsg);

  // Search catalog for the user's last message
  const categoryHint = inferCategoryFromQuery(q);
  const catalogResults = searchCatalog(lastUserMsg, stateName, categoryHint, 4);

  // Detect if this is a shopping/product request
  const isShoppingRequest = /want|chahiye|dikhao|buy|order|gift|recipe|outfit|gym|protein|study|snack|grocery|mobile|laptop|shoe|watch|bag|bat|ball|cricket|football|clothes|hoodie|jeans|serum|face wash|recommend/i.test(lastUserMsg);

  const locationHint = stateName
    ? `User is in ${stateName}, India. Tailor cultural context to ${stateName}.`
    : 'User is in India.';

  const catalogContext = catalogResults.length > 0
    ? 'AVAILABLE IN EASYBUY CATALOG:\n' + catalogResults.map((p, i) =>
        `${i + 1}. "${p.name}" | ₹${p.priceNumber} | ${p.categoryName} | ID: ${p.id}`
      ).join('\n')
    : (isShoppingRequest ? 'NO MATCHING PRODUCTS FOUND IN CATALOG.' : '');

  const systemPrompt =
    'You are EasyBuy AI — a friendly, witty shopping assistant for an Indian quick-commerce app.\n' +
    EASYBUY_APP_KNOWLEDGE + '\n\n' +
    'RULES:\n' +
    '1. You can chat about ANYTHING (jokes, greetings, advice, general knowledge). Be warm and conversational.\n' +
    '2. For shopping requests, ONLY use products from the catalog provided. NEVER make up products or prices.\n' +
    '3. If a specific brand/item is not in the catalog, say so honestly and suggest what IS available.\n' +
    '4. Be state-aware: Bihar = Sattu/Makhana culture; Haryana = dairy/fitness; Goa = beach vibes etc.\n' +
    '5. Vary your responses — do not repeat the same text.\n' +
    '6. Reply ONLY with pure JSON (no markdown, no backticks):\n' +
    'If shopping: { "replyText": "...", "hasProducts": true, "bundle": { "title": "...", "emoji": "...", "tagline": "...", "items": [ { "id": "real catalog ID", "name": "real product name", "price": real number, "quantity": "1 pc", "category": "...", "reason": "..." } ], "totalPrice": number } }\n' +
    'If just chatting: { "replyText": "...", "hasProducts": false }';

  const userPrompt =
    locationHint + '\n' +
    (unavailableBrand ? `NOTE: User asked for "${unavailableBrand}" which is NOT in catalog. Tell them kindly.\n` : '') +
    (catalogContext ? '\n' + catalogContext + '\n' : '') +
    '\nUser message: "' + lastUserMsg + '"';

  try {
    const groqMessages: AIChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5),
    ];
    // Override the last message with our enriched prompt
    groqMessages[groqMessages.length - 1] = { role: 'user', content: userPrompt };

    const reply = await callGroq(groqMessages, 600);
    const parsed = JSON.parse(reply);

    if (parsed && parsed.replyText) {
      let bundle = parsed.bundle;

      // Anchor items to real catalog
      if (bundle && Array.isArray(bundle.items) && catalogResults.length > 0) {
        bundle.items = bundle.items.map((aiItem: any) => {
          const real = catalogResults.find((r) =>
            r.id === aiItem.id ||
            (r.name || r.title).toLowerCase().includes((aiItem.name || '').toLowerCase().slice(0, 10))
          ) || catalogResults[Math.floor(Math.random() * catalogResults.length)];
          return {
            id: real.id,
            name: real.name || real.title,
            price: real.priceNumber || Number(real.price) || 199,
            quantity: aiItem.quantity || '1 pc',
            category: real.categoryId,
            reason: aiItem.reason || `Available in ${real.categoryName}`,
            image: real.thumbnail || real.image,
          };
        });
        bundle.totalPrice = bundle.items.reduce((s: number, it: any) => s + Number(it.price), 0);
      } else if (catalogResults.length === 0 && isShoppingRequest) {
        bundle = undefined;
        parsed.hasProducts = false;
      }

      return {
        replyText: parsed.replyText,
        hasProducts: Boolean(parsed.hasProducts && bundle?.items?.length),
        bundle,
      };
    }
  } catch (e) {
    console.log('[GroqAI] Chat assistant error:', e);
  }

  // Fallback
  if (catalogResults.length > 0 && isShoppingRequest) {
    const fallback = buildCatalogFallback(lastUserMsg, catalogResults, stateName);
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

  if (unavailableBrand) {
    const res = buildUnavailableResponse(lastUserMsg, stateName, unavailableBrand);
    return { replyText: res.chatReply, hasProducts: false };
  }

  return {
    replyText: 'Namaste! Main hoon aapka EasyBuy AI. Aap mujhse shopping, recipes, gifts, ya kuch bhi pooch sakte hain!',
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
