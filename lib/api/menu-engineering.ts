import { apiFetch } from './client';
import {
  MenuEngineeringResponseSchema,
  type MenuEngineeringResponseDTO,
  type MenuDishPerformanceDTO,
  type Language,
} from '@/lib/schemas/dto';

export type { MenuEngineeringResponseDTO as MenuEngineeringAnalysisResponse };
export type { MenuDishPerformanceDTO as MenuEngineeringDish };

export interface MenuEngineeringCategories {
  stars: MenuDishPerformanceDTO[];
  plowhorses: MenuDishPerformanceDTO[];
  puzzles: MenuDishPerformanceDTO[];
  dogs: MenuDishPerformanceDTO[];
}

/**
 * Get menu engineering analysis (BCG matrix).
 */
export async function getMenuEngineeringAnalysis(
  accessToken: string,
  params?: {
    period_days?: number;
    language?: Language;
  }
): Promise<MenuEngineeringResponseDTO> {
  const qs = new URLSearchParams();
  if (params?.period_days) qs.set('period_days', String(params.period_days));
  if (params?.language) qs.set('language', params.language);

  const url = `/api/menu-engineering/analysis${qs.toString() ? '?' + qs.toString() : ''}`;
  const raw = await apiFetch<unknown>(url, {}, accessToken);
  return MenuEngineeringResponseSchema.parse(raw);
}

/**
 * Record a dish sale.
 */
export async function recordSale(
  accessToken: string,
  data: { dish_id: string; quantity: number; sold_at?: string }
): Promise<void> {
  await apiFetch('/api/menu-engineering/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}
