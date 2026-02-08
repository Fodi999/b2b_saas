'use client';

import { useTranslations } from 'next-intl';
import { XCircle, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react';

export default function WowSection() {
  const t = useTranslations('wow');

  const items = [
    { 
      icon: XCircle, 
      key: 'unprofitable', 
      color: 'text-red-600 dark:text-red-400', 
      bg: 'bg-red-50 dark:bg-red-950/30', 
      border: 'border-red-200 dark:border-red-900' 
    },
    { 
      icon: AlertTriangle, 
      key: 'expiring', 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-950/30', 
      border: 'border-amber-200 dark:border-amber-900' 
    },
    { 
      icon: TrendingDown, 
      key: 'dragging', 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-50 dark:bg-orange-950/30', 
      border: 'border-orange-200 dark:border-orange-900' 
    },
  ];

  return (
    <section className="bg-gradient-to-b from-indigo-50 to-white py-16 dark:from-indigo-950/20 dark:to-gray-950 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
            Момент ВАУ
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
          {items.map(({ icon: Icon, key, color, bg, border }) => (
            <div key={key} className={`rounded-xl border-2 ${border} ${bg} p-6`}>
              <Icon className={`h-8 w-8 ${color}`} />
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                {t(`items.${key}.title`)}
              </h3>
              <div className="mt-3 flex items-start gap-2">
                <Sparkles className="h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {t(`items.${key}.action`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
