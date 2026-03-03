import { create } from 'zustand';
import type { InventoryProduct } from '@/lib/api/inventory';

// Re-export for consumers
export type InventoryItem = InventoryProduct;

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;

  setItems: (items: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  clear: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  loading: false,
  error: null,

  setItems: (items) => set({ items: Array.isArray(items) ? items : [], error: null }),

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
  clear: () => set({ items: [], error: null }),
}));
