'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Store, ArrowRight, ShieldCheck, Sparkles, Zap, Package, BookOpen, Utensils, PieChart, MessageSquare, BarChart3, Activity } from 'lucide-react';
import AIAlerts from '@/components/dashboard/ai-alerts';
import Link from 'next/link';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = {
  inventory: Package,
  recipes: BookOpen,
  dishes: Utensils,
  menuEngineering: PieChart,
  aiAssistant: MessageSquare,
  reports: BarChart3,
};

export default function DashboardPage() {
  const { user, tenant, logout } = useAuthStore();
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
      <div className="container mx-auto px-6 py-10 max-w-7xl animate-in fade-in duration-700">
        <div className="space-y-10">
          
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 group">
                <LayoutDashboard className="h-8 w-8 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                      Portal <span className="text-indigo-600">Core</span>
                   </h1>
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/50">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black tracking-widest uppercase">Operational</span>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {t('welcome', { name: user.display_name || user.email.split('@')[0] })}
                  </p>
                  <span className="text-slate-300">•</span>
                  {tenant && (
                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                      <Store className="h-3.5 w-3.5" />
                      {tenant.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <Button variant="ghost" onClick={handleLogout} className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100">
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             {/* Main AI Feed */}
             <div className="lg:col-span-3 space-y-8">
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
                <Card className="border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-[2rem] shadow-xl shadow-indigo-500/20 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-6 opacity-10"><Zap className="h-24 w-24" /></div>
                   <CardContent className="p-8 relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"><Sparkles className="h-5 w-5" /></div>
                         <h4 className="font-black uppercase tracking-widest text-[11px]">Neural Core Status</h4>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="opacity-60">Uptime</span>
                            <span>99.9%</span>
                         </div>
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="opacity-60">AI Latency</span>
                            <span>240ms</span>
                         </div>
                         <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-2/3" />
                         </div>
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-none bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 space-y-6 border border-slate-100 dark:border-slate-800">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('sections.metrics')}</h4>
                   <div className="space-y-4">
                      {[
                        { l: 'Server', v: 'FRA-01', s: 'online' },
                        { l: 'Data Env', v: 'Production', s: 'online' },
                        { l: 'Storage', v: 'S3-AWS', s: 'sync' }
                      ].map((m) => (
                        <div key={m.l} className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-500">{m.l}</span>
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
