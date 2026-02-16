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
    owner_name: data.display_name,
    backend: 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app',
  });
  
  // Backend ожидает owner_name вместо display_name
  const payload = {
    email: data.email,
    password: data.password,
    owner_name: data.display_name,
    restaurant_name: data.restaurant_name,
    language: data.language,
  };
  
  const result = await apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  if (!result) {
    throw new Error('Empty response from server');
  }
  
  return result;
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
  
  const result = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!result) {
    throw new Error('Empty response from server');
  }
  
  return result;
}

/**
 * Обновление access token
 */
export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  console.log('[AUTH] Обновление токена через BACKEND');
  
  const result = await apiFetch<RefreshResponse>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  
  if (!result) {
    throw new Error('Empty response from server');
  }
  
  return result;
}

/**
 * Получение данных текущего пользователя
 */
export async function fetchMe(accessToken: string): Promise<MeResponse> {
  console.log('👤 [AUTH] Получение данных пользователя с BACKEND');
  
  const result = await apiFetch<MeResponse>('/api/me', {
    method: 'GET',
  }, accessToken);
  
  if (!result) {
    throw new Error('Empty response from server');
  }
  
  return result;
}

/**
 * Обновление языка пользователя
 */
export async function updateUserLanguage(
  language: 'pl' | 'en' | 'ru' | 'uk',
  accessToken: string
): Promise<MeResponse> {
  console.log('🌐 [AUTH] Обновление языка пользователя:', language);
  
  const result = await apiFetch<MeResponse>('/api/me', {
    method: 'PATCH',
    body: JSON.stringify({ language }),
  }, accessToken);
  
  if (!result) {
    throw new Error('Empty response from server');
  }
  
  return result;
}
