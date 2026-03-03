import { apiFetch } from './client';
import { CatalogCategorySchema, type CatalogCategoryDTO } from '@/lib/schemas/dto';

export type { CatalogCategoryDTO as CategoryDTO };

/**
 * Get all catalog categories (safe: always returns array).
 */
export async function getCategories(accessToken: string): Promise<CatalogCategoryDTO[]> {
  const raw = await apiFetch<unknown>('/api/admin/categories', {}, accessToken);

  // May be { categories: [] } or bare array
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    arr = Array.isArray(obj.categories) ? obj.categories as unknown[] : [];
  }

  return arr.map(c => CatalogCategorySchema.parse(c));
}

/**
 * Get a single category by ID.
 */
export async function getCategory(
  id: string,
  accessToken: string
): Promise<CatalogCategoryDTO> {
  const raw = await apiFetch<unknown>(`/api/admin/categories/${id}`, {}, accessToken);
  return CatalogCategorySchema.parse(raw);
}
