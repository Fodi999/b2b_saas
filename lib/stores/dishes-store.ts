import { create } from 'zustand';
import {
  getDishes,
  createDish as createDishAPI,
  deleteDish as deleteDishAPI,
  recalculateAllDishes as recalcAPI,
  type DishDTO,
  type CreateDishPayload,
} from '@/lib/api/dishes';
import type { Paginated } from '@/lib/schemas/dto';
import { ApiError } from '@/lib/api/client';

// Re-export for backward compatibility
export type { DishDTO as Dish };

interface DishesState {
  dishes: DishDTO[];
  total: number;
  loading: boolean;
  error: string | null;

  fetchDishes: (accessToken: string) => Promise<void>;
  addDish: (payload: CreateDishPayload, accessToken: string) => Promise<DishDTO>;
  removeDish: (id: string, accessToken: string) => Promise<void>;
  recalculateAll: (accessToken: string) => Promise<void>;
  getDish: (id: string) => DishDTO | undefined;
  clear: () => void;
}

export const useDishesStore = create<DishesState>((set, get) => ({
  dishes: [],
  total: 0,
  loading: false,
  error: null,

  fetchDishes: async (accessToken) => {
    set({ loading: true, error: null });
    try {
      const data: Paginated<DishDTO> = await getDishes(accessToken);
      set({ dishes: data.items, total: data.total, loading: false });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to fetch dishes';
      set({ error: msg, loading: false });
    }
  },

  addDish: async (payload, accessToken) => {
    const dish = await createDishAPI(payload, accessToken);
    set((s) => ({ dishes: [dish, ...s.dishes], total: s.total + 1 }));
    return dish;
  },

  removeDish: async (id, accessToken) => {
    await deleteDishAPI(id, accessToken);
    set((s) => ({
      dishes: s.dishes.filter((d) => d.id !== id),
      total: Math.max(0, s.total - 1),
    }));
  },

  recalculateAll: async (accessToken) => {
    await recalcAPI(accessToken);
    // Re-fetch to get updated costs
    await get().fetchDishes(accessToken);
  },

  getDish: (id) => get().dishes.find((d) => d.id === id),

  clear: () => set({ dishes: [], total: 0, error: null }),
}));
