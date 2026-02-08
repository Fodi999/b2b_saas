'use client';

import { useTranslations } from 'next-intl';
import { Package, FileText, UtensilsCrossed, BarChart3, Bot } from 'lucide-react';

export default function Features() {
  const t = useTranslations('features');

  const features = [
    { icon: Package, key: 'inventory', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: FileText, key: 'recipes', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: UtensilsCrossed, key: 'dishes', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: BarChart3, key: 'menuEngineering', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Bot, key: 'ai', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <section className="bg-white py-16 dark:bg-gray-950 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, key, color, bg }) => (
            <div key={key} className="rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
              <div className={`inline-flex rounded-lg ${bg} p-3 dark:bg-opacity-20`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
