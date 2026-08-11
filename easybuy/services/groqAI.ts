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

// ─── 3. AI SHOPPING SUGGESTION ──────────────────────────────────────────────

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
