import { create } from 'zustand';

export interface InventoryItem {
  id: string;
  product_name: string;
  category: string;
  catalog_ingredient_id?: string; // ✅ ID из каталога для рецептов
  quantity: number;
  base_unit: 'g' | 'ml' | 'pcs';
  price: number;
  status: 'in-stock' | 'low' | 'expiring' | 'expired';
  received_at?: string; // ✅ Дата поступления
  expiration_date?: string;
  warnings?: string[];
  image_url?: string | null; // ✅ Добавляем изображение продукта
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;

  setItems: (items: InventoryItem[]) => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  loading: false,

  setItems: (items) => {
    console.log('💾 [INVENTORY_STORE] Сохранение склада:', { count: items.length });
    set({ items });
  },

  addItem: (item) => {
    console.log('➕ [INVENTORY_STORE] Добавление продукта:', item.product_name);
    set((state) => ({ items: [...state.items, item] }));
  },

  updateItem: (id, updates) => {
    console.log('✏️ [INVENTORY_STORE] Обновление продукта:', { id, updates });
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },

  removeItem: (id) => {
    console.log('🗑️ [INVENTORY_STORE] Удаление продукта:', { id });
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  setLoading: (v) => set({ loading: v }),

  clear: () => {
    console.log('🧹 [INVENTORY_STORE] Очистка склада');
    set({ items: [] });
  },
}));
