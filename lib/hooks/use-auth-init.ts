'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { refreshToken, fetchMe } from '@/lib/api/auth';

/**
 * Хук для восстановления сессии при загрузке приложения
 * Использовать один раз в root layout
 */
export function useAuthInit() {
  const { accessToken, setSession, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 🧪 ТЕСТ: Сначала проверяем localStorage как fallback
    const storedAccessToken = localStorage.getItem('access_token');
    
    // Если есть accessToken в store ИЛИ в localStorage - ничего не делаем
    if (accessToken) {
      console.log('✅ [AUTH_INIT] Access token уже есть в Zustand store');
      // Используем setTimeout или Promise для асинхронного обновления state, чтобы избежать warnings
      setTimeout(() => setIsInitialized(true), 0);
      return;
    }
    
    if (storedAccessToken) {
      console.log('🧪 [AUTH_INIT] Найден access_token в localStorage, восстанавливаем...');
      // Попробуем получить данные пользователя с этим токеном
      fetchMe(storedAccessToken)
        .then((me) => {
          console.log('✅ [AUTH_INIT] Токен из localStorage валиден, восстанавливаем сессию');
          const storedRefreshToken = localStorage.getItem('refresh_token') || '';
          setSession({
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
            user: me.user,
            tenant: me.tenant,
          });
        })
        .catch(() => {
          console.log('[AUTH_INIT] Токен из localStorage невалиден, пробуем refresh...');
          // Если access_token невалиден, пробуем refresh
          tryRefreshToken();
        })
        .finally(() => {
          setIsInitialized(true);
        });
      return;
    }

    // Проверяем refresh token в localStorage
    tryRefreshToken();

    function tryRefreshToken() {
      const storedRefreshToken = localStorage.getItem('refresh_token');

      if (!storedRefreshToken) {
        console.log('[AUTH_INIT] Refresh token не найден в localStorage');
        setTimeout(() => setIsInitialized(true), 0);
        return;
      }

      console.log('[AUTH_INIT] Найден refresh token, восстанавливаем сессию через BACKEND...');

      // Пытаемся обновить токен и восстановить сессию
      refreshToken(storedRefreshToken)
        .then((res) => {
          console.log('[AUTH_INIT] Access token обновлён с BACKEND');
          
          return fetchMe(res.access_token).then((me) => {
            console.log('✅ [AUTH_INIT] Данные пользователя получены с BACKEND:', {
              user: me.user.email,
              tenant: me.tenant.name,
            });
            setSession({
              accessToken: res.access_token,
              refreshToken: storedRefreshToken,
              user: me.user,
              tenant: me.tenant,
            });
            console.log('✅ [AUTH_INIT] Сессия восстановлена!');
          });
        })
        .catch(() => {
          console.error('❌ [AUTH_INIT] Не удалось восстановить сессию');
          console.error('❌ [AUTH_INIT] Удаляем невалидный refresh token');
          logout();
        })
        .finally(() => {
          setIsInitialized(true);
        });
    }
  }, [accessToken, setSession, logout]); // Добавляем зависимости

  return { isInitialized };
}
