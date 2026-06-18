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

// Use flash (stable, available on free tier) first, fall back to 1.0-pro
const MODELS = ['gemini-1.5-flash', 'gemini-1.0-pro'];

async function withFallback<T>(fn: (model: string) => Promise<T>): Promise<T> {
  let lastErr: any;
  for (const model of MODELS) {
    try {
      return await fn(model);
    } catch (err: any) {
      lastErr = err;
      const msg: string = err?.message ?? '';
      // Only retry on quota/rate-limit errors
      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        continue;
      }
      throw err; // non-quota error — propagate immediately
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
