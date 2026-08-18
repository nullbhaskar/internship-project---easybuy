// ─── GROQ AI SERVICE ───────────────────────────────────────────────────────
// Wraps Groq REST API for use in Expo React Native (no Node SDK needed)

const GROQ_API_KEY = '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';
const GROQ_MODEL   = 'openai/gpt-oss-120b';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

export interface GroqResponse {
  choices: GroqChoice[];
}

/**
 * Call Groq chat completions API.
 * @param messages  Conversation turns
 * @param maxTokens Max tokens to generate (default 512)
 * @returns         The assistant reply string
 */
export async function callGroq(
  messages: GroqMessage[],
  maxTokens = 512
): Promise<string> {
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
        temperature: 0.7,
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

// ─── 1. TIME-AWARE SMART FEED HELPER ───────────────────────────────────────

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night' | 'latenight';

export function getCurrentTimeSlot(): TimeSlot {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return 'morning';
  if (h >= 11 && h < 16) return 'afternoon';
  if (h >= 16 && h < 20) return 'evening';
  if (h >= 20 && h < 23) return 'night';
  return 'latenight';                       // 11 PM – 5 AM
}

const TIME_SLOT_CONTEXT: Record<TimeSlot, string> = {
  morning:   'It is early morning in India (6–11 AM). The user may want fresh groceries, milk, tea, bread, fruits, morning skincare, or study supplies.',
  afternoon: 'It is afternoon in India (11 AM–4 PM). The user may want snacks, beverages, tech accessories, stationery, or fashion.',
  evening:   'It is evening in India (4–8 PM). The user may want ethnic wear, beauty products, trending fashion, footwear, or home decor.',
  night:     'It is night in India (8–11 PM). The user may want cozy hoodies, gaming gear, Korean skincare, late-night snacks, or beverages.',
  latenight: 'It is late night / Night Owl mode in India (11 PM–5 AM). The user may want instant food, earbuds, dark-mode vibes, Maggi, Horlicks, or comfort snacks.',
};

/**
 * Get AI-personalised product search keywords for the current time of day.
 * Returns up to 5 category-aware search keywords EasyBuy can use to filter products.
 */
export async function getTimeAwareKeywords(stateName?: string): Promise<string[]> {
  const slot = getCurrentTimeSlot();
  const locationHint = stateName ? ` The user is located in ${stateName}, India.` : ' The user is in India.';

  const reply = await callGroq(
    [
      {
        role: 'system',
        content:
          'You are an AI shopping personalisation engine for EasyBuy, an Indian e-commerce app. ' +
          'Reply ONLY with a valid JSON array of exactly 5 short product search keywords (strings). ' +
          'No markdown, no explanation.',
      },
      {
        role: 'user',
        content:
          TIME_SLOT_CONTEXT[slot] +
          locationHint +
          ' Suggest 5 short product search terms (1–3 words each) that are most relevant for a shopping homepage right now. ' +
          'Example output: ["fresh milk","whole wheat bread","morning serum","green tea","study lamp"]',
      },
    ],
    120
  );

  try {
    const keywords: string[] = JSON.parse(reply);
    if (Array.isArray(keywords) && keywords.every((k) => typeof k === 'string')) {
      return keywords.slice(0, 5);
    }
  } catch {}

  // Deterministic fallback by time slot
  const FALLBACKS: Record<TimeSlot, string[]> = {
    morning:   ['fresh milk', 'bread', 'green tea', 'fruit bowl', 'face wash'],
    afternoon: ['cold drink', 'snacks', 'earbuds', 'cargo pants', 'study lamp'],
    evening:   ['ethnic saree', 'lipstick', 'hoodies', 'sneakers', 'perfume'],
    night:     ['Maggi instant', 'Korean serum', 'gaming headset', 'hoodies', 'makhana'],
    latenight: ['instant noodles', 'Horlicks', 'earbuds', 'dark chocolate', 'cozy socks'],
  };
  return FALLBACKS[slot];
}

// ─── 2. VOICEBUY CART PARSER ────────────────────────────────────────────────

export interface ParsedCartItem {
  name: string;
  quantity: number;
  category: string;
}

/**
 * Parse a spoken shopping request (English/Hindi/Hinglish) into structured cart items.
 * Example input: "2 liter milk, ek packet sattu aur makhana add kar do"
 */
export async function parseVoiceToCart(spokenText: string): Promise<ParsedCartItem[]> {
  const reply = await callGroq(
    [
      {
        role: 'system',
        content:
          'You are a shopping cart parser for an Indian e-commerce app called EasyBuy. ' +
          'The user speaks in English, Hindi, or Hinglish. ' +
          'Extract product names, quantities, and categories from their spoken request. ' +
          'Reply ONLY with a valid JSON array of objects with keys: name (string), quantity (number), category (string). ' +
          'Use these categories: grocery, beauty, fashion, tech, ethnic_wear, kids. ' +
          'No markdown, no explanation.',
      },
      {
        role: 'user',
        content:
          `The user said: "${spokenText}"\n` +
          'Parse this into cart items. Example output: ' +
          '[{"name":"Milk","quantity":2,"category":"grocery"},{"name":"Sattu","quantity":1,"category":"grocery"}]',
      },
    ],
    256
  );

  try {
    const items: ParsedCartItem[] = JSON.parse(reply);
    if (Array.isArray(items)) return items;
  } catch {}

  return [];
}

// ─── 3. AI SHOPPING SUGGESTION & VOICE SEARCH PARSER ───────────────────────

export interface ParsedVoiceSearch {
  cleanQuery: string;
  category?: string;
  maxPrice?: number;
  isQuickBuy?: boolean;
}

/**
 * Parses natural language voice search queries into clean search keywords and filters.
 * e.g. "Mujhe running shoes dikhao 2000 ke andar" -> { cleanQuery: "running shoes", maxPrice: 2000 }
 */
export async function parseVoiceSearchQuery(spokenText: string): Promise<ParsedVoiceSearch> {
  try {
    const reply = await callGroq(
      [
        {
          role: 'system',
          content:
            'You are an Indian e-commerce search query cleaner for EasyBuy. ' +
            'Convert natural language/voice input into clean search keywords and extract filters if present. ' +
            'Reply ONLY with valid JSON: { "cleanQuery": string, "category"?: string, "maxPrice"?: number, "isQuickBuy"?: boolean } ' +
            'No markdown, no explanation.',
        },
        {
          role: 'user',
          content: `User voice search: "${spokenText}"`,
        },
      ],
      150
    );

    const parsed = JSON.parse(reply);
    if (parsed && parsed.cleanQuery) {
      return parsed;
    }
  } catch {}

  // Basic fallback
  const clean = spokenText
    .replace(/(mujhe|dikhao|chahiye|search|show me|find|buy|want|under|below|ke andar)/gi, '')
    .trim();
  return { cleanQuery: clean || spokenText };
}

// ─── 4. AI RECIPE & OCCASION BUNDLER ────────────────────────────────────────

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: string;
  image?: string;
  icon?: string;
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

/**
 * Parses user spoken recipes, dishes, or occasions into a complete ready-to-cook ingredient kit.
 * e.g. "Chai aur pakora banana hai 4 logo ke liye" -> Chai, Milk, Besan, Onion, Oil
 */
export async function generateRecipeOccasionBundle(
  spokenText: string,
  stateName?: string
): Promise<RecipeOccasionBundle | null> {
  const locationHint = stateName ? ` The user is in ${stateName}, India.` : ' The user is in India.';

  try {
    const reply = await callGroq(
      [
        {
          role: 'system',
          content:
            'You are an Indian Quick Commerce Recipe & Grocery Bundler for EasyBuy. ' +
            'Convert dishes, meals, or occasions into exact grocery ingredients available in an Indian supermarket. ' +
            'Reply ONLY with valid JSON with this exact structure: ' +
            '{\n' +
            '  "isRecipe": true,\n' +
            '  "recipeName": "Title of dish or bundle (e.g. Chai & Crispy Onion Pakoras)",\n' +
            '  "emoji": "🍲",\n' +
            '  "tagline": "Short description of the kit",\n' +
            '  "servings": "Serves 2-4",\n' +
            '  "prepTime": "15 mins",\n' +
            '  "steps": ["Step 1 quick instruction", "Step 2", "Step 3"],\n' +
            '  "ingredients": [\n' +
            '    { "id": "ing_1", "name": "Fresh Milk (500ml)", "quantity": "1 pouch", "price": 33, "category": "grocery" },\n' +
            '    { "id": "ing_2", "name": "Chana Besan (500g)", "quantity": "1 pack", "price": 55, "category": "grocery" }\n' +
            '  ]\n' +
            '}\n' +
            'No markdown, no backticks, only pure JSON.',
        },
        {
          role: 'user',
          content: `User wants to make or buy: "${spokenText}".${locationHint} Create a complete ingredient kit.`,
        },
      ],
      400
    );

    const parsed = JSON.parse(reply);
    if (parsed && parsed.recipeName && Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0) {
      const totalPrice = parsed.ingredients.reduce((sum: number, item: any) => sum + (Number(item.price) || 40), 0);
      return {
        ...parsed,
        totalPrice,
      };
    }
  } catch (e) {
    console.log('[GroqAI] Recipe parsing fallback used:', e);
  }

  // Smart Fallback for popular Indian dishes if offline/error
  const q = spokenText.toLowerCase();
  if (q.includes('chai') || q.includes('tea') || q.includes('pakora') || q.includes('pakoda')) {
    return {
      isRecipe: true,
      recipeName: 'Chai & Crispy Onion Pakoras Kit',
      emoji: '🫖',
      tagline: 'Monsoon special evening snacks kit with masala chai and crunchy pakoras',
      servings: 'Serves 3-4',
      prepTime: '15 Mins',
      steps: [
        '1. Thinly slice onions and mix with besan, green chillies & spices.',
        '2. Deep fry spoonfuls in hot mustard oil until golden brown.',
        '3. Brew aromatic ginger chai with fresh milk and serve piping hot!'
      ],
      ingredients: [
        { id: 'chai_1', name: 'Tata Tea Premium Chai Patti (250g)', quantity: '1 pack', price: 95, category: 'grocery', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400' },
        { id: 'chai_2', name: 'Fresh Full Cream Milk (500ml)', quantity: '1 pouch', price: 34, category: 'grocery', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
        { id: 'chai_3', name: 'Fortune Pure Chana Besan (500g)', quantity: '1 pack', price: 58, category: 'grocery', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { id: 'chai_4', name: 'Fresh Red Onions (1kg)', quantity: '1 kg', price: 38, category: 'grocery', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400' },
        { id: 'chai_5', name: 'Fortune Mustard Oil Kachi Ghani (500ml)', quantity: '1 bottle', price: 85, category: 'grocery', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
      ],
      totalPrice: 310,
    };
  }

  if (q.includes('pav') || q.includes('bhaji')) {
    return {
      isRecipe: true,
      recipeName: 'Mumbai Style Butter Pav Bhaji Kit',
      emoji: '🍛',
      tagline: 'Street-style spicy mashed vegetable bhaji with toasted butter pav',
      servings: 'Serves 4',
      prepTime: '20 Mins',
      steps: [
        '1. Boil potatoes & veggies, mash with Pav Bhaji masala & butter.',
        '2. Simmer with tomatoes, onions and red chilli powder.',
        '3. Toast soft pav buns on a tawa with generous butter and coriander.'
      ],
      ingredients: [
        { id: 'pb_1', name: 'Fresh Bakery Pav Buns (Pack of 8)', quantity: '1 pack', price: 40, category: 'grocery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
        { id: 'pb_2', name: 'Amul Butter 100g', quantity: '1 pack', price: 56, category: 'grocery', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400' },
        { id: 'pb_3', name: 'Everest Pav Bhaji Masala (100g)', quantity: '1 box', price: 68, category: 'grocery', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
        { id: 'pb_4', name: 'Fresh Hybrid Tomatoes (500g)', quantity: '500g', price: 25, category: 'grocery', image: 'https://images.unsplash.com/photo-1546470427-227c7369a478?w=400' },
        { id: 'pb_5', name: 'Fresh Potatoes (1kg)', quantity: '1 kg', price: 30, category: 'grocery', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
      ],
      totalPrice: 219,
    };
  }

  return null;
}

/**
 * Ask EasyBuy AI for product recommendations based on a natural language query.
 */
export async function getAISuggestion(query: string, stateName?: string): Promise<string> {
  const locationHint = stateName ? ` The user is in ${stateName}, India.` : ' The user is in India.';

  return callGroq(
    [
      {
        role: 'system',
        content:
          'You are EasyBuy AI, a friendly Indian shopping assistant. ' +
          'Help users find the best products from categories: grocery, beauty, fashion, tech, ethnic wear, kids. ' +
          'Be helpful, concise, and warm. Use Indian context. Max 3 sentences.',
      },
      {
        role: 'user',
        content: query + locationHint,
      },
    ],
    200
  );
}
