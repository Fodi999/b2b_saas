'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { refreshToken, fetchMe } from '@/lib/api/auth';

/**
 * Хук для восстановления сессии при загрузке приложения
 * Использовать один раз в root layout
 */
export function useAuthInit() {
  const { accessToken, refreshToken: rt, setSession, logout } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Если уже есть accessToken - ничего не делаем
    if (accessToken) {
      console.log('✅ [AUTH_INIT] Access token уже есть, восстановление не требуется');
      setIsInitialized(true);
      return;
    }

    // Проверяем localStorage
    const storedRefreshToken = localStorage.getItem('refresh_token');

    if (!storedRefreshToken) {
      console.log('ℹ️ [AUTH_INIT] Refresh token не найден в localStorage');
      setIsInitialized(true);
      return;
    }

    console.log('🔄 [AUTH_INIT] Найден refresh token, восстанавливаем сессию через BACKEND...');

    // Пытаемся обновить токен и восстановить сессию
    refreshToken(storedRefreshToken)
      .then((res) => {
        console.log('✅ [AUTH_INIT] Access token обновлён с BACKEND');
        return fetchMe(res.access_token).then((me) => {
          console.log('✅ [AUTH_INIT] Данные пользователя получены с BACKEND:', {
            user: me.user,
            tenant: me.tenant,
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
      .catch((error) => {
        console.error('❌ [AUTH_INIT] Не удалось восстановить сессию:', error);
        logout();
      })
      .finally(() => {
        setIsInitialized(true);
      });
  }, []);

  return { isInitialized };
}
