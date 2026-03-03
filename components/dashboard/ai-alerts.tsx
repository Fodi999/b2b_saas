'use client';

import { useTranslations } from 'next-intl';
import { InsightCard } from './insight-card';
import { Sparkles, Loader2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { useDishesStore } from '@/lib/stores/dishes-store';
import { useInventoryAnalytics } from '@/lib/hooks/use-inventory-analytics';
import { useEffect, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIAlerts() {
  const t = useTranslations('dashboard.aiAlerts');
  const { dishes } = useDishesStore();
  const { alerts: backendAlerts, loading: analyticsLoading } = useInventoryAnalytics();

  const alerts = useMemo(() => {
    const list = [];

    // 1. Real Backend Alerts (V3 Integration)
    (backendAlerts ?? []).forEach(alert => {
      list.push({
        variant: alert.severity === 'critical' ? 'danger' as const : 'warning' as const,
        title: alert.product_name,
        description: alert.message,
      });
    });

    // 2. Business Logic: Unprofitable Dishes
    const safeDishes = Array.isArray(dishes) ? dishes : [];
    const lossDishes = safeDishes.filter(d => (d.profit_margin_percent ?? 0) < 15);
    if (lossDishes.length > 0) {
      list.push({
        variant: 'danger' as const,
        title: t('negativeMargin.title'),
        description: `${lossDishes.length} ${lossDishes.length === 1 ? 'блюдо имеет' : 'блюда имеют'} отрицательную маржу.`,
      });
    }

    // 3. 🔵 Optimization Placeholder
    if (list.length < 3 && dishes.length > 0) {
      list.push({
        variant: 'info' as const,
        title: t('optimization.title'),
        description: t('optimization.description'),
      });
    }

    return list;
  }, [backendAlerts, dishes, t]);

  if (analyticsLoading && alerts.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-600 shadow-sm">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-0.5 sm:mb-1">
            {t('title')}
          </h3>
          <p className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Intelligence Feed</p>
        </div>
        <Badge variant="secondary" className="ml-2 bg-indigo-500 text-white border-none px-2 sm:px-3 py-0.5 sm:py-1 font-black text-[7px] sm:text-[9px] uppercase tracking-widest animate-pulse">
           Live
        </Badge>
      </div>

      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {alerts.map((alert, index) => (
          <InsightCard
            key={index}
            variant={alert.variant}
            title={alert.title}
            description={alert.description}
          />
        ))}
      </div>
    </section>
  );
}
