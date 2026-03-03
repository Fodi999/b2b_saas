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
    if (accessToken) {      // Используем setTimeout или Promise для асинхронного обновления state, чтобы избежать warnings
      setTimeout(() => setIsInitialized(true), 0);
      return;
    }
    
    if (storedAccessToken) {      // Попробуем получить данные пользователя с этим токеном
      fetchMe(storedAccessToken)
        .then((me) => {          
          // ВАЖНО: берем актульный accessToken из стора, на случай если fetchMe вызвал тихий рефреш
          const latestAccessToken = useAuthStore.getState().accessToken || storedAccessToken;
          const storedRefreshToken = localStorage.getItem('refresh_token') || '';
          
          setSession({
            accessToken: latestAccessToken,
            refreshToken: storedRefreshToken,
            user: me.user,
            tenant: me.tenant,
          });
        })
        .catch((err) => {
          // Если apiFetch тихим рефрешем не спас ситуацию, пробуем последний шанс — принудительно через refresh token          tryRefreshToken();
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

      if (!storedRefreshToken) {        setTimeout(() => setIsInitialized(true), 0);
        return;
      }
      // Пытаемся обновить токен и восстановить сессию
      refreshToken(storedRefreshToken)
        .then((res) => {          
          return fetchMe(res.access_token).then((me) => {            setSession({
              accessToken: res.access_token,
              refreshToken: storedRefreshToken,
              user: me.user,
              tenant: me.tenant,
            });          });
        })
        .catch(() => {          logout();
        })
        .finally(() => {
          setIsInitialized(true);
        });
    }
  }, [accessToken, setSession, logout]); // Добавляем зависимости

  return { isInitialized };
}
