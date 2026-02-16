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

// 🔥 V3: Inventory Health & Analytics
export interface StockoutPrediction {
  ingredient_id: string;
  name: string;
  current_quantity: number;
  avg_daily_consumption: number;
  days_until_stockout: number; // number.POSITIVE_INFINITY если нет расхода
}

export interface RiskProduct {
  ingredient_id: string;
  name: string;
  status: 'Expired' | 'Critical' | 'Warning';
  batch_id: string;
  remaining_quantity: number;
}

export interface InventoryDashboard {
  total_stock_value_cents: number;
  waste_30d_cents: number;
  waste_percentage: number;
  health_score: number;
  stockout_risks: StockoutPrediction[];
  expired_risks: RiskProduct[];
}

export interface InventoryHealthStatus {
  health_score: number;     // 0-100
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  critical: number;         // Кол-во критических проблем (просрочка/ноль)
  warning: number;          // Кол-во предупреждений (заканчивается)
  expired: number;          // Кол-во реально просроченных товаров
  low_stock: number;        // Кол-во товаров ниже порога
  badge_count: number;      // Число для красного кружка уведомлений (unseen alerts)
}

export interface InventoryAlert {
  id: string;
  type: 'expired' | 'low_stock' | 'expiring_soon';
  product_name: string;
  message: string;
  severity: 'critical' | 'warning';
  created_at: string;
}

export interface LossReportItem {
  ingredient_id: string;
  ingredient_name: string;
  lost_quantity: number;
  loss_value_cents: number;
}

export interface LossReport {
  items: LossReportItem[];
  total_loss_cents: number;
  total_purchased_cents: number;
  waste_percentage: number; // 🔥 Основной бизнес-KPI (например, 3.8)
  period_days: number;
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

  // 🟡 Количество (Thresholds)
  // В будущем эти значения будут приходить с бекенда для каждого продукта отдельно.
  // Сейчас используем канонические пороги из FRONTEND_INVENTORY_INTEGRATION.md
  if (quantity <= 0) {
    if (status !== 'expiring' && status !== 'expired') status = 'low'; // Or 'critical' if we had it
    warnings.push('Запас полностью исчерпан');
  } else if (quantity < 0.2) {
    if (status !== 'expiring' && status !== 'expired') status = 'low';
    warnings.push('Критически низкий запас');
  } else if (quantity < 0.5) {
    if (status !== 'expiring' && status !== 'expired') status = 'low';
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
 * 🔥 V3: Загрузить главный Dashboard (KPI, Ценность, Риски)
 */
export async function fetchInventoryDashboard(accessToken: string): Promise<InventoryDashboard | null> {
  console.log('[INVENTORY V3] Fetching Full Dashboard...');
  return await apiFetch<InventoryDashboard>('/api/inventory/dashboard', {}, accessToken);
}

/**
 * 🔥 V3: Загрузить статус здоровья склада
 */
export async function fetchInventoryHealth(accessToken: string): Promise<InventoryHealthStatus | null> {
  console.log('[INVENTORY V3] Health Check...');
  return await apiFetch<InventoryHealthStatus>('/api/inventory/health', {}, accessToken);
}

/**
 * 🔥 V3: Загрузить список алертов
 */
export async function fetchInventoryAlerts(accessToken: string): Promise<InventoryAlert[]> {
  console.log('[INVENTORY V3] Fetching Alerts...');
  const res = await apiFetch<{ alerts: InventoryAlert[] }>('/api/inventory/alerts', {}, accessToken);
  return res?.alerts || [];
}

/**
 * 🔥 V3: Отчет о потерях (Waste KPI)
 */
export async function fetchLossReport(days: number = 30, accessToken: string): Promise<LossReport | null> {
  console.log('[INVENTORY V3] Loss Report (days:', days, ')...');
  return await apiFetch<LossReport>(`/api/inventory/reports/loss?days=${days}`, {}, accessToken);
}

/**
 * 🔥 V3: Списание всех просроченных партий (FIFO Cleanup)
 */
export async function processExpirations(accessToken: string): Promise<{ processed_count: number }> {
  console.log('[INVENTORY V3] FIFO Cleanup (processing expirations)...');
  const res = await apiFetch<{ processed_count: number }>(
    '/api/inventory/process-expirations',
    { method: 'POST' },
    accessToken
  );
  return res || { processed_count: 0 };
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
