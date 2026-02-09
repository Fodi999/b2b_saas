import { apiFetch } from './client';

interface ProductEmbedded {
  id: string;
  name: string;
  category: string;
  base_unit: 'kilogram' | 'liter' | 'piece';
}

interface InventoryProductQueryDTO {
  id: string;
  product: ProductEmbedded;
  quantity: number;
  price_per_unit_cents: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogIngredientDTO {
  id: string;
  category_id: string;
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
  category: string;
  quantity: number;
  base_unit: 'g' | 'ml' | 'pcs';
  price: number;
  status: 'in-stock' | 'low' | 'expiring';
  expiration_date?: string;
  warnings?: string[];
}

export interface AddInventoryProductRequest {
  catalog_ingredient_id: string;
  quantity: number;
  price_per_unit_cents: number;
  expires_at: string;
}

function convertUnit(backendUnit: 'kilogram' | 'liter' | 'piece'): 'g' | 'ml' | 'pcs' {
  if (backendUnit === 'kilogram') return 'g';
  if (backendUnit === 'liter') return 'ml';
  return 'pcs';
}

function calculateStatus(
  expiresAt: string,
  quantity: number
): { status: 'in-stock' | 'low' | 'expiring'; warnings: string[] } {
  const expDate = new Date(expiresAt);
  const now = new Date();
  const days = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const warnings: string[] = [];
  let status: 'in-stock' | 'low' | 'expiring' = 'in-stock';

  if (days < 0) {
    status = 'expiring';
    warnings.push('Просрочен');
  } else if (days <= 3) {
    status = 'expiring';
    warnings.push(`Истекает через ${days} дн.`);
  }

  if (quantity < 1) {
    if (status !== 'expiring') status = 'low';
    warnings.push('Критически низкий запас');
  } else if (quantity < 5) {
    if (status !== 'expiring') status = 'low';
    warnings.push('Низкий запас');
  }

  return { status, warnings };
}

function convertToFrontend(dto: InventoryProductQueryDTO): InventoryProduct {
  const baseUnit = convertUnit(dto.product.base_unit);
  const { status, warnings } = calculateStatus(dto.expires_at, dto.quantity);

  return {
    id: dto.id,
    product_name: dto.product.name,
    category: dto.product.category,
    quantity: dto.quantity,
    base_unit: baseUnit,
    price: dto.price_per_unit_cents / 100,
    status,
    expiration_date: dto.expires_at.split('T')[0],
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export async function searchCatalogIngredients(
  query: string,
  accessToken?: string
): Promise<CatalogIngredientDTO[]> {
  console.log('🔍 [CATALOG] Поиск:', query);
  console.log('🔑 [CATALOG] Токен (первые 50 символов):', accessToken?.substring(0, 50));
  const res = await apiFetch<{ ingredients: CatalogIngredientDTO[] }>(
    `/api/catalog/ingredients?q=${encodeURIComponent(query)}`,
    {},
    accessToken
  );
  console.log('✅ [CATALOG] Полный ответ от backend:', JSON.stringify(res, null, 2));
  console.log('✅ [CATALOG] Найдено:', res.ingredients?.length || 0);
  return res.ingredients || [];
}

export async function fetchInventory(accessToken: string): Promise<InventoryProduct[]> {
  console.log('📦 [INVENTORY] Загрузка (Query DTO)...');
  const dtos = await apiFetch<InventoryProductQueryDTO[]>('/api/inventory/products', {}, accessToken);
  console.log('✅ [INVENTORY] Получено:', dtos.length);
  return dtos.map(convertToFrontend);
}

export async function addInventoryProduct(
  data: AddInventoryProductRequest,
  accessToken: string
): Promise<InventoryProduct> {
  console.log('📦 [INVENTORY] Добавление:', data);
  const dto = await apiFetch<InventoryProductQueryDTO>(
    '/api/inventory/products',
    { method: 'POST', body: JSON.stringify(data) },
    accessToken
  );
  console.log('✅ [INVENTORY] Добавлено:', dto.product.name);
  return convertToFrontend(dto);
}

export async function updateInventoryProduct(
  id: string,
  data: Partial<{ quantity: number; price_per_unit_cents: number; expires_at: string }>,
  accessToken: string
): Promise<void> {
  console.log('📦 [INVENTORY] Обновление:', id);
  await apiFetch(`/api/inventory/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, accessToken);
  console.log('✅ [INVENTORY] Обновлено');
}

export async function deleteInventoryProduct(id: string, accessToken: string): Promise<void> {
  console.log('📦 [INVENTORY] Удаление:', id);
  await apiFetch(`/api/inventory/products/${id}`, { method: 'DELETE' }, accessToken);
  console.log('✅ [INVENTORY] Удалено');
}
