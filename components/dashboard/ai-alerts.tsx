'use client';

import { useTranslations } from 'next-intl';
import { InsightCard } from './insight-card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { useDishesStore } from '@/lib/stores/dishes-store';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useEffect, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AIAlerts() {
  const t = useTranslations('dashboard.aiAlerts');
  const { items: inventoryItems, loading: inventoryLoading } = useInventoryStore();
  const { dishes } = useDishesStore();
  const { reloadInventory } = useInventory();

  // Загружаем актуальные данные при монтировании
  useEffect(() => {
    reloadInventory().catch(() => {});
  }, [reloadInventory]);

  const alerts = useMemo(() => {
    const list = [];

    // 🔴 Проверка на убыточные блюда
    const lossDishes = dishes.filter(d => d.status === 'loss');
    if (lossDishes.length > 0) {
      list.push({
        variant: 'danger' as const,
        title: t('negativeMargin.title'),
        description: `${lossDishes.length} ${lossDishes.length === 1 ? 'блюдо имеет' : 'блюда имеют'} отрицательную или критически низкую маржу. Требуется корректировка цен.`,
      });
    }

    // 🟡 Проверка на истекающие сроки
    const expiringItems = inventoryItems.filter(i => i.status === 'expiring' || i.status === 'expired');
    if (expiringItems.length > 0) {
      list.push({
        variant: 'warning' as const,
        title: t('expiring.title'),
        description: `${expiringItems.length} ${expiringItems.length === 1 ? 'продукт требует' : 'продукта требуют'} срочного использования. Истекают в ближайшее время.`,
      });
    }

    // 🔵 Оптимизация (Placeholder logic based on dishes)
    if (dishes.length > 0) {
      list.push({
        variant: 'info' as const,
        title: t('optimization.title'),
        description: t('optimization.description'),
      });
    }

    // Если данных мало, показываем дефолтные подсказки
    if (list.length === 0) {
      list.push({
        variant: 'info' as const,
        title: "Данные анализируются",
        description: "Добавьте больше продуктов и рецептов, чтобы AI смог сформировать рекомендации по прибыли.",
      });
    }

    return list;
  }, [inventoryItems, dishes, t]);

  if (inventoryLoading && inventoryItems.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t('title')}
        </h3>
        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900 px-2.5 py-0.5 font-bold text-[10px] uppercase">
          {t('badge')}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
