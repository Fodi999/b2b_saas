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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-10">
          {/* Header */}
          <AssistantHeader />

          {/* Шаг 1: Обнаруженные проблемы */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('step1.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('step1.description')}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue, index) => (
                <IssueCard key={index} {...issue} />
              ))}
            </div>
          </section>

          {/* Шаг 2: Приоритет и Рекомендация */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('step2.title')}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('step2.description')}
              </p>
            </div>
            <RecommendationCard {...recommendation} />
          </section>

          {/* Шаг 3: Следующие действия */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('step3.title')}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
