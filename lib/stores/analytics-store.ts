import { create } from 'zustand';
import { 
  InventoryHealthStatus, 
  LossReport, 
  InventoryAlert, 
  InventoryDashboard 
} from '@/lib/api/inventory';

interface AnalyticsState {
  health: InventoryHealthStatus | null;
  lossReport: LossReport | null;
  alerts: InventoryAlert[];
  dashboard: InventoryDashboard | null;
  loading: boolean;
  lastFetched: number | null;

  setHealth: (health: InventoryHealthStatus | null) => void;
  setLossReport: (report: LossReport | null) => void;
  setAlerts: (alerts: InventoryAlert[]) => void;
  setDashboard: (dashboard: InventoryDashboard | null) => void;
  setLoading: (loading: boolean) => void;
  setLastFetched: (timestamp: number) => void;
  clear: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  health: null,
  lossReport: null,
  alerts: [],
  dashboard: null,
  loading: false,
  lastFetched: null,

  setHealth: (health) => set({ health }),
  setLossReport: (lossReport) => set({ lossReport }),
  setAlerts: (alerts) => set({ alerts }),
  setDashboard: (dashboard) => set({ dashboard }),
  setLoading: (loading) => set({ loading }),
  setLastFetched: (lastFetched) => set({ lastFetched }),
  
  clear: () => set({ 
    health: null, 
    lossReport: null, 
    alerts: [], 
    dashboard: null, 
    lastFetched: null 
  }),
}));
