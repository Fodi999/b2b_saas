'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, TrendingDown, Eye, Package } from 'lucide-react';

export default function Problems() {
  const t = useTranslations('problems');

  const problems = [
    { icon: Package, key: 'inventory' },
    { icon: TrendingDown, key: 'cost' },
    { icon: AlertCircle, key: 'menu' },
    { icon: Eye, key: 'decisions' },
  ];

  return (
    <section className="bg-red-50 py-16 dark:bg-red-950/20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-red-600 dark:text-red-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          {problems.map(({ icon: Icon, key }) => (
            <div key={key} className="flex gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="flex-shrink-0">
                <Icon className="h-6 w-6 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">{t(`items.${key}`)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border-2 border-green-200 bg-green-50 p-8 dark:border-green-900 dark:bg-green-950/30">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('solution.title')}
          </h3>
          <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">
            {t('solution.description')}
          </p>
        </div>
      </div>
    </section>
  );
}
