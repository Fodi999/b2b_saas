/**
 * useAssistantData
 *
 * Aggregates data from three backend sources to power the AI Assistant page:
 *  1. GET /api/dishes            → margin issues (food_cost_percent > 40 or negative margin)
 *  2. GET /api/inventory/alerts  → expiring ingredients
 *  3. GET /api/menu-engineering/analysis → BCG dogs + plowhorses (menu issues)
 *  4. GET /api/assistant/state   → bot state machine info
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getDishes, type DishDTO } from '@/lib/api/dishes';
import { fetchInventoryAlerts, type InventoryAlert } from '@/lib/api/inventory';
import { getMenuEngineeringAnalysis, type MenuEngineeringDish } from '@/lib/api/menu-engineering';
import { getAssistantState, type AssistantStateDTO } from '@/lib/api/assistant';

// ============================================================================
// TYPES
// ============================================================================

export interface MarginIssue {
  dish: DishDTO;
  marginPercent: number; // negative = loss
}

export interface AssistantData {
  // Margin problems
  marginIssues: MarginIssue[];
  worstDish: DishDTO | null;

  // Expiring inventory
  expiringAlerts: InventoryAlert[];

  // Menu engineering (BCG)
  weakDishes: MenuEngineeringDish[]; // dogs + plowhorses
  menuEngineeringRevenue: number;    // total revenue cents

  // Bot state
  assistantState: AssistantStateDTO | null;

  // Loading / error
  loading: boolean;
  error: string | null;

  // Refetch
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAssistantData(): AssistantData {
  const { accessToken } = useAuthStore();

  const [marginIssues, setMarginIssues] = useState<MarginIssue[]>([]);
  const [worstDish, setWorstDish] = useState<DishDTO | null>(null);
  const [expiringAlerts, setExpiringAlerts] = useState<InventoryAlert[]>([]);
  const [weakDishes, setWeakDishes] = useState<MenuEngineeringDish[]>([]);
  const [menuEngineeringRevenue, setMenuEngineeringRevenue] = useState(0);
  const [assistantState, setAssistantState] = useState<AssistantStateDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      // Parallel fetch all sources
      const [dishesResp, alerts, menuAnalysis, botState] = await Promise.allSettled([
        getDishes(accessToken, { per_page: 100 }),
        fetchInventoryAlerts(accessToken),
        getMenuEngineeringAnalysis(accessToken, { period_days: 30 }),
        getAssistantState(accessToken),
      ]);

      // --- Dishes → margin issues ---
      if (dishesResp.status === 'fulfilled') {
        const dishes = dishesResp.value.items;

        // Dishes with negative margin or food cost > 40%
        const issues: MarginIssue[] = dishes
          .filter(d => {
            const margin = d.profit_margin_percent ?? null;
            const fc = d.food_cost_percent ?? null;
            return (margin !== null && margin < 0) || (fc !== null && fc > 40);
          })
          .map(d => ({
            dish: d,
            marginPercent: d.profit_margin_percent ?? -(d.food_cost_percent ?? 0),
          }))
          .sort((a, b) => a.marginPercent - b.marginPercent); // worst first

        setMarginIssues(issues);
        setWorstDish(issues[0]?.dish ?? null);
      }

      // --- Inventory alerts ---
      if (alerts.status === 'fulfilled') {
        setExpiringAlerts(alerts.value);
      }

      // --- Menu engineering ---
      if (menuAnalysis.status === 'fulfilled') {
        const data = menuAnalysis.value;
        const weak = [
          ...(data.categories.dogs ?? []),
          ...(data.categories.plowhorses ?? []),
        ];
        setWeakDishes(weak);
        setMenuEngineeringRevenue(data.total_revenue_cents ?? 0);
      }

      // --- Bot state ---
      if (botState.status === 'fulfilled') {
        setAssistantState(botState.value);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    marginIssues,
    worstDish,
    expiringAlerts,
    weakDishes,
    menuEngineeringRevenue,
    assistantState,
    loading,
    error,
    refresh: fetch,
  };
}
