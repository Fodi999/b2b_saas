'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="flex min-h-[100vh] flex-col justify-center bg-gradient-to-b from-gray-50 to-white py-16 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          {/* Заголовок */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            {t('title')}
          </h1>
          
          {/* Подзаголовок */}
          <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
            {t('subtitle')}
          </p>

          {/* CTA кнопки */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              {t('cta.start')}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              {t('cta.demo')}
            </Button>
          </div>

          {/* Компактный Dashboard Mockup */}
          <div className="relative mx-auto mt-12 max-w-4xl">
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              {/* Mockup header bar */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              
              {/* Mockup content - aspect video for compact size */}
              <div className="aspect-video bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900">
                {/* Placeholder для будущего скриншота dashboard */}
                <div className="flex h-full items-center justify-center">
                  <div className="space-y-4 p-8">
                    <div className="h-4 w-48 rounded bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-4 w-64 rounded bg-gray-300 dark:bg-gray-600"></div>
                    <div className="h-4 w-56 rounded bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative blur effects */}
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
