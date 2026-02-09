import { apiFetch } from './client';

// Response types
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  tenant_id: string;
}

interface MeResponse {
  user: {
    id: string;
    email: string;
    display_name: string | null;
    language: 'pl' | 'en' | 'ru' | 'uk';
    role: string;
    tenant_id: string;
  };
  tenant: {
    id: string;
    name: string;
  };
}

interface RefreshResponse {
  access_token: string;
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(data: {
  email: string;
  password: string;
  display_name: string;
  restaurant_name: string;
  language: 'pl' | 'en' | 'ru' | 'uk';
}): Promise<AuthResponse> {
  console.log('🔐 [AUTH] Регистрация на BACKEND:', {
    email: data.email,
    restaurant_name: data.restaurant_name,
    backend: 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app',
  });
  
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Логин существующего пользователя
 */
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  console.log('🔐 [AUTH] Логин через BACKEND:', {
    email: data.email,
    backend: 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app',
  });
  
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Обновление access token
 */
export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  console.log('🔄 [AUTH] Обновление токена через BACKEND');
  
  return apiFetch<RefreshResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

/**
 * Получение данных текущего пользователя
 */
export async function fetchMe(accessToken: string): Promise<MeResponse> {
  console.log('👤 [AUTH] Получение данных пользователя с BACKEND');
  
  return apiFetch<MeResponse>('/api/me', {
    method: 'GET',
  }, accessToken);
}
