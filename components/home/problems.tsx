'use client';

import { useTranslations } from 'next-intl';
import { 
  AlertCircle, 
  TrendingDown, 
  Eye, 
  Package, 
  Sparkles, 
  Zap, 
  Brain, 
  Shield 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Problems() {
  const t = useTranslations('problems');

  const problems = [
    { 
      icon: Package, 
      key: 'inventory',
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    { 
      icon: TrendingDown, 
      key: 'cost',
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    { 
      icon: AlertCircle, 
      key: 'menu',
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    },
    { 
      icon: Eye, 
      key: 'decisions',
      color: 'text-red-700',
      bg: 'bg-red-700/10',
      border: 'border-red-700/20'
    },
  ];

  return (
    <section className="relative bg-white dark:bg-slate-950 py-24 sm:py-32 overflow-hidden px-6">
      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          
          <div className="max-w-xl space-y-6">
            <Badge variant="outline" className="px-4 py-1 border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest text-[10px]">
              Critical Leakage Detection
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
               {t('title')}
               <span className="block italic text-rose-600 dark:text-rose-500">
                 {t('subtitle')}
               </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-2xl">
            {problems.map(({ icon: Icon, key, color, bg, border }) => (
              <div key={key} className={`group flex flex-col items-start gap-4 p-6 rounded-[1.5rem] border ${border} ${bg} backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/5`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${bg} shadow-sm group-hover:scale-110 transition-transform`}>
                   <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {t(`items.${key}`)}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* AI Solution Highlight */}
        <div className="relative mt-20 p-12 lg:p-16 rounded-[3rem] overflow-hidden bg-slate-900 dark:bg-slate-900/50 border border-slate-100/10 shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                 <Sparkles className="h-4 w-4 text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">The 2026 RestoAI Solution</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                {t('solution.title')}
              </h3>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                {t('solution.description')}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                {[
                  { label: 'Real-time Cost', icon: Zap },
                  { label: 'Auto Inventory', icon: Package },
                  { label: 'AI Optimization', icon: Brain },
                  { label: 'Fraud Shield', icon: Shield }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center group">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <item.icon className="h-5 w-5 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full lg:w-[400px] aspect-square rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 p-1">
               <div className="h-full w-full rounded-[1.8rem] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {/* Modern Illustration or Abstract Neural Network */}
                  <div className="relative w-full h-full opacity-60">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/30 rounded-full blur-[60px] animate-pulse" />
                     <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-violet-500/20 rounded-full blur-[40px] animate-float" />
                     <div className="flex h-full w-full items-center justify-center p-12">
                         <div className="space-y-4 w-full">
                            <div className="h-2 w-full rounded-full bg-slate-800" />
                            <div className="h-2 w-3/4 rounded-full bg-slate-800" />
                            <div className="h-2 w-1/2 rounded-full bg-indigo-500/50" />
                            <div className="h-2 w-full rounded-full bg-slate-800" />
                         </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Background Decorative */}
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-indigo-600/5 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </section>
  );
}
