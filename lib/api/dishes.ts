import { apiFetch } from './client';
import {
  DishSchema,
  DishesResponseSchema,
  type DishDTO,
  type Paginated,
} from '@/lib/schemas/dto';

// Re-export for consumers
export type { DishDTO };
/** @deprecated Use DishDTO instead */
export type Dish = DishDTO;

export interface CreateDishPayload {
  recipe_id: string;
  name: string;
  description?: string;
  selling_price_cents: number;
  image_url?: string | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get dishes list (paginated). ALWAYS returns Paginated<DishDTO>.
 * Backend returns { items, total, page, per_page }.
 */
export async function getDishes(
  accessToken: string,
  params?: { page?: number; per_page?: number; active_only?: boolean }
): Promise<Paginated<DishDTO>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.active_only !== undefined) qs.set('active_only', String(params.active_only));

  const url = `/api/dishes${qs.toString() ? '?' + qs.toString() : ''}`;
  const raw = await apiFetch<unknown>(url, {}, accessToken);

  // Flexible parsing: backend may return { items: [] } or bare array
  if (Array.isArray(raw)) {
    return { items: raw.map(d => DishSchema.parse(d)), total: raw.length, page: 1, per_page: raw.length };
  }

  try {
    return DishesResponseSchema.parse(raw);
  } catch {
    // Fallback: try extracting from any shape
    const obj = raw as Record<string, unknown> | null;
    const arr = obj?.items ?? obj?.dishes ?? obj?.data ?? [];
    const items = Array.isArray(arr) ? arr.map(d => DishSchema.parse(d)) : [];
    return {
      items,
      total: typeof obj?.total === 'number' ? obj.total : items.length,
      page: typeof obj?.page === 'number' ? obj.page : 1,
      per_page: typeof obj?.per_page === 'number' ? obj.per_page : 50,
    };
  }
}

/**
 * Create a dish from a recipe. Cost is calculated by backend.
 */
export async function createDish(
  payload: CreateDishPayload,
  accessToken: string
): Promise<DishDTO> {
  const raw = await apiFetch<unknown>('/api/dishes', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, accessToken);

  return DishSchema.parse(raw);
}

/**
 * Recalculate cost for ALL dishes (after inventory price changes).
 */
export async function recalculateAllDishes(accessToken: string): Promise<void> {
  await apiFetch('/api/dishes/recalculate-all', { method: 'POST' }, accessToken);
}

/**
 * Delete a dish.
 */
export async function deleteDish(id: string, accessToken: string): Promise<void> {
  await apiFetch(`/api/dishes/${id}`, { method: 'DELETE' }, accessToken);
}
