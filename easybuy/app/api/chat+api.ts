// Server-side API Route for Groq AI Proxy
// Runs only in node environment. API key is read from server environment.

const GROQ_MODEL = 'openai/gpt-oss-120b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { messages, maxTokens } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error('[API Proxy] Error: GROQ_API_KEY is not defined on the server environment.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing API key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: maxTokens || 512,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[API Proxy] Groq API returned error status ${res.status}:`, errText);
      return new Response(
        JSON.stringify({ error: `Groq API error ${res.status}: ${errText}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('[API Proxy] Request execution error:', e);
    return new Response(
      JSON.stringify({ error: e?.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
