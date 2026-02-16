'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AssistantHeader from '@/components/assistant/assistant-header';
import { IssueCard } from '@/components/assistant/issue-card';
import { RecommendationCard } from '@/components/assistant/recommendation-card';
import { NextAction } from '@/components/assistant/next-action';

export default function AssistantPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('assistant');

  if (!user) {
    router.push(`/${locale}/login`);
    return null;
  }

  // Mock данные - реальные бизнес-сценарии ресторана
  const issues = [
    {
      type: 'margin' as const,
      impact: 'high' as const,
      title: t('issues.margin.title'),
      description: t('issues.margin.description'),
      metric: t('issues.margin.metric'),
    },
    {
      type: 'expiry' as const,
      impact: 'medium' as const,
      title: t('issues.expiry.title'),
      description: t('issues.expiry.description'),
      metric: t('issues.expiry.metric'),
    },
    {
      type: 'menu' as const,
      impact: 'medium' as const,
      title: t('issues.menu.title'),
      description: t('issues.menu.description'),
      metric: t('issues.menu.metric'),
    },
  ];

  const recommendation = {
    priority: 1,
    title: t('recommendation.title'),
    description: t('recommendation.description'),
    action: t('recommendation.action'),
    expectedImpact: t('recommendation.expectedImpact'),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-6 py-10 max-w-7xl animate-in fade-in duration-700">
        <div className="space-y-12">
          {/* Header */}
          <AssistantHeader />

          {/* Шаг 1: Обнаруженные проблемы */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
               <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">
                 {t('step1.title')}
               </h2>
               <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue, index) => (
                <IssueCard key={index} {...issue} />
              ))}
            </div>
          </section>

          {/* Шаг 2: Приоритет и Рекомендация */}
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 text-center">
              {t('step2.title')}
            </h2>
            <div className="max-w-3xl mx-auto">
               <RecommendationCard {...recommendation} />
            </div>
          </section>

          {/* Шаг 3: Следующие действия */}
          <section className="space-y-6 pb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 text-center">
              {t('step3.title')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <NextAction
                title={t('nextActions.checkDishes.title')}
                description={t('nextActions.checkDishes.description')}
              />
              <NextAction
                title={t('nextActions.useExpiring.title')}
                description={t('nextActions.useExpiring.description')}
              />
            </div>
          </section>

          {/* Demo note */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              💡 <strong>Demo режим:</strong> {t('demo.note')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
