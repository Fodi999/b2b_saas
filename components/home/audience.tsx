'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  ChefHat,
  Target,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export default function Audience() {
  const t = useTranslations('audience');

  const personas = [
    {
      icon: Building2,
      key: 'owner',
      color: 'text-indigo-600',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      icon: Users,
      key: 'manager',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      icon: ChefHat,
      key: 'chef',
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
  ];

  return (
    <section className="relative bg-white dark:bg-slate-950 py-24 sm:py-32 overflow-hidden px-6">
      <div className="container relative z-10 mx-auto max-w-7xl">

        <div className="flex flex-col items-center text-center space-y-8 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <Badge variant="outline" className="px-5 py-1.5 border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[10px]">
             User Centric Ecosystem
           </Badge>
           <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
             {t('title')}
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {personas.map(({ icon: Icon, key, color, bg, border }) => (
            <div key={key} className={`group relative p-12 rounded-[4rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all duration-700 hover:-translate-y-4 hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden`}>

              {/* Persona Icon Visual */}
              <div className="flex items-center justify-center mb-10 relative">
                 <div className={`h-24 w-24 rounded-[2rem] bg-gradient-to-br ${bg} border ${border} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                    <Icon className={`h-10 w-10 ${color} transition-all duration-700`} />
                 </div>
                 {/* Accent Badge on icon */}
                 <div className="absolute -top-4 -right-2 h-10 w-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center shadow-lg animate-bounce-slow">
                    <Target className={`h-4 w-4 ${color}`} />
                 </div>
              </div>

              {/* Persona Content */}
              <div className="relative z-10 space-y-6 text-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-widest uppercase leading-none">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  {t(`${key}.description`)}
                </p>

                {/* Visual indicator of impact */}
                <div className="pt-8 w-full border-t border-slate-200/50 dark:border-slate-800/50">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className={`h-2 w-2 rounded-full ${color.replace('text', 'bg')} animate-pulse`} />
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Impact Score</span>
                      </div>
                      <span className={`text-[11px] font-black italic tracking-widest ${color}`}>Maximum Optimization</span>
                   </div>
                   <div className="mt-2 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full w-[85%] ${color.replace('text', 'bg')} rounded-full shadow-lg group-hover:w-[95%] transition-all duration-1000`} />
                   </div>
                </div>
              </div>

              {/* Decorative Corner Arrow */}
              <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-100 transition-opacity">
                 <ArrowUpRight className={`h-6 w-6 ${color}`} />
              </div>

              {/* Mesh background effect for groups */}
              <div className={`absolute -top-12 -left-12 h-48 w-48 rounded-full blur-[80px] opacity-10 ${color.replace('text', 'bg')} pointer-events-none transition-opacity duration-700`} />
            </div>
          ))}
        </div>

        {/* Neural Network Abstract Footer for Section */}
        <div className="mt-32 relative mx-auto max-w-4xl p-1 animate-in fade-in zoom-in-95 duration-700">
           <div className="rounded-[2.5rem] bg-gradient-to-r from-indigo-500/5 via-emerald-500/5 to-violet-500/5 border border-slate-100 dark:border-slate-800 py-12 px-6 text-center">
              <div className="flex flex-col items-center gap-6">
                 <div className="flex -space-x-4 mb-2 animate-float">
                    {[1, 2, 3, 4, 5].map((i) => (
                       <div key={i} className="h-12 w-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400">
                          {i}
                       </div>
                    ))}
                    <div className="h-12 w-12 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center font-black text-xs text-white">
                       AI
                    </div>
                 </div>
                 <p className="text-slate-900 dark:text-white text-xl font-black tracking-tight leading-relaxed max-w-xl">
                    Присоединяйтесь к тысячам профессионалов, которые уже выбрали <span className="text-indigo-600">RestoAI OS 2026</span>
                 </p>
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Verified B2B Enterprise Standard</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
}
