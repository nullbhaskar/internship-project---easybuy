/**
 * EasyBuy — Groq Neural TTS Proxy
 * Converts AI text responses to human-quality audio using Groq PlayAI.
 * API key stays on server — never exposed in the APK.
 *
 * Groq TTS sounds like a real human. No robotic Android TTS.
 */

const GROQ_TTS_URL = 'https://api.groq.com/openai/v1/audio/speech';

// Best voices available in Groq PlayAI
// Selecting "Celeste" (warm, clear, professional female) as default
// Full list: https://console.groq.com/docs/text-speech
export const GROQ_TTS_VOICES = {
  female_warm: 'Celeste-PlayAI',      // Warm, friendly female (best for customer service)
  female_clear: 'Aaliyah-PlayAI',     // Clear, professional female
  male_warm: 'Fritz-PlayAI',          // Friendly, natural male
  male_professional: 'Chip-PlayAI',   // Professional male
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing GROQ_API_KEY on server' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { text, voice = GROQ_TTS_VOICES.female_warm } = await request.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trim text to reasonable length for TTS (Groq TTS max ~4096 chars)
    const trimmedText = text.slice(0, 1000);

    const res = await fetch(GROQ_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'playai-tts',
        input: trimmedText,
        voice,
        response_format: 'mp3', // Compact, plays well on Android
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[TTS Proxy] Groq TTS error ${res.status}:`, errText);
      // Return specific error so client can gracefully fall back to expo-speech
      return new Response(
        JSON.stringify({ error: `TTS error ${res.status}`, details: errText }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get audio binary, convert to base64 to send via JSON
    const audioBuffer = await res.arrayBuffer();
    const bytes = new Uint8Array(audioBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);

    return new Response(
      JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/mpeg' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (e: any) {
    console.error('[TTS Proxy] Error:', e);
    return new Response(
      JSON.stringify({ error: e?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
