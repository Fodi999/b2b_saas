import { apiFetch } from './client';

export interface CategoryDTO {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Получить список всех категорий
 */
export async function getCategories(accessToken: string): Promise<CategoryDTO[]> {
  console.log('📂 [CATEGORIES API] Загрузка всех категорий');
  const response = await apiFetch<{ categories: CategoryDTO[] }>(
    '/api/admin/categories',
    {},
    accessToken
  );
  return response?.categories || [];
}

/**
 * Получить одну категорию по ID
 */
export async function getCategory(id: string, accessToken: string): Promise<CategoryDTO> {
  console.log('📂 [CATEGORIES API] Загрузка категории:', id);
  const response = await apiFetch<CategoryDTO>(
    `/api/admin/categories/${id}`,
    {},
    accessToken
  );
  if (!response) {
    throw new Error(`Category ${id} not found`);
  }
  return response;
}
