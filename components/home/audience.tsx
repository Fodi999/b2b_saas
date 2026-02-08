'use client';

import { useTranslations } from 'next-intl';
import { Building2, Users, ChefHat } from 'lucide-react';

export default function Audience() {
  const t = useTranslations('audience');

  const personas = [
    { icon: Building2, key: 'owner', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Users, key: 'manager', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ChefHat, key: 'chef', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
          {personas.map(({ icon: Icon, key, color, bg }) => (
            <div key={key} className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className={`mx-auto inline-flex rounded-full ${bg} p-4 dark:bg-opacity-20`}>
                <Icon className={`h-8 w-8 ${color}`} />
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
