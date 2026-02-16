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
    console.log('💾 [STORE] Сохранение сессии:', {
      user_id: user.id,
      user_email: user.email,
      tenant_id: tenant.id,
      tenant_name: tenant.name,
    });
    
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
    const currentRefreshToken = state.refreshToken;
    
    if (!currentRefreshToken) {
      console.error('[STORE] Нет refresh token для обновления');
      return false;
    }

    try {
      console.log('[STORE] Обновление access token...');
      const response = await refreshTokenAPI(currentRefreshToken);
      
      console.log('[STORE] Access token обновлён');
      set({ accessToken: response.access_token });
      return true;
    } catch (error) {
      console.error('[STORE] Не удалось обновить access token:', error);
      
      // Если обновление не удалось - разлогиниваем
      get().logout();
      return false;
    }
  },

  logout: () => {
    console.log('🚪 [STORE] Выход из системы, очистка localStorage, cookies и state');
    
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    
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
