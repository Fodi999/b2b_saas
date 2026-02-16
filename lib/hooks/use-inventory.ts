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
    if (!accessToken) {
      console.warn('[reloadInventory] Нет access token');
      return;
    }

    console.log('[reloadInventory] Перезагрузка склада с BACKEND...');
    setLoading(true);

    try {
      const items = await fetchInventory(accessToken);
      console.log('[reloadInventory] Склад перезагружен:', {
        count: items.length,
        items: items.map((i) => ({ name: i.product_name, status: i.status })),
      });
      setItems(items);
    } catch (error) {
      console.error('[reloadInventory] Ошибка перезагрузки:', error);
      throw error; // Пробрасываем дальше
    } finally {
      setLoading(false);
    }
  }, [accessToken, setItems, setLoading]);

  useEffect(() => {
    if (!accessToken) {
      console.log('[useInventory] Нет access token, очищаем склад');
      clear();
      return;
    }

    console.log('[useInventory] Загрузка склада с BACKEND (Query DTO)...');
    setLoading(true);

    fetchInventory(accessToken)
      .then((items) => {
        console.log('[useInventory] Склад загружен С BACKEND:', {
          count: items.length,
          items: items.map((i) => ({ name: i.product_name, status: i.status })),
        });
        setItems(items);
      })
      .catch((error) => {
        console.error('[useInventory] Ошибка загрузки склада:', error);
        // Очищаем при ошибке
        clear();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessToken, setItems, setLoading, clear]); // ✅ Добавляем deps

  return { reloadInventory };
}
