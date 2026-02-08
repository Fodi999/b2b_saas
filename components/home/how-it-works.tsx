'use client';

import { useTranslations } from 'next-intl';
import { Upload, Plus, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    { icon: Upload, key: 'step1' },
    { icon: Plus, key: 'step2' },
    { icon: Sparkles, key: 'step3' },
  ];

  return (
    <section className="bg-white py-16 dark:bg-gray-950 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
          {steps.map(({ icon: Icon, key }, index) => (
            <div key={key} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gray-200 dark:bg-gray-800 sm:block" />
              )}
              <div className="relative rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/50">
                  <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t(`${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
