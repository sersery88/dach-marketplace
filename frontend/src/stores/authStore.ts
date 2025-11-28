import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { api, endpoints } from '@/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: 'ch' | 'de' | 'at';
  role: 'client' | 'expert';
}

// Backend returns wrapped response: { success: true, data: AuthResponse }
interface ApiAuthResponse {
  success: boolean;
  data: AuthResponse;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<ApiAuthResponse>(endpoints.auth.login, {
            email,
            password,
          });
          const { data } = response;
          api.setToken(data.accessToken);
          // Store refresh token for token refresh flow
          localStorage.setItem('refresh_token', data.refreshToken);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<ApiAuthResponse>(endpoints.auth.register, {
            email: data.email,
            password: data.password,
            firstName: data.firstName,  // Backend now expects camelCase
            lastName: data.lastName,
            country: data.country,
            role: data.role,
          });
          const { data: authData } = response;
          api.setToken(authData.accessToken);
          localStorage.setItem('refresh_token', authData.refreshToken);
          set({
            user: authData.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post(endpoints.auth.logout);
        } catch {
          // Ignore logout errors
        } finally {
          api.setToken(null);
          localStorage.removeItem('refresh_token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          // Backend returns { success: true, data: UserPublicProfile }
          const response = await api.get<{ success: boolean; data: User }>(endpoints.auth.me);
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          api.setToken(null);
          localStorage.removeItem('refresh_token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

