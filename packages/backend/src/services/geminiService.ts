import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'your-gemini-api-key-here') {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    _client = new GoogleGenerativeAI(key);
  }
  return _client;
}

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Model priority list — from docs.google.dev (June 2025):
 *   gemini-2.5-flash  → stable, free tier, best price-performance
 *   gemini-2.5-flash-lite → stable, fastest/cheapest in 2.5 family
 *   gemini-1.5-flash  → stable fallback (still available)
 *
 * Retries on: 429 quota, 500 server error, 404 model-not-found (skip to next)
 */
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

function isRetryable(msg: string): boolean {
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('500') ||
    msg.includes('503') ||
    msg.includes('not found') ||   // 404 model not available
    msg.includes('404')
  );
}

async function withFallback<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastErr: any;
  for (const model of MODELS) {
    try {
      return await fn(model);
    } catch (err: any) {
      lastErr = err;
      const msg: string = (err?.message ?? '').toLowerCase();
      if (isRetryable(msg)) {
        continue; // try next model
      }
      throw err; // non-retryable error (bad API key, auth, etc) — propagate
    }
  }
  throw lastErr;
}

export async function geminiChat(
  systemPrompt: string,
  history: { role: 'user' | 'model'; text: string }[],
  userMessage: string
): Promise<string> {
  return withFallback(async (modelName) => {
    const model = getClient().getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      safetySettings: SAFETY,
    });
    const chat = model.startChat({
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  });
}

export async function geminiGenerate(prompt: string): Promise<string> {
  return withFallback(async (modelName) => {
    const model = getClient().getGenerativeModel({
      model: modelName,
      safetySettings: SAFETY,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}
