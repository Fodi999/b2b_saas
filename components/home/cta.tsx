'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-16 dark:from-indigo-900 dark:to-indigo-950 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-indigo-100 dark:text-indigo-200">
            {t('subtitle')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2">
              {t('buttons.create')}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-white bg-transparent text-white hover:bg-white/10"
            >
              <Calendar className="h-4 w-4" />
              {t('buttons.demo')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
