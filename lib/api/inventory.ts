import { apiFetch } from './client';

interface CategoryEmbedded {
  id: string;
  name: string;
}

interface ProductEmbedded {
  id: string;
  name: string;
  category: CategoryEmbedded | string; // ✅ Поддержка обоих форматов (объект или строка)
  base_unit: 'kilogram' | 'liter' | 'piece';
  image_url?: string | null;
}

interface InventoryProductQueryDTO {
  id: string;
  product: ProductEmbedded;
  quantity: number;
  price_per_unit_cents: number;
  received_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogIngredientDTO {
  id: string;
  category_id: string;
  category?: CategoryEmbedded; // ✅ Категория из каталога (опционально)
  name: string;
  default_unit: 'kilogram' | 'liter' | 'piece';
  default_shelf_life_days: number;
  allergens: string[];
  calories_per_100g: number;
  seasons: string[];
  image_url: string | null;
}

export interface InventoryProduct {
  id: string;
  product_name: string;
  category: string;           // ✅ Название категории для отображения
  category_id?: string;       // ✅ ID категории (если нужен)
  catalog_ingredient_id?: string; // ✅ ID из каталога для создания рецептов
  quantity: number;
  base_unit: 'g' | 'ml' | 'pcs';
  price: number;
  status: 'in-stock' | 'low' | 'expiring' | 'expired';
  received_at?: string;
  expiration_date?: string;
  warnings?: string[];
  image_url?: string | null;
}

export interface AddInventoryProductRequest {
  catalog_ingredient_id: string;
  quantity: number;
  price_per_unit_cents: number;
  received_at?: string; // ✅ Дата поступления (optional, default = NOW())
  expires_at?: string;  // ✅ Срок годности (optional, backend рассчитает сам)
}

function convertUnit(backendUnit: 'kilogram' | 'liter' | 'piece'): 'g' | 'ml' | 'pcs' {
  if (backendUnit === 'kilogram') return 'g';
  if (backendUnit === 'liter') return 'ml';
  return 'pcs';
}

function calculateStatus(
  expiresAt: string | null,
  quantity: number
): { status: 'in-stock' | 'low' | 'expiring' | 'expired'; warnings: string[] } {
  const warnings: string[] = [];
  let status: 'in-stock' | 'low' | 'expiring' | 'expired' = 'in-stock';

  // 🔴 Срок годности (только если задан)
  if (expiresAt) {
    const expDate = new Date(expiresAt);
    const now = new Date();
    const days = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 0) {
      status = 'expired';
      warnings.push(`Просрочен на ${Math.abs(days)} ${Math.abs(days) === 1 ? 'день' : 'дней'}`);
    } else if (days === 0) {
      status = 'expiring';
      warnings.push('Истекает сегодня!');
    } else if (days === 1) {
      status = 'expiring';
      warnings.push('Истекает завтра');
    } else if (days <= 3) {
      status = 'expiring';
      warnings.push(`Осталось ${days} дня`);
    } else if (days <= 7) {
      // Дополнительное предупреждение для 4-7 дней
      warnings.push(`Осталось ${days} дней`);
    }
  }

  // 🟡 Количество
  if (quantity < 1) {
    if (status !== 'expiring' && status !== 'expired') status = 'low';
    warnings.push('Критически низкий запас');
  } else if (quantity < 5) {
    if (status !== 'expiring' && status !== 'expired') status = 'low';
    // ❌ НЕ дублируем: статус уже показывает "Мало"
  }

  return { status, warnings };
}

function convertToFrontend(dto: InventoryProductQueryDTO): InventoryProduct {
  // Защита: проверяем, что получили enriched объект (Query DTO)
  if (!dto.product || !dto.product.name) {
    throw new Error(
      'Inventory DTO without product — use GET /api/inventory/products for enriched data. ' +
      'POST response contains raw entity without joined relations!'
    );
  }

  const baseUnit = convertUnit(dto.product.base_unit);
  const { status, warnings } = calculateStatus(dto.expires_at, dto.quantity);

  // ✅ Обработка категории: объект или строка
  const categoryName = typeof dto.product.category === 'string' 
    ? dto.product.category 
    : dto.product.category.name;
  
  const categoryId = typeof dto.product.category === 'object' && dto.product.category !== null
    ? dto.product.category.id 
    : undefined;

  return {
    id: dto.id,
    product_name: dto.product.name,
    category: categoryName,           // ✅ Название категории (строка или из объекта)
    category_id: categoryId,          // ✅ ID категории (если есть)
    catalog_ingredient_id: dto.product.id, // ✅ ID из каталога для создания рецептов
    quantity: dto.quantity,
    base_unit: baseUnit,
    price: dto.price_per_unit_cents / 100,
    status,
    received_at: dto.received_at ? dto.received_at.split('T')[0] : undefined,
    expiration_date: dto.expires_at ? dto.expires_at.split('T')[0] : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    image_url: dto.product.image_url,
  };
}

export async function searchCatalogIngredients(
  query: string,
  accessToken?: string
): Promise<CatalogIngredientDTO[]> {
  console.log('[CATALOG] Поиск:', query);
  console.log('[CATALOG] Токен (первые 50 символов):', accessToken?.substring(0, 50));
  const res = await apiFetch<{ ingredients: CatalogIngredientDTO[] }>(
    `/api/catalog/ingredients?q=${encodeURIComponent(query)}`,
    {},
    accessToken
  );
  console.log('[CATALOG] Полный ответ от backend:', JSON.stringify(res, null, 2));
  console.log('[CATALOG] Найдено:', res?.ingredients?.length || 0);
  return res?.ingredients || [];
}

export async function fetchInventory(accessToken: string): Promise<InventoryProduct[]> {
  console.log('[INVENTORY] Загрузка (Query DTO)...');
  const dtos = await apiFetch<InventoryProductQueryDTO[]>('/api/inventory/products', {}, accessToken);
  if (!dtos) return [];
  console.log('[INVENTORY] Получено:', dtos.length);
  return dtos.map(convertToFrontend);
}

export async function addInventoryProduct(
  data: AddInventoryProductRequest,
  accessToken: string
): Promise<void> {
  console.log('[INVENTORY] POST - создание продукта:', data);
  
  // POST создает raw entity, БЕЗ joined product
  // ❗ НЕ используем response для UI - он не содержит enriched данных!
  await apiFetch(
    '/api/inventory/products',
    { method: 'POST', body: JSON.stringify(data) },
    accessToken
  );
  
  console.log('[INVENTORY] Продукт создан на backend (raw entity)');
  console.log('Frontend должен вызвать GET для получения enriched данных');
}

export async function updateInventoryProduct(
  id: string,
  data: Partial<{ quantity: number; price_per_unit_cents: number; expires_at: string }>,
  accessToken: string
): Promise<void> {
  console.log('[INVENTORY] Обновление:', id);
  await apiFetch(`/api/inventory/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, accessToken);
  console.log('[INVENTORY] Обновлено');
}

export async function deleteInventoryProduct(id: string, accessToken: string): Promise<void> {
  console.log('[INVENTORY] Удаление:', id);
  await apiFetch(`/api/inventory/products/${id}`, { method: 'DELETE' }, accessToken);
  console.log('[INVENTORY] Удалено');
}

/**
 * Smart Add: Создать продукт через AI (один шаг)
 * Анализирует текст, переводит на все языки, определяет категорию и добавляет в инвентарь
 */
export async function createProductUnified(
  rawText: string,
  accessToken: string
): Promise<any> {
  console.log('[INVENTORY] Smart Add:', rawText);
  return await apiFetch(
    '/api/admin/products',
    {
      method: 'POST',
      body: JSON.stringify({
        raw_text: rawText,
        auto_translate: true
      })
    },
    accessToken
  );
}
