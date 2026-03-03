import { create } from 'zustand';
import { refreshToken as refreshTokenAPI } from '@/lib/api/auth';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  language: 'pl' | 'en' | 'ru' | 'uk';
  role: string;
  tenant_id: string;
}

export interface Tenant {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;

  setSession: (data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    tenant: Tenant;
  }) => void;

  updateUser: (userData: Partial<User>) => void;

  refreshAccessToken: () => Promise<boolean>;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  accessToken: null,
  refreshToken: null,

  setSession: ({ accessToken, refreshToken, user, tenant }) => {
    // Сохраняем токены для восстановления сессии
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('access_token', accessToken);
    
    // Также обновляем cookie для middleware
    if (typeof document !== 'undefined') {
      document.cookie = `access_token=${accessToken}; path=/; max-age=3600; SameSite=Lax`;
    }

    set({
      accessToken,
      refreshToken,
      user,
      tenant,
    });
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData }
      });
    }
  },

  refreshAccessToken: async () => {
    const state = get();
    // 🔍 ТЕСТ: Пробуем найти refresh token в стейте, если нет - в localStorage (для этапа инициализации)
    const canUseLocalStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    const currentRefreshToken = state.refreshToken || (canUseLocalStorage ? localStorage.getItem('refresh_token') : null);
    
    if (!currentRefreshToken) {
      return false;
    }

    try {
      const response = await refreshTokenAPI(currentRefreshToken);
      
      set({ accessToken: response.access_token });
      
      // ✅ Сохраняем новый токен в localStorage для восстановления сессии
      if (canUseLocalStorage) {
        localStorage.setItem('access_token', response.access_token);
      }
      
      // ✅ Обновляем cookie для middleware
      if (typeof document !== 'undefined') {
        document.cookie = `access_token=${response.access_token}; path=/; max-age=3600; SameSite=Lax`;
      }
      
      return true;
    } catch (error) {
      // Если обновление не удалось - разлогиниваем
      get().logout();
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token');
    }
    
    // Очищаем cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    set({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
    });
  },
}));
