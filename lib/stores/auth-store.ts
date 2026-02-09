import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
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

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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
    
    localStorage.setItem('refresh_token', refreshToken);

    set({
      accessToken,
      refreshToken,
      user,
      tenant,
    });
  },

  logout: () => {
    console.log('🚪 [STORE] Выход из системы, очистка localStorage и state');
    
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
    });
  },
}));
