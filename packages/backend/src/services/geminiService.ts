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

export async function geminiChat(systemPrompt: string, history: { role: 'user' | 'model'; text: string }[], userMessage: string): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
    safetySettings: SAFETY,
  });

  const chat = model.startChat({
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function geminiGenerate(prompt: string): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings: SAFETY,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
