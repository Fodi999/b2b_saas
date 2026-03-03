'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import AssistantHeader from '@/components/assistant/assistant-header';
import { IssueCard } from '@/components/assistant/issue-card';
import { RecommendationCard } from '@/components/assistant/recommendation-card';
import { NextAction } from '@/components/assistant/next-action';
import { useAssistantData } from '@/lib/hooks/use-assistant-data';
import { Button } from '@/components/ui/button';

// ── helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(cents: number, locale: string) {
  const currency = locale === 'pl' ? 'PLN' : locale === 'uk' || locale === 'ru' ? 'RUB' : 'EUR';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(0)} ${currency}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('assistant');

  const {
    marginIssues,
    worstDish,
    expiringAlerts,
    weakDishes,
    menuEngineeringRevenue,
    assistantState,
    loading,
    error,
    refresh,
  } = useAssistantData();

  if (!user) {
    router.push(`/${locale}/login`);
    return null;
  }

  // ── derive UI values from real data ─────────────────────────────────────

  const hasMarginIssue  = marginIssues.length > 0;
  const hasExpiryIssue  = expiringAlerts.length > 0;
  const hasMenuIssue    = weakDishes.length > 0;

  // Worst dish margin — use the marginPercent from MarginIssue
  const worstMarginPct  = marginIssues[0]?.marginPercent ?? null;
  const worstMarginText = worstMarginPct !== null
    ? `${worstMarginPct > 0 ? '+' : ''}${worstMarginPct.toFixed(0)}%`
    : null;

  // Estimated monthly impact: recover lost margin on worst dish
  // (rough: restore to 30% margin, 30 days)
  const worstDishImpact = worstDish
    ? (() => {
        const price  = worstDish.selling_price_cents ?? 0;
        const margin = worstDish.profit_margin_percent ?? -10;
        // Target margin 30% → delta per unit ≈ (30 - margin)% × price
        const deltaPerUnit = ((30 - margin) / 100) * price;
        // Assume 10 orders/day
        const monthly = deltaPerUnit * 10 * 30;
        return monthly > 0 ? formatCurrency(Math.round(monthly), locale) : null;
      })()
    : null;

  // BCG weak dishes → potential uplift from menu optimization
  // If no real revenue data yet, skip the calculation
  const menuPotentialText = menuEngineeringRevenue > 0
    ? formatCurrency(Math.round(menuEngineeringRevenue * 0.05), locale) // 5% uplift
    : null;

  // ── issues list (real data) ──────────────────────────────────────────────

  interface IssueItem {
    type: 'margin' | 'expiry' | 'menu';
    impact: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    metric: string;
  }

  const issues: IssueItem[] = [];

  if (hasMarginIssue) {
    issues.push({
      type: 'margin',
      impact: 'high',
      title: t('issues.margin.title'),
      description: t('issues.margin.descriptionReal', {
        name: worstDish?.name ?? '—',
        margin: worstMarginText ?? '—',
      }),
      metric: worstMarginText ? `${worstMarginText} ${t('issues.margin.metricSuffix')}` : t('issues.margin.metric'),
    });
  }

  if (hasExpiryIssue) {
    issues.push({
      type: 'expiry',
      impact: 'medium',
      title: t('issues.expiry.title'),
      description: t('issues.expiry.descriptionReal', {
        count: expiringAlerts.length,
        names: expiringAlerts.slice(0, 3).map(a => a.product_name).join(', '),
      }),
      metric: t('issues.expiry.metricReal', { count: expiringAlerts.length }),
    });
  }

  if (hasMenuIssue) {
    issues.push({
      type: 'menu',
      impact: 'medium',
      title: t('issues.menu.title'),
      description: t('issues.menu.descriptionReal', { count: weakDishes.length }),
      metric: t('issues.menu.metricReal', { count: weakDishes.length }),
    });
  }

  // If no issues found from real data — show pleasant "all clear" state
  const allClear = !loading && !error && issues.length === 0;

  // ── top recommendation (real) ────────────────────────────────────────────

  const recommendation = worstDish ? {
    priority: 1,
    title: t('recommendation.titleReal', { name: worstDish.name }),
    description: t('recommendation.descriptionReal', {
      name: worstDish.name,
      margin: worstMarginText ?? '—',
    }),
    action: t('recommendation.action'),
    expectedImpact: worstDishImpact ?? t('recommendation.expectedImpact'),
    href: `/${locale}/dishes`,
  } : null;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-6 py-10 max-w-7xl animate-in fade-in duration-700">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <AssistantHeader />
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="mt-1 shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="text-sm font-medium">{t('loading')}</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/30 flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-rose-700 dark:text-rose-300">{t('errorTitle')}</p>
                <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* All clear */}
          {allClear && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-900 dark:bg-emerald-950/30 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="font-black text-emerald-700 dark:text-emerald-300 text-xl uppercase tracking-tight">
                {t('allClear.title')}
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                {t('allClear.description')}
              </p>
            </div>
          )}

          {!loading && !error && issues.length > 0 && (
            <>
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
              {recommendation && (
                <section className="space-y-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 text-center">
                    {t('step2.title')}
                  </h2>
                  <div className="max-w-3xl mx-auto">
                    <RecommendationCard {...recommendation} />
                  </div>
                </section>
              )}

              {/* Шаг 3: Следующие действия */}
              <section className="space-y-6 pb-20">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 text-center">
                  {t('step3.title')}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
                  <NextAction
                    title={t('nextActions.checkDishes.title')}
                    description={
                      menuPotentialText
                        ? t('nextActions.checkDishes.descriptionReal', { potential: menuPotentialText })
                        : t('nextActions.checkDishes.description')
                    }
                    href={`/${locale}/menu-engineering`}
                  />
                  <NextAction
                    title={t('nextActions.useExpiring.title')}
                    description={
                      hasExpiryIssue
                        ? t('nextActions.useExpiring.descriptionReal', {
                            names: expiringAlerts.slice(0, 2).map(a => a.product_name).join(', '),
                          })
                        : t('nextActions.useExpiring.description')
                    }
                    href={`/${locale}/inventory`}
                  />
                </div>
              </section>

              {/* Bot state warnings */}
              {assistantState?.warnings && assistantState.warnings.length > 0 && (
                <div className="space-y-2 pb-8">
                  {assistantState.warnings.map((w, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-4 text-sm ${
                        w.level === 'error'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300'
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300'
                      }`}
                    >
                      {w.message}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

