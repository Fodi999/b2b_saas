'use client';

import React from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Store, ArrowRight, ShieldCheck, Sparkles, Zap, Package, BookOpen, Utensils, PieChart, MessageSquare, BarChart3, Activity, AlertCircle, AlertTriangle } from 'lucide-react';
import AIAlerts from '@/components/dashboard/ai-alerts';
import { useInventoryAnalytics } from '@/lib/hooks/use-inventory-analytics';
import Link from 'next/link';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  inventory: Package,
  recipes: BookOpen,
  dishes: Utensils,
  menuEngineering: PieChart,
  aiAssistant: MessageSquare,
  reports: BarChart3,
};

export default function DashboardPage() {
  const { user, tenant, logout } = useAuthStore();
  const { health, lossReport, dashboard, loading: analyticsLoading } = useInventoryAnalytics();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard');

  // Защита роута
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
    }
  }, [user, router, locale]);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  if (!user) return null;

  const modules = [
    { key: 'inventory', name: t('modules.inventory'), icon: 'inventory', description: t('modules.inventoryDesc'), color: 'indigo' },
    { key: 'recipes', name: t('modules.recipes'), icon: 'recipes', description: t('modules.recipesDesc'), color: 'violet' },
    { key: 'dishes', name: t('modules.dishes'), icon: 'dishes', description: t('modules.dishesDesc'), color: 'emerald' },
    { key: 'menuEngineering', name: t('modules.menuEngineering'), icon: 'menuEngineering', description: t('modules.menuEngineeringDesc'), color: 'amber' },
    { key: 'aiAssistant', name: t('modules.aiAssistant'), icon: 'aiAssistant', description: t('modules.aiAssistantDesc'), color: 'blue' },
    { key: 'reports', name: t('modules.reports'), icon: 'reports', description: t('modules.reportsDesc'), color: 'rose' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl animate-in fade-in duration-700">
        <div className="space-y-6 sm:space-y-10">
          
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 group flex-shrink-0">
                <LayoutDashboard className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                   <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                      Portal <span className="text-indigo-600">Core</span>
                   </h1>
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-100/50">
                      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase">Operational</span>
                   </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                    {t('welcome', { name: user.display_name?.split(' ')[0] || user.email.split('@')[0] })}
                  </p>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  {tenant && (
                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-[10px] sm:text-sm bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                      <Store className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                      {tenant.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <Button variant="ghost" onClick={handleLogout} className="h-10 sm:h-12 w-full sm:w-auto px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200 sm:border-transparent hover:border-rose-100">
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
             {/* Main AI Feed */}
              <div className="lg:col-span-3 space-y-6 sm:space-y-8">
                {/* 🔥 V3: Inventory Health Banner (RS 2026 Edition) */}
                {(health || dashboard) && (
                  <div className="relative overflow-hidden group rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-1000 rotate-12 hidden md:block">
                      <ShieldCheck className="h-48 w-48" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8 w-full sm:w-auto">
                        {/* Circular Progress (Section 7) */}
                        <div className="relative flex-shrink-0">
                          <svg className="h-16 w-16 sm:h-28 sm:w-28 -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="text-slate-100 dark:text-slate-800 sm:hidden"
                            />
                            <circle
                              cx="56"
                              cy="56"
                              r="48"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              className="text-slate-100 dark:text-slate-800 hidden sm:block"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeDasharray={2 * Math.PI * 28}
                              strokeDashoffset={2 * Math.PI * 28 * (1 - (dashboard?.health_score ?? health?.health_score ?? 0) / 100)}
                              strokeLinecap="round"
                              className={cn(
                                "transition-all duration-1000 ease-out sm:hidden",
                                (dashboard?.health_score ?? health?.health_score ?? 0) >= 80 ? "text-emerald-500" :
                                (dashboard?.health_score ?? health?.health_score ?? 0) >= 50 ? "text-amber-500" : "text-rose-500"
                              )}
                            />
                             <circle
                              cx="56"
                              cy="56"
                              r="48"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeDasharray={2 * Math.PI * 48}
                              strokeDashoffset={2 * Math.PI * 48 * (1 - (dashboard?.health_score ?? health?.health_score ?? 0) / 100)}
                              strokeLinecap="round"
                              className={cn(
                                "transition-all duration-1000 ease-out hidden sm:block",
                                (dashboard?.health_score ?? health?.health_score ?? 0) >= 80 ? "text-emerald-500" :
                                (dashboard?.health_score ?? health?.health_score ?? 0) >= 50 ? "text-amber-500" : "text-rose-500"
                              )}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm sm:text-2xl font-black italic">{dashboard?.health_score ?? health?.health_score ?? 0}%</span>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4 flex-1">
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                            <div className="relative">
                              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                {t('v3.healthTitle')} <span className="text-indigo-600">{t('v3.healthSub')}</span>
                              </h3>
                              {(health?.badge_count ?? 0) > 0 && (
                                <span className="absolute -top-1 -right-2 flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] font-black items-center justify-center text-white">
                                    {health?.badge_count}
                                  </span>
                                </span>
                              )}
                            </div>
                            <Badge className={cn(
                              "text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 border-none",
                              (health?.status === 'Excellent' || (dashboard?.health_score ?? 0) >= 90) ? "bg-emerald-500 text-white" :
                              (health?.status === 'Good' || (dashboard?.health_score ?? 0) >= 70) ? "bg-indigo-500 text-white" :
                              (health?.status === 'Warning' || (dashboard?.health_score ?? 0) >= 40) ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                            )}>
                              {dashboard 
                                ? (dashboard.health_score >= 90 ? t('v3.healthStatus.excellent') : dashboard.health_score >= 70 ? t('v3.healthStatus.good') : dashboard.health_score >= 40 ? t('v3.healthStatus.warning') : t('v3.healthStatus.critical')) 
                                : (health?.status ? t(`v3.healthStatus.${health.status.toLowerCase()}`) : t('v3.healthStatus.good'))}
                            </Badge>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed text-xs sm:text-sm">
                            {(dashboard?.health_score ?? health?.health_score ?? 0) >= 80 
                              ? t('v3.healthDesc.good') 
                              : t('v3.healthDesc.issues')}
                          </p>
                          
                          {/* Metrics row (Section 7) */}
                          <div className="grid grid-cols-3 sm:flex items-center justify-center sm:justify-start gap-2 sm:gap-6 pt-1 w-full max-w-[280px] sm:max-w-none">
                             <div className="flex flex-col items-center sm:items-start">
                                <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{t('v3.metrics.risks')}</span>
                                <span className={cn("text-sm sm:text-lg font-black italic", (dashboard?.expired_risks.length ?? 0) > 0 ? "text-rose-500" : "text-slate-900 dark:text-white")}>
                                  {dashboard?.expired_risks.length ?? health?.expired ?? 0}
                                </span>
                             </div>
                             <div className="hidden sm:block w-px h-6 bg-slate-100 dark:bg-slate-800" />
                             <div className="flex flex-col items-center sm:items-start">
                                <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{t('v3.metrics.stockouts')}</span>
                                <span className={cn("text-sm sm:text-lg font-black italic", (dashboard?.stockout_risks.length ?? 0) > 0 ? "text-amber-500" : "text-slate-900 dark:text-white")}>
                                  {dashboard?.stockout_risks.length ?? health?.low_stock ?? 0}
                                </span>
                             </div>
                             <div className="hidden sm:block w-px h-6 bg-slate-100 dark:bg-slate-800" />
                             <div className="flex flex-col items-center sm:items-start">
                                <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400">{t('v3.metrics.critical')}</span>
                                <span className={cn("text-sm sm:text-lg font-black italic", (health?.critical ?? 0) > 0 ? "text-rose-600" : "text-slate-900 dark:text-white")}>
                                  {health?.critical ?? 0}
                                </span>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button 
                          onClick={() => router.push(`/${locale}/inventory`)}
                          className="h-12 sm:h-14 w-full sm:px-10 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 gap-3 group/btn"
                        >
                          {t('v3.optimizeBtn')}
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🔥 V3: Predictive Analytics (Stockout Predictions) */}
                {dashboard ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
                      <CardHeader className="p-6 sm:p-8 pb-4 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{t('v3.predictiveTitle')}</p>
                          <CardTitle className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">{t('v3.stockoutTitle')}</CardTitle>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-5 w-5" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
                        {dashboard.stockout_risks.length > 0 ? (
                          dashboard.stockout_risks.slice(0, 3).map((risk) => (
                            <div key={risk.ingredient_id} className="flex items-center justify-between group/item">
                              <div className="space-y-0.5">
                                <p className="text-sm font-black text-slate-900 dark:text-white group-hover/item:text-indigo-600 transition-colors">{risk.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {t('v3.consumption', { value: (risk.avg_daily_consumption ?? 0).toFixed(2) })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-rose-500 italic">
                                  {risk.days_until_stockout === null || risk.days_until_stockout === undefined || risk.days_until_stockout === Number.POSITIVE_INFINITY || risk.days_until_stockout > 999 
                                    ? t('v3.infinityDays') 
                                    : `${risk.days_until_stockout.toFixed(1)} ${t('v3.daysCaps')}`}
                                </p>
                                {risk.days_until_stockout === null || risk.days_until_stockout === undefined || risk.days_until_stockout === Number.POSITIVE_INFINITY || risk.days_until_stockout > 999 ? (
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{t('v3.noSalesData')}</p>
                                ) : (
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('v3.remaining')}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                             <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-300">
                                <BarChart3 className="h-6 w-6" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('v3.analysisPending')}</p>
                                <p className="text-[10px] font-medium text-slate-400/60 max-w-[180px] leading-relaxed">
                                   {t('v3.stockoutDesc')}
                                </p>
                             </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
                      <CardHeader className="p-6 sm:p-8 pb-4 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{t('v3.qualityControl')}</p>
                          <CardTitle className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">{t('v3.expiryTitle')}</CardTitle>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
                        {dashboard.expired_risks.length > 0 ? (
                          dashboard.expired_risks.slice(0, 3).map((risk) => (
                             <div key={risk.batch_id} className="flex items-center justify-between group/item">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-black text-slate-900 dark:text-white group-hover/item:text-rose-600 transition-colors">{risk.name}</p>
                                  <Badge variant="outline" className={cn(
                                    "text-[8px] font-black uppercase px-2 py-0 border-none",
                                    risk.status === 'Expired' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                                  )}>
                                    {risk.status === 'Expired' ? t('v3.status.expired') : t('v3.status.warning')}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {risk.remaining_quantity.toFixed(2)}
                                  </p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('v3.inBatch')}</p>
                                </div>
                             </div>
                          ))
                        ) : (
                          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                             <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="h-6 w-6" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t('v3.allSecure')}</p>
                                <p className="text-[10px] font-medium text-slate-400/60 max-w-[180px] leading-relaxed">
                                   {t('v3.allSecureDesc')}
                                </p>
                             </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : !analyticsLoading && (
                  <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20">
                     <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                           <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-sm font-black uppercase tracking-widest text-amber-700">{t('v3.predictiveOffline')}</h4>
                           <p className="text-xs font-medium text-amber-600/80 leading-relaxed">
                             {t('v3.predictiveOfflineDesc')}
                           </p>
                        </div>
                     </div>
                  </div>
                )}

                {/* AI Alerts Component (Refactored within itself) */}
                <AIAlerts />

                {/* Grid Modules */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{t('sections.resources')}</h3>
                      <Activity className="h-4 w-4 text-indigo-300" />
                   </div>
                   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map((module) => {
                      const Icon = iconMap[module.icon];
                      const href = `/${locale}/${module.key === 'aiAssistant' ? 'assistant' : module.key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
                      
                      return (
                        <Link key={module.key} href={href} className="group">
                          <Card className="h-full border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                               <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                  <Icon className="h-6 w-6" />
                               </div>
                               <div className="h-8 w-8 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 group-hover:border-indigo-200 transition-all flex items-center justify-center">
                                  <ArrowRight className="h-4 w-4 text-indigo-600" />
                               </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                               <CardTitle className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{module.name}</CardTitle>
                               <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                  {module.description}
                               </CardDescription>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                   </div>
                </div>
             </div>

             {/* Sidebar Info */}
             <div className="space-y-8">
                {/* 🔥 V3: Total Stock Value Card */}
                {dashboard && (
                  <Card className="border-none bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('v3.warehouseValue')}</p>
                        <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">{t('v3.totalStock')}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pb-10">
                      <div className="flex items-baseline gap-2">
                         <span className="text-4xl font-black text-indigo-600">
                           {(dashboard.total_stock_value_cents / 100).toLocaleString(locale === 'pl' ? 'pl-PL' : locale === 'ru' ? 'ru-RU' : locale === 'uk' ? 'uk-UA' : 'en-US', { minimumFractionDigits: 2 })}
                         </span>
                         <span className="text-sm font-black text-slate-400 uppercase tracking-widest">PLN</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 mt-2 leading-relaxed">
                        {t('v3.warehouseDesc')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* 🔥 V3: Waste KPI Card (Sidebar Edition) */}
                {(dashboard || lossReport) && (
                  <Card className="border-none bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('v3.inventoryLoss')}</p>
                        <CardTitle className="text-xl font-black italic uppercase tracking-tighter">{t('v3.wasteKpi')}</CardTitle>
                      </div>
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                        (dashboard?.waste_percentage ?? lossReport?.waste_percentage ?? 0) > 5 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        <Activity className="h-6 w-6" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-end justify-between">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('v3.totalLoss')}</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white">
                             {((dashboard?.waste_30d_cents ?? lossReport?.total_loss_cents ?? 0) / 100).toFixed(2)} <span className="text-sm font-bold opacity-40">PLN</span>
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('v3.percentage')}</p>
                           <p className={cn(
                             "text-2xl font-black italic",
                             (dashboard?.waste_percentage ?? lossReport?.waste_percentage ?? 0) > 5 ? "text-rose-500" : "text-emerald-500"
                           )}>
                             {(dashboard?.waste_percentage ?? lossReport?.waste_percentage ?? 0).toFixed(1)}%
                           </p>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between group/link">
                        <Link href={`/${locale}/inventory`} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                           {t('v3.analyzeDetails')} <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] shadow-xl shadow-indigo-500/20 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-6 opacity-10"><Zap className="h-24 w-24" /></div>
                   <CardContent className="p-8 relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"><Sparkles className="h-5 w-5" /></div>
                         <h4 className="font-black uppercase tracking-widest text-[11px]">{t('v3.neuralTitle')}</h4>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="opacity-60">{t('v3.uptime')}</span>
                            <span>99.9%</span>
                         </div>
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="opacity-60">{t('v3.latency')}</span>
                            <span>240ms</span>
                         </div>
                         <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-2/3" />
                         </div>
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-none bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 space-y-6 border border-slate-100 dark:border-slate-800">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('v3.systemMetrics')}</h4>
                   <div className="space-y-4">
                      {[
                        { k: 'v3.serverLabel', v: 'FRA-01', s: 'online' },
                        { k: 'v3.dataEnvLabel', v: 'Production', s: 'online' },
                        { k: 'v3.storageLabel', v: 'S3-AWS', s: 'sync' }
                      ].map((m) => (
                        <div key={m.k} className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-500">{t(m.k)}</span>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black">{m.v}</span>
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
