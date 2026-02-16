'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  fetchInventoryHealth, 
  fetchLossReport, 
  processExpirations,
  fetchInventoryAlerts,
  fetchInventoryDashboard,
} from '@/lib/api/inventory';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAnalyticsStore } from '@/lib/stores/analytics-store';

export function useInventoryAnalytics() {
  const { accessToken } = useAuthStore();
  const { 
    health, setHealth,
    lossReport, setLossReport,
    alerts, setAlerts,
    dashboard, setDashboard,
    loading, setLoading,
    lastFetched, setLastFetched,
    clear
  } = useAnalyticsStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const loadDashboard = useCallback(async (force = false) => {
    if (!accessToken) return;
    
    // 🛡️ Защита от дубликатов: кешируем запросы на 20 секунд
    const now = Date.now();
    if (!force && lastFetched && (now - lastFetched < 20000)) {
       return;
    }

    try {
      setLoading(true);
      const data = await fetchInventoryDashboard(accessToken);
      setDashboard(data);
      setLastFetched(now);
    } catch (error: any) {
      // 🛡️ Если это 401, не затираем данные (ждем обновления токена через useAuthInit)
      if (error?.status === 401) {
        console.log('🛡️ [useInventoryAnalytics] 401 detected, waiting for token refresh...');
        return;
      }
      
      console.warn('[useInventoryAnalytics] Dashboard offline:', error?.message);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken, lastFetched, setDashboard, setLastFetched, setLoading]);

  const loadHealth = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await fetchInventoryHealth(accessToken);
      setHealth(data);
    } catch (error) {
      console.error('[useInventoryAnalytics] Health error:', error);
    }
  }, [accessToken, setHealth]);

  const loadAlerts = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await fetchInventoryAlerts(accessToken);
      setAlerts(data || []);
    } catch (error) {
       console.error('[useInventoryAnalytics] Alerts error:', error);
    }
  }, [accessToken, setAlerts]);

  const loadLossReport = useCallback(async (days: number = 30) => {
    if (!accessToken) return;
    try {
      const data = await fetchLossReport(days, accessToken);
      setLossReport(data);
    } catch (error) {
       console.error('[useInventoryAnalytics] Loss report error:', error);
    }
  }, [accessToken, setLossReport]);

  const runCleanup = useCallback(async () => {
    if (!accessToken) return 0;
    try {
      setIsProcessing(true);
      const res = await processExpirations(accessToken);
      await Promise.all([
        loadDashboard(true),
        loadHealth(),
        loadLossReport(),
        loadAlerts()
      ]);
      return res.processed_count;
    } catch (error) {
      return 0;
    } finally {
      setIsProcessing(false);
    }
  }, [accessToken, loadDashboard, loadHealth, loadLossReport, loadAlerts]);

  useEffect(() => {
    if (accessToken) {
      loadDashboard();
      loadHealth();
      loadLossReport(30);
      loadAlerts();
    }
  }, [accessToken, loadDashboard, loadHealth, loadLossReport, loadAlerts]);

  return {
    health,
    lossReport,
    alerts,
    dashboard,
    loading,
    isProcessing,
    refresh: () => {
      loadDashboard(true);
      loadHealth();
      loadLossReport();
      loadAlerts();
    },
    runCleanup,
    clearAnalytics: clear
  };
}
