'use client';

import { useEffect, useCallback } from 'react';
import { fetchInventory } from '@/lib/api/inventory';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventoryStore } from '@/lib/stores/inventory-store';

/**
 * Хук для загрузки склада с backend при монтировании компонента
 * Backend использует Query DTO - product данные приходят joined!
 */
export function useInventory() {
  const { accessToken } = useAuthStore();
  const { setItems, setLoading, clear } = useInventoryStore();

  // Функция для перезагрузки инвентаря (используется после добавления/обновления)
  const reloadInventory = useCallback(async () => {
    if (!accessToken) {      return;
    }    setLoading(true);

    try {
      const items = await fetchInventory(accessToken);
      setItems(items);
    } catch (error) {      throw error; // Пробрасываем дальше
    } finally {
      setLoading(false);
    }
  }, [accessToken, setItems, setLoading]);

  useEffect(() => {
    if (!accessToken) {      clear();
      return;
    }

    setLoading(true);

    fetchInventory(accessToken)
      .then((items) => {
        setItems(items);
      })
      .catch((error) => {        // Очищаем при ошибке
        clear();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessToken, setItems, setLoading, clear]); // ✅ Добавляем deps

  return { reloadInventory };
}
