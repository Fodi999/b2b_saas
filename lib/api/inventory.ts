import { apiFetch } from './client';
import {
  InventoryProductRawSchema,
  InventoryProductsResponseSchema,
  InventoryDashboardSchema,
  InventoryHealthSchema,
  InventoryAlertSchema,
  type InventoryProductRawDTO,
  type InventoryDashboardDTO,
  type InventoryHealthDTO,
  type InventoryAlertDTO,
  type CatalogIngredientDTO as CatalogIngredientSchemaDTO,
  CatalogIngredientSchema,
} from '@/lib/schemas/dto';

// ============================================================================
// TYPES (re-export + frontend shapes)
// ============================================================================

export type { CatalogIngredientSchemaDTO as CatalogIngredientDTO };
export type { InventoryDashboardDTO as InventoryDashboard };
export type { InventoryHealthDTO as InventoryHealthStatus };
export type { InventoryAlertDTO as InventoryAlert };

export interface InventoryProduct {
  id: string;
  product_name: string;
  category: string;
  category_id?: string;
  catalog_ingredient_id?: string;
  quantity: number;
  base_unit: 'g' | 'ml' | 'pcs';
  price: number;
  status: 'safe' | 'low' | 'warning' | 'critical' | 'expired';
  received_at?: string;
  expiration_date?: string;
  warnings?: string[];
  image_url?: string | null;
}

export interface AddInventoryProductRequest {
  catalog_ingredient_id: string;
  quantity: number;
  price_per_unit_cents: number;
  received_at?: string;
  expires_at?: string;
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
  waste_percentage: number;
  period_days: number;
}

// ============================================================================
// CONVERTERS
// ============================================================================

function convertUnit(u: 'kilogram' | 'liter' | 'piece'): 'g' | 'ml' | 'pcs' {
  if (u === 'kilogram') return 'g';
  if (u === 'liter') return 'ml';
  return 'pcs';
}

function calculateStatus(
  expiresAt: string | null,
  quantity: number
): { status: InventoryProduct['status']; warnings: string[] } {
  const warnings: string[] = [];
  let status: InventoryProduct['status'] = 'safe';

  if (expiresAt) {
    const exp = new Date(expiresAt);
    const diff = exp.getTime() - Date.now();
    const hours = diff / (1000 * 60 * 60);
    const days = Math.floor(hours / 24);

    if (diff < 0) {
      status = 'expired';
      warnings.push('Просрочено');
    } else if (hours < 24) {
      status = 'critical';
      warnings.push('Истекает менее чем через 24ч!');
    } else if (days < 3) {
      status = 'warning';
      warnings.push('Осталось менее 3 дней');
    }
  }

  if (quantity <= 0) {
    if (status === 'safe' || status === 'warning') status = 'critical';
    warnings.push('Запас полностью исчерпан');
  } else if (quantity < 0.2) {
    if (status === 'safe') status = 'warning';
    warnings.push('Критически низкий запас');
  }

  return { status, warnings };
}

function convertToFrontend(dto: InventoryProductRawDTO): InventoryProduct {
  const baseUnit = convertUnit(dto.product.base_unit);
  const { status, warnings } = calculateStatus(dto.expires_at, dto.quantity);

  const categoryName =
    typeof dto.product.category === 'string'
      ? dto.product.category
      : dto.product.category.name;

  const categoryId =
    typeof dto.product.category === 'object' && dto.product.category !== null
      ? dto.product.category.id
      : undefined;

  return {
    id: dto.id,
    product_name: dto.product.name,
    category: categoryName,
    category_id: categoryId,
    catalog_ingredient_id: dto.product.id,
    quantity: dto.quantity,
    base_unit: baseUnit,
    price: dto.price_per_unit_cents / 100,
    status,
    received_at: dto.received_at?.split('T')[0],
    expiration_date: dto.expires_at?.split('T')[0],
    warnings: warnings.length > 0 ? warnings : undefined,
    image_url: dto.product.image_url,
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Search catalog ingredients.
 */
export async function searchCatalogIngredients(
  query: string,
  accessToken?: string,
): Promise<CatalogIngredientSchemaDTO[]> {
  const url = `/api/catalog/ingredients?q=${encodeURIComponent(query)}`;
  const raw = await apiFetch<unknown>(url, {}, accessToken);

  // Backend: { ingredients: [] } or bare array
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    arr = (Array.isArray(obj.ingredients) ? obj.ingredients : Array.isArray(obj.data) ? obj.data : []) as unknown[];
  }
  return arr.map(item => CatalogIngredientSchema.parse(item));
}

/**
 * Fetch inventory products → InventoryProduct[] for UI.
 */
export async function fetchInventory(accessToken: string): Promise<InventoryProduct[]> {
  const raw = await apiFetch<unknown>('/api/inventory/products', {}, accessToken);

  let dtos: InventoryProductRawDTO[] = [];

  if (Array.isArray(raw)) {
    dtos = raw.map(d => InventoryProductRawSchema.parse(d));
  } else if (raw && typeof raw === 'object') {
    try {
      const parsed = InventoryProductsResponseSchema.parse(raw);
      dtos = parsed.items;
    } catch {
      const obj = raw as Record<string, unknown>;
      const arr = obj.products ?? obj.items ?? obj.data ?? [];
      if (Array.isArray(arr)) {
        dtos = arr.map(d => InventoryProductRawSchema.parse(d));
      }
    }
  }

  return dtos.map(convertToFrontend);
}

/**
 * Add a product to inventory.
 */
export async function addInventoryProduct(
  data: AddInventoryProductRequest,
  accessToken: string
): Promise<void> {
  await apiFetch('/api/inventory/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}

/**
 * Update an inventory product.
 */
export async function updateInventoryProduct(
  id: string,
  data: Partial<{ quantity: number; price_per_unit_cents: number; expires_at: string }>,
  accessToken: string
): Promise<void> {
  await apiFetch(`/api/inventory/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, accessToken);
}

/**
 * Delete an inventory product.
 */
export async function deleteInventoryProduct(
  id: string,
  accessToken: string
): Promise<void> {
  await apiFetch(`/api/inventory/products/${id}`, { method: 'DELETE' }, accessToken);
}

/**
 * Inventory dashboard KPIs.
 */
export async function fetchInventoryDashboard(
  accessToken: string
): Promise<InventoryDashboardDTO | null> {
  const raw = await apiFetch<unknown>('/api/inventory/dashboard', {}, accessToken);
  if (!raw) return null;
  return InventoryDashboardSchema.parse(raw);
}

/**
 * Inventory health status.
 */
export async function fetchInventoryHealth(
  accessToken: string
): Promise<InventoryHealthDTO | null> {
  const raw = await apiFetch<unknown>('/api/inventory/health', {}, accessToken);
  if (!raw) return null;
  return InventoryHealthSchema.parse(raw);
}

/**
 * Inventory alerts.
 */
export async function fetchInventoryAlerts(
  accessToken: string
): Promise<InventoryAlertDTO[]> {
  const raw = await apiFetch<unknown>('/api/inventory/alerts', {}, accessToken);

  // May be { alerts: [] } or bare array
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    arr = Array.isArray(obj.alerts) ? obj.alerts as unknown[] : [];
  }
  return arr.map(a => InventoryAlertSchema.parse(a));
}

/**
 * Loss report (waste KPI).
 */
export async function fetchLossReport(
  days: number = 30,
  accessToken: string
): Promise<LossReport | null> {
  return await apiFetch<LossReport>(
    `/api/inventory/reports/loss?days=${days}`,
    {},
    accessToken
  );
}

/**
 * Process expirations (FIFO cleanup).
 */
export async function processExpirations(
  accessToken: string
): Promise<{ processed_count: number }> {
  const res = await apiFetch<{ processed_count: number }>(
    '/api/inventory/process-expirations',
    { method: 'POST' },
    accessToken
  );
  return res || { processed_count: 0 };
}

/**
 * Create product via admin AI (unified).
 */
export async function createProductUnified(
  rawText: string,
  accessToken: string
): Promise<Record<string, unknown>> {
  const result = await apiFetch<Record<string, unknown>>(
    '/api/admin/products',
    {
      method: 'POST',
      body: JSON.stringify({ raw_text: rawText, auto_translate: true }),
    },
    accessToken
  );
  return result ?? {};
}
