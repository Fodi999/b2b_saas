// Каталог продуктов (system-owned)
// В продакшене это будет API + база данных

export type BaseUnit = 'g' | 'ml' | 'pcs';

export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  baseUnit: BaseUnit;
  shelfLifeDays: number;
};

// Mock каталог - нормализованные продукты
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // Молочные продукты
  { id: 'dairy-001', name: 'Сливки 30%', category: 'dairy', baseUnit: 'ml', shelfLifeDays: 5 },
  { id: 'dairy-002', name: 'Сливки 36%', category: 'dairy', baseUnit: 'ml', shelfLifeDays: 5 },
  { id: 'dairy-003', name: 'Сливочное масло', category: 'dairy', baseUnit: 'g', shelfLifeDays: 14 },
  { id: 'dairy-004', name: 'Сливочный сыр', category: 'dairy', baseUnit: 'g', shelfLifeDays: 14 },
  { id: 'dairy-005', name: 'Молоко 3.2%', category: 'dairy', baseUnit: 'ml', shelfLifeDays: 5 },
  { id: 'dairy-006', name: 'Пармезан', category: 'dairy', baseUnit: 'g', shelfLifeDays: 30 },
  { id: 'dairy-007', name: 'Моцарелла', category: 'dairy', baseUnit: 'g', shelfLifeDays: 7 },
  
  // Мясо и птица
  { id: 'meat-001', name: 'Бекон', category: 'meat', baseUnit: 'g', shelfLifeDays: 7 },
  { id: 'meat-002', name: 'Куриное филе', category: 'meat', baseUnit: 'g', shelfLifeDays: 2 },
  { id: 'meat-003', name: 'Говядина (вырезка)', category: 'meat', baseUnit: 'g', shelfLifeDays: 3 },
  { id: 'meat-004', name: 'Свинина (шейка)', category: 'meat', baseUnit: 'g', shelfLifeDays: 3 },
  { id: 'meat-005', name: 'Индейка (филе)', category: 'meat', baseUnit: 'g', shelfLifeDays: 2 },
  
  // Морепродукты
  { id: 'seafood-001', name: 'Лосось (стейк)', category: 'seafood', baseUnit: 'g', shelfLifeDays: 2 },
  { id: 'seafood-002', name: 'Креветки', category: 'seafood', baseUnit: 'g', shelfLifeDays: 2 },
  { id: 'seafood-003', name: 'Мидии', category: 'seafood', baseUnit: 'g', shelfLifeDays: 1 },
  
  // Овощи
  { id: 'veg-001', name: 'Помидоры', category: 'vegetables', baseUnit: 'g', shelfLifeDays: 5 },
  { id: 'veg-002', name: 'Огурцы', category: 'vegetables', baseUnit: 'g', shelfLifeDays: 7 },
  { id: 'veg-003', name: 'Салат Айсберг', category: 'vegetables', baseUnit: 'g', shelfLifeDays: 3 },
  { id: 'veg-004', name: 'Лук репчатый', category: 'vegetables', baseUnit: 'g', shelfLifeDays: 30 },
  { id: 'veg-005', name: 'Чеснок', category: 'vegetables', baseUnit: 'g', shelfLifeDays: 30 },
  { id: 'veg-006', name: 'Перец болгарский', category: 'vegetables', baseUnit: 'g', shelfLifeDays: 7 },
  
  // Зелень
  { id: 'herbs-001', name: 'Базилик', category: 'herbs', baseUnit: 'g', shelfLifeDays: 3 },
  { id: 'herbs-002', name: 'Петрушка', category: 'herbs', baseUnit: 'g', shelfLifeDays: 5 },
  { id: 'herbs-003', name: 'Укроп', category: 'herbs', baseUnit: 'g', shelfLifeDays: 5 },
  { id: 'herbs-004', name: 'Кинза', category: 'herbs', baseUnit: 'g', shelfLifeDays: 5 },
  
  // Бакалея
  { id: 'grocery-001', name: 'Мука пшеничная', category: 'grocery', baseUnit: 'g', shelfLifeDays: 180 },
  { id: 'grocery-002', name: 'Сахар', category: 'grocery', baseUnit: 'g', shelfLifeDays: 365 },
  { id: 'grocery-003', name: 'Соль', category: 'grocery', baseUnit: 'g', shelfLifeDays: 365 },
  { id: 'grocery-004', name: 'Рис', category: 'grocery', baseUnit: 'g', shelfLifeDays: 180 },
  { id: 'grocery-005', name: 'Паста (спагетти)', category: 'grocery', baseUnit: 'g', shelfLifeDays: 180 },
  { id: 'grocery-006', name: 'Оливковое масло', category: 'grocery', baseUnit: 'ml', shelfLifeDays: 365 },
  
  // Яйца
  { id: 'eggs-001', name: 'Яйца куриные', category: 'eggs', baseUnit: 'pcs', shelfLifeDays: 21 },
];

// Функция поиска по каталогу (как autocomplete)
export function searchCatalog(query: string): CatalogProduct[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return CATALOG_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 8); // Максимум 8 результатов
}

// Категории для фильтрации (опционально)
export const CATEGORIES = {
  dairy: { name: 'Молочные продукты', icon: '🥛' },
  meat: { name: 'Мясо и птица', icon: '🥩' },
  seafood: { name: 'Морепродукты', icon: '🐟' },
  vegetables: { name: 'Овощи', icon: '🥬' },
  herbs: { name: 'Зелень', icon: '🌿' },
  grocery: { name: 'Бакалея', icon: '🌾' },
  eggs: { name: 'Яйца', icon: '🥚' },
};

// Единицы измерения (для UI)
export const UNIT_LABELS: Record<BaseUnit, string> = {
  g: 'г',
  ml: 'мл',
  pcs: 'шт',
};
