'use client';

import { useTranslations } from 'next-intl';
import { InsightCard } from './insight-card';
import { Sparkles } from 'lucide-react';

export default function AIAlerts() {
  const t = useTranslations('dashboard.aiAlerts');

  const alerts = [
    {
      variant: 'danger' as const,
      title: t('negativeMargin.title'),
      description: t('negativeMargin.description'),
    },
    {
      variant: 'warning' as const,
      title: t('expiring.title'),
      description: t('expiring.description'),
    },
    {
      variant: 'info' as const,
      title: t('optimization.title'),
      description: t('optimization.description'),
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          {t('badge')}
        </span>
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
