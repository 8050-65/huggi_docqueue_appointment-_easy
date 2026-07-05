// apps/web/lib/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JwtPayload } from '@huggi/types';
import { apiClient } from './api-client';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: JwtPayload | null;
  setTokens: (access: string, refresh: string, user: JwtPayload) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

function decodeJwt(token: string): JwtPayload {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
  return JSON.parse(json);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh, user) => {
        apiClient.setToken(access);
        set({ accessToken: access, refreshToken: refresh, user });
      },
      logout: async () => {
        const { refreshToken, accessToken } = get();
        try {
          if (refreshToken && accessToken) {
            apiClient.setToken(accessToken);
            await apiClient.post('/auth/logout', { refreshToken });
          }
        } catch {
          // proceed with local logout even if server call fails
        } finally {
          apiClient.clearToken();
          set({ accessToken: null, refreshToken: null, user: null });
        }
      },
      isAuthenticated: () => {
        return get().accessToken !== null;
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          apiClient.setToken(state.accessToken);
        }
      },
    },
  ),
);

// Register 401 auto-refresh callback — uses direct fetch to avoid recursion through apiClient
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

apiClient.setRefreshCallback(async () => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await logout();
      return null;
    }

    const data: { accessToken: string; refreshToken: string } = await res.json();
    const payload = decodeJwt(data.accessToken);
    setTokens(data.accessToken, data.refreshToken, payload);
    return data;
  } catch {
    await logout();
    return null;
  }
});
