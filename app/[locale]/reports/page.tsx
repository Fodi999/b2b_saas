'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDishesStore } from '@/lib/stores/dishes-store'
import { useInventoryStore, type InventoryItem } from '@/lib/stores/inventory-store'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
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
  AlertCircle, 
  BarChart3, 
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PeriodType = 'today' | '7days' | '30days' | 'custom'
type ModeType = 'overview' | 'profit' | 'inventory' | 'ai'
type DishFilterType = 'all' | 'star' | 'problem' | 'low-margin' | 'risk'

export default function ReportsPage() {
  const { user } = useAuthStore()
  const { dishes } = useDishesStore()
  const { items: inventoryItems } = useInventoryStore()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('reports');

  const [period, setPeriod] = useState<PeriodType>('30days')
  const [mode, setMode] = useState<ModeType>('overview')
  const [dishFilter, setDishFilter] = useState<DishFilterType>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = 12400 
    const totalProfit = 3180 
    const avgFoodCost = dishes.length > 0 
      ? dishes.reduce((sum, d) => sum + d.foodCostPercent, 0) / dishes.length 
      : 24
    const potentialGrowth = 640 

    return { revenue: totalRevenue, profit: totalProfit, avgFoodCost, potentialGrowth }
  }, [dishes])

  // Calculate inventory metrics
  const inventoryMetrics = useMemo(() => {
    const totalValue = inventoryItems.reduce((sum: number, item: InventoryItem) => sum + (item.price || 0), 0)
    const expiringValue = inventoryItems
      .filter((item: InventoryItem) => item.status === 'expiring')
      .reduce((sum: number, item: InventoryItem) => sum + (item.price || 0), 0)
    const potentialLoss = expiringValue * 0.43 

    return {
      totalValue,
      expiringValue,
      potentialLoss,
      expiringItems: inventoryItems.filter((item: InventoryItem) => item.status === 'expiring'),
    }
  }, [inventoryItems])

  // Filter dishes
  const filteredDishes = useMemo(() => {
    switch (dishFilter) {
      case 'star': return dishes.filter(d => d.foodCostPercent < 30)
      case 'problem': return dishes.filter(d => d.foodCostPercent >= 40)
      case 'low-margin': return dishes.filter(d => d.marginPercent < 50)
      case 'risk': return dishes.filter(d => d.warnings && d.warnings.length > 0)
      default: return dishes
    }
  }, [dishes, dishFilter])

  // AI recommendations
  const aiRecommendations = useMemo(() => {
    const recs = []
    const lowMarginDish = dishes.find(d => d.marginPercent < 20)
    if (lowMarginDish) recs.push({ id: '1', title: `${lowMarginDish.name} (маржа ${lowMarginDish.marginPercent.toFixed(1)}%)`, impact: '+180 PLN/мес' })
    const priceIncreaseDish = dishes.find(d => d.foodCostPercent > 35 && d.foodCostPercent < 50)
    if (priceIncreaseDish) recs.push({ id: '2', title: `Поднять цену на ${priceIncreaseDish.name}`, impact: '+180 PLN/мес' })
    if (inventoryMetrics.expiringItems.length > 0) {
      const topExpiring = inventoryMetrics.expiringItems[0]
      recs.push({ id: '3', title: `Использовать ${topExpiring.product_name} в 2 рецептах`, impact: `Сэкономить ${topExpiring.price.toFixed(0)} PLN` })
    }
    return recs
  }, [dishes, inventoryMetrics])

  if (!user) return null

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="container mx-auto px-6 py-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[1.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-black border border-white/10 shadow-2xl">
                  <BarChart3 className="h-10 w-10 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                   <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
                      {t('header.title')}<span className="text-indigo-500">{t('header.core')}</span>
                   </h1>
                   <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-500/20 glass-portal">
                      <Activity className="h-3.5 w-3.5 animate-pulse" />
                      <span className="text-[12px] font-black tracking-[0.2em] uppercase">{t('header.sync')}</span>
                   </div>
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] ml-1">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="h-14 px-8 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
              <Button className="h-14 px-10 rounded-[2rem] bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95">
                <Download className="h-4 w-4 mr-3" />
                {t('actions.export')}
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-8 bg-white/[0.03] backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center gap-1 p-1.5 bg-black/40 rounded-2xl border border-white/5">
               {(['today', '7days', '30days', 'custom'] as PeriodType[]).map((p) => (
                  <Button 
                    key={p} 
                    variant="ghost"
                    size="sm" 
                    className={cn(
                      "rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest transition-all",
                      period === p ? "bg-indigo-500 text-white shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setPeriod(p)}
                  >
                    {t(`periods.${p}`)}
                  </Button>
               ))}
            </div>
            <div className="flex items-center gap-1 p-1.5 bg-black/40 rounded-2xl border border-white/5">
              {(['overview', 'profit', 'inventory', 'ai'] as ModeType[]).map((m) => (
                 <Button 
                  key={m} 
                  variant="ghost"
                  size="sm" 
                  className={cn(
                    "rounded-xl h-10 px-6 font-black uppercase text-[10px] tracking-widest transition-all",
                    mode === m ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => setMode(m)}
                >
                   {t(`modes.${m}`)}
                 </Button>
              ))}
            </div>
          </div>

          {/* AI Vision Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 via-black to-black border border-indigo-500/30 rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 rotate-12 scale-150">
              <Sparkles className="h-64 w-64 text-indigo-400" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative flex-shrink-0 w-24 h-24 bg-black/50 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center border border-indigo-500/30">
                    <Zap className="h-12 w-12 text-indigo-400" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-4 mb-6 justify-center md:justify-start">
                    <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">
                      {t('aiSummary.badge')} · {t(`periods.${period}`)}
                    </Badge>
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <Target className="w-4 h-4" />
                      84% Accuracy
                    </div>
                  </div>

                  <h2 className="text-4xl font-black mb-8 tracking-tighter italic uppercase leading-tight max-w-2xl">
                    {t('aiSummary.title', { percent: 84 })}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/[0.03] p-6 rounded-[2rem] backdrop-blur-md border border-white/10 group/item hover:border-indigo-500/40 transition-all">
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{t('aiSummary.profit')}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-white italic">+{kpis.profit.toFixed(0)}</p>
                        <span className="text-xs font-bold text-white/20 uppercase">PLN</span>
                      </div>
                    </div>
                    <div className="bg-white/[0.03] p-6 rounded-[2rem] backdrop-blur-md border border-white/10 group/item hover:border-rose-500/40 transition-all">
                       <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{t('aiSummary.losses')}</p>
                       <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-rose-500 italic">–{inventoryMetrics.potentialLoss.toFixed(0)}</p>
                        <span className="text-xs font-bold text-white/20 uppercase">PLN</span>
                      </div>
                    </div>
                    <div className="bg-white/[0.03] p-6 rounded-[2rem] backdrop-blur-md border border-white/10 group/item hover:border-emerald-500/40 transition-all">
                       <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{t('aiSummary.growth')}</p>
                       <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-emerald-400 italic">+{kpis.potentialGrowth.toFixed(0)}</p>
                        <span className="text-xs font-bold text-white/20 uppercase">PLN</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 group hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('kpi.revenue')}</p>
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-black text-white italic tracking-tighter">{kpis.revenue.toFixed(0)}</span>
                    <span className="text-sm font-bold text-white/20 uppercase">PLN</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 inline-block">
                    {t('kpi.revenueGrowth')}
                  </p>
                </div>

                {/* Food Cost Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 group hover:border-amber-500/40 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t('kpi.foodCost')}</p>
                    <div className={cn("p-2 rounded-lg", kpis.avgFoodCost < 30 ? "bg-emerald-500/10" : "bg-amber-500/10")}>
                      <TrendingDown className={cn("h-5 w-5", kpis.avgFoodCost < 30 ? "text-emerald-400" : "text-amber-400")} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className={cn("text-4xl font-black italic tracking-tighter", kpis.avgFoodCost < 30 ? "text-emerald-400" : "text-amber-400")}>
                      {kpis.avgFoodCost.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 inline-block">
                    {t('kpi.foodCostTarget')}
                  </p>
                </div>
              </div>

              {/* Profitability Analysis Table/List */}
              <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] overflow-hidden">
                <div className="p-10 border-b border-white/5">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDishes.map(dish => (
                      <div key={dish.id} className="group p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-indigo-500/40 transition-all relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10">
                           <Star className="w-12 h-12 text-white" />
                         </div>
                         <div className="flex items-center justify-between mb-6">
                            <h4 className="font-black text-white italic uppercase tracking-tight truncate pr-4">{dish.name}</h4>
                            <Badge className={cn(
                              "px-3 py-0.5 rounded-full font-black text-[9px] border-none uppercase tracking-widest",
                              dish.foodCostPercent < 30 ? "bg-emerald-500/20 text-emerald-400" : 
                              dish.foodCostPercent < 45 ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                              {dish.foodCostPercent < 30 ? 'High Performance' : 'Standard'}
                            </Badge>
                         </div>
                         <div className="grid grid-cols-2 gap-6 relative z-10">
                           <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{t('profitAnalysis.card.margin')}</p>
                             <p className="text-xl font-black text-white italic tracking-tighter">{dish.marginPercent.toFixed(1)}%</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{t('profitAnalysis.card.fc')}</p>
                             <p className={cn("text-xl font-black italic tracking-tighter", dish.foodCostPercent > 35 ? "text-rose-500" : "text-emerald-400")}>
                               {dish.foodCostPercent.toFixed(1)}%
                             </p>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
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
                        <p className="text-3xl font-black text-rose-500 italic tracking-tighter">{inventoryMetrics.expiringValue.toFixed(0)}</p>
                        <span className="text-[10px] font-bold text-rose-500/40 uppercase">PLN</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {inventoryMetrics.expiringItems.slice(0, 5).map(item => (
                         <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="min-w-0 pr-4">
                              <p className="text-[11px] font-black text-white uppercase tracking-tight truncate">{item.product_name}</p>
                              <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest mt-1">Exp: {item.status}</p>
                            </div>
                            <p className="font-black text-white/40 italic">-{item.price.toFixed(0)}</p>
                         </div>
                      ))}
                    </div>
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
                         <Button className="w-full h-11 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            {t('aiPlan.apply')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                         </Button>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
