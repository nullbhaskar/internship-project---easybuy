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

// ─── 4. UNIVERSAL CHATGPT-STYLE SHOPPING & RECIPE CONCIERGE ─────────────────

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
  type: 'gift' | 'recipe' | 'outfit' | 'fitness' | 'study' | 'grocery' | 'beauty' | 'general';
  title: string;
  emoji: string;
  chatReply: string;
  tagline: string;
  metaBadge?: string;
  steps?: string[];
  items: UniversalAIItem[];
  totalPrice: number;
}

/**
 * Universal ChatGPT-style AI Shopping Assistant.
 * Handles ANY user prompt (gifts, birthday, outfits, recipes, late night study, gym, skincare, groceries)
 * in natural Hindi, English, and Hinglish!
 */
export async function processUniversalAIShopping(
  userInput: string,
  stateName?: string
): Promise<UniversalAIShoppingResult> {
  const locationHint = stateName ? ` The user is located in ${stateName}, India.` : ' The user is in India.';

  try {
    const reply = await callGroq(
      [
        {
          role: 'system',
          content:
            'You are the intelligent ChatGPT-style AI Shopping Concierge for EasyBuy (an Indian Quick Commerce & E-commerce app).\n' +
            'The user can ask ANYTHING in Hindi, English, or Hinglish (e.g. birthday gifts, recipes, gym diets, college outfits, late night cravings, skincare, groceries).\n' +
            'Always be helpful, warm, and conversational. Give a short 1-2 sentence friendly advice in Hinglish/English, and assemble 3 to 5 realistic matching products from an Indian shopping catalog.\n' +
            'Reply ONLY in valid JSON with this exact structure:\n' +
            '{\n' +
            '  "isAIResult": true,\n' +
            '  "type": "gift" | "recipe" | "outfit" | "fitness" | "study" | "grocery" | "beauty" | "general",\n' +
            '  "title": "Title with emoji (e.g. 🎁 Birthday Celebration Gift Kit / 🫖 Chai & Pakora Kit)",\n' +
            '  "emoji": "🎁",\n' +
            '  "chatReply": "Warm friendly 1-2 sentence ChatGPT reply explaining the suggestion in conversational Hinglish/English.",\n' +
            '  "tagline": "Short sub-headline for the recommendation",\n' +
            '  "metaBadge": "Quick badge like 4 Items • Ready to Order",\n' +
            '  "steps": ["Step 1", "Step 2"] (optional if recipe or styling guide),\n' +
            '  "items": [\n' +
            '    { "id": "ai_1", "name": "Product Name (e.g. Cadbury Celebrations Rich Dry Fruit Box 450g)", "quantity": "1 box", "price": 450, "category": "gift", "reason": "Premium gift pack" }\n' +
            '  ]\n' +
            '}\n' +
            'No markdown, no backticks, ONLY pure valid JSON.',
        },
        {
          role: 'user',
          content: `User query: "${userInput}".${locationHint}`,
        },
      ],
      500
    );

    const parsed = JSON.parse(reply);
    if (parsed && parsed.title && Array.isArray(parsed.items) && parsed.items.length > 0) {
      const totalPrice = parsed.items.reduce((sum: number, it: any) => sum + (Number(it.price) || 149), 0);
      return {
        ...parsed,
        isAIResult: true,
        totalPrice,
      };
    }
  } catch (e) {
    console.log('[GroqAI] Universal AI processing fallback:', e);
  }

  // ─── INSTANT SMART FALLBACKS FOR ANY THEME ───
  const q = userInput.toLowerCase();

  // 1. Birthday & Gifts
  if (q.includes('gift') || q.includes('birthday') || q.includes('party') || q.includes('anniversary') || q.includes('shadi') || q.includes('wedding')) {
    return {
      isAIResult: true,
      type: 'gift',
      title: '🎁 Birthday & Celebration Gift Kit',
      emoji: '🎁',
      chatReply: 'Birthday party ke liye ye top trending gift items best rahenge! Premium dry fruit gift box, wireless earbuds, aur skincare sets hamesha sabko pasand aate hain.',
      tagline: 'Curated for Birthdays, Celebrations & Special Moments',
      metaBadge: '4 Curated Gifts • Ready in 1-Tap',
      items: [
        { id: 'g_1', name: 'Cadbury Celebrations Rich Dry Fruit Gift Hamper (450g)', quantity: '1 box', price: 450, category: 'gift', reason: 'Classic celebration treat', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400' },
        { id: 'g_2', name: 'boAt Airdopes ANC Wireless Earbuds (Gift Edition)', quantity: '1 pc', price: 1299, category: 'tech', reason: 'Top-rated gadget gift', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
        { id: 'g_3', name: 'Minimalist Glow Vitamin C Skincare Serum Gift Kit', quantity: '1 set', price: 599, category: 'beauty', reason: 'Aesthetic luxury self-care', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400' },
        { id: 'g_4', name: 'Royal Jaipuri Keepsake Wooden & Brass Box', quantity: '1 pc', price: 499, category: 'gift', reason: 'Handcrafted keepsake memory', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400' },
      ],
      totalPrice: 2847,
    };
  }

  // 2. Gym & Fitness / High Protein
  if (q.includes('gym') || q.includes('protein') || q.includes('workout') || q.includes('diet') || q.includes('fitness')) {
    return {
      isAIResult: true,
      type: 'fitness',
      title: '💪 High-Protein Gym & Workout Kit',
      emoji: '💪',
      chatReply: 'Aapke workout aur muscle recovery ke liye high protein diet essentials ready hain! Whey protein, peanut butter aur roasted makhana perfect combo hai.',
      tagline: 'Fuel your workout with clean protein & nutrition',
      metaBadge: '4 Fitness Essentials • High Protein',
      items: [
        { id: 'fit_1', name: 'MuscleBlaze Raw Whey Protein 80% (1kg)', quantity: '1 kg', price: 1799, category: 'grocery', reason: '24g pure whey per scoop', image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400' },
        { id: 'fit_2', name: 'Pintola All-Natural Creamy Peanut Butter (1kg)', quantity: '1 jar', price: 399, category: 'grocery', reason: 'Zero sugar, 30g protein', image: 'https://images.unsplash.com/photo-1588710929895-15a09b43aa13?w=400' },
        { id: 'fit_3', name: 'Darbhanga Crispy Roasted Makhana (200g)', quantity: '1 pack', price: 199, category: 'grocery', reason: 'Crunchy low calorie clean snack', image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=400' },
        { id: 'fit_4', name: 'Quaker Whole Grain Rolled Oats (1kg)', quantity: '1 pack', price: 185, category: 'grocery', reason: 'Complex carbs for endurance', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      ],
      totalPrice: 2582,
    };
  }

  // 3. College / Party / Fashion Outfit
  if (q.includes('outfit') || q.includes('pehnu') || q.includes('college') || q.includes('fest') || q.includes('fashion') || q.includes('look')) {
    return {
      isAIResult: true,
      type: 'outfit',
      title: '👕 Casual Streetwear College Fest Look',
      emoji: '👕',
      chatReply: 'College fest ya casual outing ke liye clean minimal streetwear look sabse best lagega! Heavyweight hoodie aur retro sneakers ka combo trendy hai.',
      tagline: 'Effortless street style curated for college & hangouts',
      metaBadge: '3 Style Essentials • Modern Fit',
      items: [
        { id: 'fsh_1', name: 'Heavyweight Vintage Fleece Oversized Hoodie', quantity: '1 pc', price: 1299, category: 'fashion', reason: 'Relaxed urban comfort', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400' },
        { id: 'fsh_2', name: 'Retro Washed Oversized Baggy Denim Pants', quantity: '1 pc', price: 1499, category: 'fashion', reason: 'Trending 90s baggy fit', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400' },
        { id: 'fsh_3', name: 'Chunky Retro Streetwear White Sneakers', quantity: '1 pair', price: 1899, category: 'fashion', reason: 'Classic all-day sneaker', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400' },
      ],
      totalPrice: 4697,
    };
  }

  // 4. Late Night / Study / Exam
  if (q.includes('study') || q.includes('exam') || q.includes('padhai') || q.includes('late night') || q.includes('neend')) {
    return {
      isAIResult: true,
      type: 'study',
      title: '📚 Late Night Exam Study Fuel Kit',
      emoji: '📚',
      chatReply: 'Late night study session ke liye alertness aur energy maintain rakhne ke essentials! Dark chocolate, cold coffee aur green tea aapko focused rakhenge.',
      tagline: 'Stay sharp, focused and energized through the night',
      metaBadge: '4 Study Essentials • High Focus',
      items: [
        { id: 'std_1', name: '85% Artisanal Dark Belgian Chocolate Bar', quantity: '1 bar', price: 199, category: 'grocery', reason: 'Brain power & antioxidants', image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400' },
        { id: 'std_2', name: 'Nescafe Classic Instant Dark Roast Coffee (100g)', quantity: '1 jar', price: 299, category: 'grocery', reason: 'Instant caffeine boost', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400' },
        { id: 'std_3', name: 'Organic Green Tea Bags (Pack of 25)', quantity: '1 box', price: 175, category: 'grocery', reason: 'Calm sustained energy', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },
        { id: 'std_4', name: 'Maggi 2-Minute Masala Instant Noodles (Pack of 4)', quantity: '1 pack', price: 56, category: 'grocery', reason: '2 AM quick study hunger fix', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
      ],
      totalPrice: 729,
    };
  }

  // 5. Chai & Pakora
  if (q.includes('chai') || q.includes('tea') || q.includes('pakora') || q.includes('pakoda')) {
    return {
      isAIResult: true,
      type: 'recipe',
      title: '🫖 Chai & Crispy Onion Pakoras Kit',
      emoji: '🫖',
      chatReply: 'Monsoon special evening snacks! Kadak masala chai aur crispy besan pyaaz pakode ka poora ready-to-cook kit yahan hai.',
      tagline: 'Evening comfort snacks kit with ginger chai & hot pakoras',
      metaBadge: 'Serves 4 • 15 Mins Quick Cook',
      steps: [
        '1. Thinly slice onions and mix with besan, green chillies & spices.',
        '2. Deep fry spoonfuls in hot mustard oil until golden brown.',
        '3. Brew aromatic ginger chai with fresh milk and serve piping hot!'
      ],
      items: [
        { id: 'chai_1', name: 'Tata Tea Premium Chai Patti (250g)', quantity: '1 pack', price: 95, category: 'grocery', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400' },
        { id: 'chai_2', name: 'Fresh Full Cream Milk (500ml)', quantity: '1 pouch', price: 34, category: 'grocery', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
        { id: 'chai_3', name: 'Fortune Pure Chana Besan (500g)', quantity: '1 pack', price: 58, category: 'grocery', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { id: 'chai_4', name: 'Fresh Red Onions (1kg)', quantity: '1 kg', price: 38, category: 'grocery', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400' },
        { id: 'chai_5', name: 'Fortune Mustard Oil Kachi Ghani (500ml)', quantity: '1 bottle', price: 85, category: 'grocery', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
      ],
      totalPrice: 310,
    };
  }

  // 6. Maggi / Noodles
  if (q.includes('maggi') || q.includes('maggie') || q.includes('noodle')) {
    return {
      isAIResult: true,
      type: 'recipe',
      title: '🍜 2-Minute Cheesy Maggi Feast Kit',
      emoji: '🍜',
      chatReply: 'Instant 2-minute cheesy Maggi craving! Butter, cheese slice aur mixed veggies ke sath banayein cafe style Maggi.',
      tagline: 'Midnight craving instant noodles with butter & cheese',
      metaBadge: 'Serves 2 • 5 Mins',
      steps: [
        '1. Boil 1.5 cups of water in a pan.',
        '2. Add Maggi tastemaker, butter and break in the noodle cake.',
        '3. Cook for 2 mins, top with cheese slices and serve hot!'
      ],
      items: [
        { id: 'mg_1', name: 'Maggi 2-Minute Masala Noodles (Pack of 4)', quantity: '1 pack', price: 56, category: 'grocery', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400' },
        { id: 'mg_2', name: 'Amul Butter (100g)', quantity: '1 pack', price: 56, category: 'grocery', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400' },
        { id: 'mg_3', name: 'Amul Processed Cheese Slices (100g)', quantity: '1 pack', price: 78, category: 'grocery', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400' },
      ],
      totalPrice: 190,
    };
  }

  // Default Universal Friendly Response
  return {
    isAIResult: true,
    type: 'general',
    title: `✨ EasyBuy AI Recommendations for "${userInput.slice(0, 25)}"`,
    emoji: '✨',
    chatReply: `Aapke request ke mutabiq EasyBuy se ye top items sabse best aur high-rated hain. Aap inhein 1-tap mein direct cart mein add kar sakte hain!`,
    tagline: 'Handpicked products matching your conversation',
    metaBadge: 'Instant 10-Min Delivery',
    items: [
      { id: 'gen_1', name: 'Fresh Full Cream Milk (500ml)', quantity: '1 pouch', price: 34, category: 'grocery', reason: 'Fresh daily essential', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
      { id: 'gen_2', name: 'Darbhanga Crispy Roasted Makhana (200g)', quantity: '1 pack', price: 199, category: 'grocery', reason: 'Healthy roasted snack', image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337cc?w=400' },
      { id: 'gen_3', name: 'boAt Airdopes ANC Wireless Earbuds', quantity: '1 pc', price: 1299, category: 'tech', reason: 'Top-rated wireless earbuds', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400' },
    ],
    totalPrice: 1532,
  };
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

// Backward compatibility alias
export const generateRecipeOccasionBundle = async (spokenText: string, stateName?: string): Promise<RecipeOccasionBundle> => {
  const res = await processUniversalAIShopping(spokenText, stateName);
  return {
    isRecipe: true,
    recipeName: res.title,
    emoji: res.emoji,
    tagline: res.tagline,
    servings: res.metaBadge || 'Serves 2-4',
    prepTime: '15 Mins',
    steps: res.steps || ['1. Review ingredients and click Add to Cart to order.'],
    ingredients: res.items.map((it: UniversalAIItem) => ({
      id: it.id,
      name: it.name,
      quantity: it.quantity || '1 pack',
      price: it.price,
      category: it.category,
      image: it.image
    })),
    totalPrice: res.totalPrice,
  };
};

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
