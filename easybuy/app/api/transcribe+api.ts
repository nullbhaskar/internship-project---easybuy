/**
 * EasyBuy — Groq Whisper Audio Transcription Proxy
 * Receives audio as base64, forwards to Groq Whisper API.
 * API key is NEVER exposed to the client / APK.
 */

const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const WHISPER_MODEL = 'whisper-large-v3-turbo'; // Fastest + most accurate

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { audioBase64, mimeType = 'audio/m4a', language = 'en' } = await request.json();

    if (!audioBase64) {
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 to binary
    const binaryStr = atob(audioBase64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: mimeType });

    // Build multipart form for Groq Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.m4a');
    formData.append('model', WHISPER_MODEL);
    formData.append('language', language); // 'en' handles Hinglish well
    formData.append('response_format', 'json');

    const res = await fetch(GROQ_WHISPER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // Do NOT set Content-Type — fetch sets it automatically with boundary for FormData
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Whisper Proxy] Groq error ${res.status}:`, errText);
      return new Response(
        JSON.stringify({ error: `Groq Whisper error ${res.status}: ${errText}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    // data.text contains the transcribed string
    return new Response(
      JSON.stringify({ transcript: data.text || '' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('[Whisper Proxy] Error:', e);
    return new Response(
      JSON.stringify({ error: e?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
