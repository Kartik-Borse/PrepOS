import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  college?: string;
  totalXp: number;
  currentStreak: number;
  currentLevel: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, college?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await api.login(email, password);
          localStorage.setItem('token', token);
          set({ token, user: mapUser(user), isLoading: false });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Login failed' });
          throw err;
        }
      },

      register: async (email, password, fullName, college) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await api.register(email, password, fullName, college);
          localStorage.setItem('token', token);
          set({ token, user: mapUser(user), isLoading: false });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Registration failed' });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, error: null });
      },

      fetchMe: async () => {
        if (!get().token) return;
        try {
          const { user } = await api.me();
          set({ user: mapUser(user) });
        } catch {
          // Token expired or invalid — log out
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
      updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
    }),
    {
      name: 'auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

function mapUser(u: any): AuthUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName ?? u.full_name,
    college: u.college,
    totalXp: u.totalXp ?? u.total_xp ?? 0,
    currentStreak: u.currentStreak ?? u.current_streak ?? 0,
    currentLevel: u.currentLevel ?? u.current_level ?? 1,
  };
}
