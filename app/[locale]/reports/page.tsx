'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter, useParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import {
  Sparkles,
  ArrowLeft,
  Download,
  Package2,
  Star,
  BarChart3,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReportsData } from '@/lib/hooks/use-reports-data'
import type { DishDTO } from '@/lib/api/dishes'
import Link from 'next/link';

type PeriodType = 'today' | '7days' | '30days' | 'custom'
type ModeType = 'overview' | 'profit' | 'inventory' | 'ai'
type DishFilterType = 'all' | 'star' | 'problem' | 'low-margin'

// ── helpers ──────────────────────────────────────────────────────────────────

function formatPLN(cents: number) {
  return (cents / 100).toLocaleString('pl-PL', { maximumFractionDigits: 0 });
}

function getDishBadge(dish: DishDTO) {
  const fc = dish.food_cost_percent ?? 0;
  if (fc < 25) return { label: 'Star ⭐', cls: 'bg-emerald-500/20 text-emerald-400' };
  if (fc < 35) return { label: 'High Performance', cls: 'bg-emerald-500/20 text-emerald-400' };
  if (fc < 45) return { label: 'Standard', cls: 'bg-amber-500/20 text-amber-400' };
  return { label: 'Problem ⚠', cls: 'bg-rose-500/20 text-rose-400' };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user, accessToken } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('reports');

  const [period, setPeriod] = useState<PeriodType>('30days')
  const [mode, setMode] = useState<ModeType>('overview')
  const [dishFilter, setDishFilter] = useState<DishFilterType>('all')

  // Map UI period to API key
  const periodKey = period === 'custom' ? '30days' : period;
  const { summary, dishes, menuEngineering, alerts, lossReport, loading, error, refresh } = useReportsData(periodKey);

  // ── KPIs (prefer /api/reports/summary, fallback to computed) ──────────────

  const kpis = useMemo(() => {
    // Revenue
    const revenueCents = summary?.total_revenue_cents ?? summary?.revenue_cents ?? 0;
    // Profit
    const profitCents = summary?.total_profit_cents ?? summary?.profit_cents ?? 0;
    // Food cost %
    const foodCostPct = summary?.food_cost_percent ??
      (dishes.length > 0
        ? dishes.reduce((s, d) => s + (d.food_cost_percent ?? 0), 0) / dishes.length
        : 0);
    // Waste
    const wasteCents = summary?.waste_cents ?? (lossReport?.total_loss_cents ?? 0);
    // Menu accuracy: stars / total dishes × 100
    const totalBCG = (menuEngineering?.categories.stars.length ?? 0) +
      (menuEngineering?.categories.plowhorses.length ?? 0) +
      (menuEngineering?.categories.puzzles.length ?? 0) +
      (menuEngineering?.categories.dogs.length ?? 0);
    const starCount = menuEngineering?.categories.stars.length ?? summary?.stars ?? 0;
    const accuracy = totalBCG > 0 ? Math.round((starCount / totalBCG) * 100) : 0;
    // Potential growth: sum of ai_recommendation uplifts (estimate 5% of revenue)
    const growthCents = revenueCents > 0 ? Math.round(revenueCents * 0.05) : 0;

    return { revenueCents, profitCents, foodCostPct, wasteCents, accuracy, growthCents };
  }, [summary, dishes, menuEngineering, lossReport]);

  // ── Dish profitability list ────────────────────────────────────────────────

  const filteredDishes = useMemo(() => {
    switch (dishFilter) {
      case 'star':       return dishes.filter(d => (d.food_cost_percent ?? 0) < 30);
      case 'problem':    return dishes.filter(d => (d.food_cost_percent ?? 0) >= 45);
      case 'low-margin': return dishes.filter(d => (d.profit_margin_percent ?? 0) < 50);
      default:           return dishes;
    }
  }, [dishes, dishFilter]);

  // ── AI Recommendations (from real data) ───────────────────────────────────

  const aiRecommendations = useMemo(() => {
    const recs: { id: string; title: string; impact: string; href: string }[] = [];

    // 1. Worst margin dish → raise price
    const worst = [...dishes].sort((a, b) => (a.profit_margin_percent ?? 0) - (b.profit_margin_percent ?? 0))[0];
    if (worst && (worst.profit_margin_percent ?? 100) < 50) {
      const uplift = worst.selling_price_cents > 0
        ? formatPLN(Math.round(worst.selling_price_cents * 0.15 * 30))
        : '—';
      recs.push({
        id: 'price-raise',
        title: t('aiPlan.raisePriceFor', { name: worst.name }),
        impact: `+${uplift} PLN/${t('aiPlan.perMonth')}`,
        href: `/${locale}/dishes`,
      });
    }

    // 2. Waste optimization
    const wastePercent = lossReport?.waste_percentage ?? 0;
    const wasteSave = lossReport ? Math.round((lossReport.total_loss_cents / 100) * 0.3) : 0;
    if (wastePercent > 5) {
      recs.push({
        id: 'waste',
        title: t('aiPlan.optimizeWaste', { pct: wastePercent.toFixed(1) }),
        impact: t('aiPlan.save', { amount: wasteSave }),
        href: `/${locale}/inventory`,
      });
    }

    // 3. BCG dogs → remove or reprice
    const dogs = menuEngineering?.categories.dogs ?? [];
    if (dogs.length > 0) {
      recs.push({
        id: 'dogs',
        title: t('aiPlan.reviewDogs', { count: dogs.length }),
        impact: t('aiPlan.menuImpact'),
        href: `/${locale}/menu-engineering`,
      });
    }

    // 4. Expiring soon → use in recipes
    if (alerts.length > 0) {
      recs.push({
        id: 'expiry',
        title: t('aiPlan.useExpiring', { name: alerts[0].product_name }),
        impact: t('aiPlan.preventLoss'),
        href: `/${locale}/inventory`,
      });
    }

    return recs.slice(0, 4);
  }, [dishes, lossReport, menuEngineering, alerts, t, locale]);

  // ── Expiring items risk value ─────────────────────────────────────────────

  const expiringRiskCents = useMemo(() => {
    // Use alerts count × average item value as approximation
    return alerts.length * 1000; // 10 PLN per alert as rough estimate
  }, [alerts]);

  // ── BCG summary counts ────────────────────────────────────────────────────

  const bcgCounts = useMemo(() => ({
    stars:      menuEngineering?.categories.stars.length ?? 0,
    plowhorses: menuEngineering?.categories.plowhorses.length ?? 0,
    puzzles:    menuEngineering?.categories.puzzles.length ?? 0,
    dogs:       menuEngineering?.categories.dogs.length ?? 0,
  }), [menuEngineering]);

  if (!user) {
    router.push(`/${locale}/login`);
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-6 sm:space-y-10">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[1rem] sm:rounded-[1.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] bg-black border border-white/10 shadow-2xl">
                  <BarChart3 className="h-6 w-6 sm:h-10 sm:w-10 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <h1 className="text-2xl sm:text-5xl font-black tracking-tighter italic uppercase leading-none">
                    {t('header.title')}<span className="text-indigo-500">{t('header.core')}</span>
                  </h1>
                  <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full border border-indigo-500/20">
                    <Activity className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 animate-pulse" />
                    <span className="text-[8px] sm:text-[12px] font-black tracking-[0.2em] uppercase">{t('header.sync')}</span>
                  </div>
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[7px] sm:text-[10px] ml-1">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="h-10 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-[2rem] font-black uppercase text-[9px] tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={refresh}
                disabled={loading}
                variant="ghost"
                className="h-10 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-[2rem] font-black uppercase text-[9px] tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                {t('actions.refresh')}
              </Button>
              <Button className="h-10 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-[2rem] bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[9px] tracking-[0.2em] shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95">
                <Download className="h-4 w-4 mr-2" />
                {t('actions.export')}
              </Button>
            </div>
          </div>

          {/* ── Error banner ───────────────────────────────────────────── */}
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <p className="text-sm text-rose-300 font-medium">{error}</p>
            </div>
          )}

          {/* ── Period + Mode filters ───────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 bg-white/[0.03] backdrop-blur-xl p-2 sm:p-4 rounded-2xl sm:rounded-[2.5rem] border border-white/10 overflow-hidden">
            <div className="flex overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 shrink-0">
                {(['today', '7days', '30days', 'custom'] as PeriodType[]).map((p) => (
                  <Button
                    key={p}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-lg sm:rounded-xl h-7 sm:h-10 px-3 sm:px-6 font-black uppercase text-[7px] sm:text-[10px] tracking-widest transition-all whitespace-nowrap",
                      period === p ? "bg-indigo-500 text-white shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setPeriod(p)}
                  >
                    {t(`periods.${p}`)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 shrink-0">
                {(['overview', 'profit', 'inventory', 'ai'] as ModeType[]).map((m) => (
                  <Button
                    key={m}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-lg sm:rounded-xl h-8 sm:h-10 px-4 sm:px-6 font-black uppercase text-[8px] sm:text-[10px] tracking-widest transition-all whitespace-nowrap",
                      mode === m ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setMode(m)}
                  >
                    {t(`modes.${m}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* ── AI Vision Card ─────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-indigo-900/40 via-black to-black border border-indigo-500/30 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 rotate-12 scale-150">
              <Sparkles className="h-48 w-48 sm:h-64 sm:w-64 text-indigo-400" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-black/50 backdrop-blur-3xl rounded-[1.2rem] sm:rounded-[2rem] flex items-center justify-center border border-indigo-500/30">
                    {loading
                      ? <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-indigo-400 animate-spin" />
                      : <Zap className="h-8 w-8 sm:h-12 sm:w-12 text-indigo-400" />
                    }
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 justify-center md:justify-start">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-black uppercase text-[8px] sm:text-[10px] tracking-[0.2em]">
                      {t('aiSummary.badge')} · {t(`periods.${period}`)}
                    </Badge>
                    {kpis.accuracy > 0 && (
                      <div className="flex items-center gap-2 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                        {kpis.accuracy}% Accuracy
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black mb-6 sm:mb-8 tracking-tighter italic uppercase leading-tight max-w-2xl">
                    {loading
                      ? t('aiSummary.loading')
                      : kpis.accuracy > 0
                        ? t('aiSummary.title', { percent: kpis.accuracy })
                        : t('aiSummary.titleDefault')
                    }
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Profit */}
                    <div className="bg-white/[0.03] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] backdrop-blur-md border border-white/10 hover:border-indigo-500/40 transition-all">
                      <p className="text-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-3">{t('aiSummary.profit')}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl font-black text-white italic">
                          {loading ? '—' : `+${formatPLN(kpis.profitCents)}`}
                        </p>
                        <span className="text-[10px] font-bold text-white/20 uppercase">PLN</span>
                      </div>
                    </div>
                    {/* Losses */}
                    <div className="bg-white/[0.03] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] backdrop-blur-md border border-white/10 hover:border-rose-500/40 transition-all">
                      <p className="text-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-3">{t('aiSummary.losses')}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl font-black text-rose-500 italic">
                          {loading ? '—' : `–${formatPLN(kpis.wasteCents)}`}
                        </p>
                        <span className="text-[10px] font-bold text-white/20 uppercase">PLN</span>
                      </div>
                    </div>
                    {/* Growth potential */}
                    <div className="bg-white/[0.03] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] backdrop-blur-md border border-white/10 hover:border-emerald-500/40 transition-all sm:col-span-2 md:col-span-1">
                      <p className="text-white/30 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-3">{t('aiSummary.growth')}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl font-black text-emerald-400 italic">
                          {loading ? '—' : `+${formatPLN(kpis.growthCents)}`}
                        </p>
                        <span className="text-[10px] font-bold text-white/20 uppercase">PLN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main content grid ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* LEFT: KPIs + Dish list */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">

              {/* Revenue + Food Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Revenue */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[1.8rem] sm:rounded-[2.5rem] p-6 sm:p-8 group hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('kpi.revenue')}</p>
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter">
                      {loading ? '—' : formatPLN(kpis.revenueCents)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white/20 uppercase">PLN</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 inline-block">
                    {t('kpi.revenueGrowth')}
                  </p>
                </div>

                {/* Food Cost */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[1.8rem] sm:rounded-[2.5rem] p-6 sm:p-8 group hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('kpi.foodCost')}</p>
                    <div className={cn("p-2 rounded-lg", kpis.foodCostPct < 30 ? "bg-emerald-500/10" : "bg-amber-500/10")}>
                      <TrendingDown className={cn("h-5 w-5", kpis.foodCostPct < 30 ? "text-emerald-400" : "text-amber-400")} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                    <span className={cn("text-3xl font-black italic tracking-tighter", kpis.foodCostPct < 30 ? "text-emerald-400" : "text-amber-400")}>
                      {loading ? '—' : `${kpis.foodCostPct.toFixed(1)}%`}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-flex items-center gap-1.5",
                    kpis.foodCostPct < 30
                      ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10"
                      : "text-amber-400 bg-amber-500/5 border-amber-500/10"
                  )}>
                    {kpis.foodCostPct < 30
                      ? <><CheckCircle2 className="h-3 w-3" />{t('kpi.foodCostTarget')}</>
                      : t('kpi.foodCostTarget')
                    }
                  </p>
                </div>
              </div>

              {/* BCG summary badges (visible when menu engineering data loaded) */}
              {!loading && menuEngineering && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { key: 'stars', label: '⭐ Stars', count: bcgCounts.stars, cls: 'border-emerald-500/30 text-emerald-400' },
                    { key: 'plowhorses', label: '🐴 Plowhorses', count: bcgCounts.plowhorses, cls: 'border-amber-500/30 text-amber-400' },
                    { key: 'puzzles', label: '❓ Puzzles', count: bcgCounts.puzzles, cls: 'border-indigo-500/30 text-indigo-400' },
                    { key: 'dogs', label: '🐕 Dogs', count: bcgCounts.dogs, cls: 'border-rose-500/30 text-rose-400' },
                  ].map(b => (
                    <div key={b.key} className={cn("bg-white/[0.03] border rounded-2xl p-4 text-center", b.cls)}>
                      <p className="text-xl font-black">{b.count}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mt-1">{b.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Dish profitability analysis */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] overflow-hidden">
                <div className="p-8 sm:p-10 border-b border-white/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-1">{t('profitAnalysis.title')}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{t('profitAnalysis.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                      {(['all', 'star', 'problem', 'low-margin'] as DishFilterType[]).map((f) => {
                        const filterKey = f === 'low-margin' ? 'lowMargin' : f;
                        return (
                          <Button
                            key={f}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-9 text-[10px] font-black uppercase px-5 rounded-xl transition-all",
                              dishFilter === f ? "bg-white text-black" : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                            onClick={() => setDishFilter(f)}
                          >
                            {f === 'all' ? t('profitAnalysis.filters.all') : t(`profitAnalysis.filters.${filterKey}`)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-white/30">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm font-black uppercase tracking-widest">{t('loading')}</span>
                    </div>
                  ) : filteredDishes.length === 0 ? (
                    <div className="text-center py-16 text-white/20">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p className="font-black uppercase text-sm tracking-widest">{t('profitAnalysis.empty')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDishes.map(dish => {
                        const badge = getDishBadge(dish);
                        return (
                          <div key={dish.id} className="group p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-indigo-500/40 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10">
                              <Star className="w-12 h-12 text-white" />
                            </div>
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="font-black text-white italic uppercase tracking-tight truncate pr-4">{dish.name}</h4>
                              <Badge className={cn("px-3 py-0.5 rounded-full font-black text-[9px] border-none uppercase tracking-widest", badge.cls)}>
                                {badge.label}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{t('profitAnalysis.card.margin')}</p>
                                <p className="text-xl font-black text-white italic tracking-tighter">
                                  {dish.profit_margin_percent !== null ? `${dish.profit_margin_percent.toFixed(1)}%` : '—'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{t('profitAnalysis.card.fc')}</p>
                                <p className={cn("text-xl font-black italic tracking-tighter", (dish.food_cost_percent ?? 0) > 35 ? "text-rose-500" : "text-emerald-400")}>
                                  {dish.food_cost_percent !== null ? `${dish.food_cost_percent.toFixed(1)}%` : '—'}
                                </p>
                              </div>
                            </div>
                            {dish.selling_price_cents > 0 && (
                              <p className="mt-3 text-[9px] text-white/20 font-bold">
                                {t('profitAnalysis.card.price')}: {formatPLN(dish.selling_price_cents)} PLN
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Inventory risks + AI Plan */}
            <div className="space-y-8">

              {/* Inventory Risks */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <Package2 className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                    {t('inventoryRisks.title')}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/10 mb-6">
                    <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mb-1">{t('inventoryRisks.expiring')}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-rose-500 italic tracking-tighter">
                        {loading ? '—' : formatPLN(expiringRiskCents)}
                      </p>
                      <span className="text-[10px] font-bold text-rose-500/40 uppercase">PLN</span>
                    </div>
                    {alerts.length > 0 && (
                      <p className="text-[9px] text-rose-400/60 mt-1 font-bold">{alerts.length} {t('inventoryRisks.items')}</p>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('inventoryRisks.allGood')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.slice(0, 5).map(alert => (
                        <div key={alert.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="min-w-0 pr-4">
                            <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{alert.product_name}</p>
                            <p className={cn("text-[9px] font-bold uppercase tracking-widest mt-1",
                              alert.severity === 'critical' ? 'text-rose-500/60' : 'text-amber-500/60'
                            )}>
                              {alert.message}
                            </p>
                          </div>
                          <Badge className={cn("shrink-0 font-black text-[8px] border-none",
                            alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                          )}>
                            {alert.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {alerts.length > 0 && (
                    <Link href={`/${locale}/inventory`}>
                      <Button variant="ghost" className="w-full mt-2 h-10 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white border border-white/5 hover:border-white/20 rounded-2xl transition-all">
                        {t('inventoryRisks.manage')} <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* AI Strategic Plan */}
              <div className="bg-black border border-indigo-500/30 rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_0_50px_-20px_rgba(99,102,241,0.3)]">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles className="w-24 h-24 text-white" />
                </div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <Zap className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-indigo-400">
                    {t('aiPlan.title')}
                  </h3>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-400/40" />
                  </div>
                ) : aiRecommendations.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('aiPlan.allOptimal')}</p>
                  </div>
                ) : (
                  <div className="space-y-4 relative z-10">
                    {aiRecommendations.map((rec) => (
                      <div key={rec.id} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 space-y-4 group hover:bg-white/[0.05] transition-all">
                        <div>
                          <p className="text-sm font-black text-white leading-tight italic mb-2">{rec.title}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('aiPlan.effect')}</span>
                            <span className="text-[11px] font-bold text-emerald-400">{rec.impact}</span>
                          </div>
                        </div>
                        <Link href={rec.href}>
                          <Button className="w-full h-11 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            {t('aiPlan.apply')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Waste KPI block */}
              {lossReport && !loading && (
                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                      <AlertCircle className="h-5 w-5 text-rose-400" />
                    </div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                      {t('wasteKpi.title')}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('wasteKpi.totalLoss')}</span>
                      <span className="font-black text-rose-400 italic">{formatPLN(lossReport.total_loss_cents)} PLN</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t('wasteKpi.wastePct')}</span>
                      <span className={cn("font-black italic", lossReport.waste_percentage > 10 ? "text-rose-400" : "text-amber-400")}>
                        {lossReport.waste_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
