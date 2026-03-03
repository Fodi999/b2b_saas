'use client';

/**
 * useReportsData — loads all data needed for NeuralStats reports page:
 *  1. GET /api/reports/summary?period_days=N  → financial KPIs
 *  2. GET /api/dishes                          → per-dish margin analysis
 *  3. GET /api/menu-engineering/analysis       → BCG categories + revenue
 *  4. GET /api/inventory/alerts                → expiring items
 *  5. GET /api/inventory/reports/loss          → waste KPI
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { fetchReportsSummary, type ReportSummaryDTO } from '@/lib/api/reports';
import { getDishes, type DishDTO } from '@/lib/api/dishes';
import { getMenuEngineeringAnalysis } from '@/lib/api/menu-engineering';
import { fetchInventoryAlerts, fetchLossReport, type InventoryAlert, type LossReport } from '@/lib/api/inventory';
import type { MenuEngineeringResponseDTO } from '@/lib/schemas/dto';

// Period in days map
export const PERIOD_DAYS: Record<string, number> = {
  today: 1,
  '7days': 7,
  '30days': 30,
};

export interface ReportsData {
  summary: ReportSummaryDTO | null;
  dishes: DishDTO[];
  menuEngineering: MenuEngineeringResponseDTO | null;
  alerts: InventoryAlert[];
  lossReport: LossReport | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useReportsData(periodKey: string): ReportsData {
  const { accessToken } = useAuthStore();
  const days = PERIOD_DAYS[periodKey] ?? 30;

  const [summary, setSummary] = useState<ReportSummaryDTO | null>(null);
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [menuEngineering, setMenuEngineering] = useState<MenuEngineeringResponseDTO | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [lossReport, setLossReport] = useState<LossReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    const [summaryRes, dishesRes, menuRes, alertsRes, lossRes] = await Promise.allSettled([
      fetchReportsSummary(days, accessToken),
      getDishes(accessToken, { per_page: 100 }),
      getMenuEngineeringAnalysis(accessToken, { period_days: days }),
      fetchInventoryAlerts(accessToken),
      fetchLossReport(days, accessToken),
    ]);

    if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
    if (dishesRes.status === 'fulfilled') setDishes(dishesRes.value.items);
    if (menuRes.status === 'fulfilled') setMenuEngineering(menuRes.value);
    if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);
    if (lossRes.status === 'fulfilled') setLossReport(lossRes.value);

    // Show error only if all critical sources fail
    const allFailed = [summaryRes, dishesRes, menuRes].every(r => r.status === 'rejected');
    if (allFailed) {
      const first = [summaryRes, dishesRes, menuRes].find(r => r.status === 'rejected') as PromiseRejectedResult;
      setError(first?.reason instanceof Error ? first.reason.message : 'Ошибка загрузки данных');
    }

    setLoading(false);
  }, [accessToken, days]);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, dishes, menuEngineering, alerts, lossReport, loading, error, refresh: load };
}
