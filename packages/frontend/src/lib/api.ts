/**
 * API client — wraps fetch with auth token injection and base URL.
 * In dev:  empty string → Vite proxy (/api/* → localhost:5000)
 * In prod: hardcoded backend URL (no env var required)
 */

// In development the Vite proxy handles /api/* so BASE_URL stays empty.
// In production we point directly at the deployed backend.
const BASE_URL = import.meta.env.DEV
  ? ''
  : 'https://prep-os-backend.vercel.app';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Collapse any accidental double-slashes (e.g. BASE_URL ends with "/" and path starts with "/")
  // but leave the protocol "https://" untouched.
  const url = `${BASE_URL}${path}`.replace(/([^:])\/\/+/g, '$1/');
  const res = await fetch(url, { ...options, headers });
  
  let data: any;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    data = { message: text };
  }

  if (!res.ok) {
    const message = data?.error?.message || data?.message || 'Request failed';
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, fullName: string, college?: string) =>
    request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, college }),
    }),

  me: () => request<{ user: any }>('/api/users/me'),

  updateProfile: (data: Record<string, any>) =>
    request<{ user: any }>('/api/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Problems
  getProblems: (patternId?: number) =>
    request<{ problems: any[] }>(`/api/problems${patternId ? `?patternId=${patternId}` : ''}`),

  getProblem: (slug: string) => request<{ problem: any }>(`/api/problems/${slug}`),

  getPatterns: () => request<{ patterns: any[] }>('/api/problems/patterns'),

  // Progress
  getProgress: () => request<{ progress: any[] }>('/api/problems/user/progress'),

  markProgress: (problemId: number, status: string, selfRating?: number) =>
    request<{ success: boolean }>('/api/problems/user/progress', {
      method: 'POST',
      body: JSON.stringify({ problemId, status, selfRating }),
    }),

  // Leaderboard
  getLeaderboard: (college?: string) =>
    request<{ users: any[] }>(`/api/users/leaderboard${college ? `?college=${encodeURIComponent(college)}` : ''}`),

  // Health
  health: () => request<any>('/health'),

  // LeetCode import
  fetchLeetcode: (url: string) =>
    request<{ problem: any }>('/api/leetcode/fetch', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  // AI — Gemini powered
  interviewChat: (mode: string, history: { role: string; text: string }[], message: string) =>
    request<{ reply: string }>('/api/ai/interview/chat', {
      method: 'POST',
      body: JSON.stringify({ mode, history, message }),
    }),

  generateStudyPlan: (opts: { targetDate?: string; hoursPerDay?: number; skillLevel?: string; targetCompanies?: string[]; weakPatterns?: string[] }) =>
    request<{ plan: any; daysLeft: number }>('/api/ai/study-plan', {
      method: 'POST',
      body: JSON.stringify(opts),
    }),

  getHint: (problemTitle: string, hintLevel: number, description?: string, userCode?: string) =>
    request<{ hint: string }>('/api/ai/hint', {
      method: 'POST',
      body: JSON.stringify({ problemTitle, hintLevel, description, userCode }),
    }),

  reviewCode: (problemTitle: string, code: string, language: string, passed: boolean) =>
    request<{ review: string }>('/api/ai/review', {
      method: 'POST',
      body: JSON.stringify({ problemTitle, code, language, passed }),
    }),

  explainConcept: (concept: string, context?: string) =>
    request<{ explanation: string }>('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ concept, context }),
    }),

  generateCheatsheet: (topic: string, type: string, language?: string) =>
    request<{ cheatsheet: any }>('/api/ai/cheatsheet', {
      method: 'POST',
      body: JSON.stringify({ topic, type, language }),
    }),
};
