'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Plus,
  Sparkles,
  ArrowRight,
  Zap,
  Database,
  Cpu,
  ArrowDownLeft
} from 'lucide-react';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: Upload,
      key: 'step1',
      color: 'text-indigo-600',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      icon: Plus,
      key: 'step2',
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20'
    },
    {
      icon: Sparkles,
      key: 'step3',
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
  ];

  return (
    <section className="relative bg-white dark:bg-slate-950 py-24 sm:py-32 overflow-hidden px-6">
      <div className="container relative z-10 mx-auto max-w-7xl">

        <div className="flex flex-col items-center text-center space-y-8 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <Badge variant="outline" className="px-5 py-1.5 border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[10px]">
             Operational Deployment
           </Badge>
           <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
             {t('title')}
           </h2>
        </div>

        <div className="relative mx-auto mt-20 grid max-w-6xl gap-12 sm:grid-cols-3">

          {/* Connector Line Foreground (for large screens) */}
          <div className="absolute top-24 left-0 hidden w-full h-px bg-slate-200 dark:bg-slate-800 sm:block pointer-events-none z-0" />

          {steps.map(({ icon: Icon, key, color, bg, border }, index) => (
            <div key={key} className="group relative z-10 flex flex-col items-center">

              {/* Step Number Circle Overlay */}
              <div className="absolute -top-6 -right-2 h-10 w-10 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center font-black text-xs text-white z-20 shadow-xl group-hover:scale-110 transition-transform">
                 {index + 1}
              </div>

              {/* Icon Logic Portal */}
              <div className={`relative h-48 w-full p-8 rounded-[3.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all duration-700 hover:scale-105 hover:-translate-y-4 hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden`}>
                 <div className={`h-24 w-24 rounded-[2rem] bg-gradient-to-br ${bg} border ${border} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                    <Icon className={`h-10 w-10 ${color} transition-all duration-700`} />
                 </div>

                 {/* Background Logic Lines */}
                 <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-slate-400 rotate-45" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-slate-400 -rotate-45" />
                 </div>
              </div>

              {/* Step Content Group */}
              <div className="relative z-10 space-y-4 text-center mt-12 px-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase leading-none">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-base text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </div>

              {/* Pulse Indicator on the connector */}
              {index < steps.length - 1 && (
                 <div className="absolute top-24 -right-6 hidden sm:flex items-center justify-center z-30">
                    <div className="h-4 w-4 rounded-full bg-indigo-600 animate-pulse border-2 border-white dark:border-slate-950" />
                 </div>
              )}
            </div>
          ))}
        </div>

        {/* Global Connectivity Module Footer */}
        <div className="mt-40 mx-auto max-w-5xl rounded-[4rem] border-2 border-slate-900 dark:border-slate-800 bg-slate-950 p-12 lg:p-16 relative overflow-hidden group shadow-2xl">
           <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-6">
                 <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">RestoAI Data Pipeline</span>
                 </div>
                 <h3 className="text-3xl lg:text-5xl font-black text-white tracking-widest leading-[1.1]">
                   Deployment <br /> Speed: <span className="text-indigo-400">7.2s</span>
                 </h3>
                 <p className="text-lg text-slate-400 font-bold max-w-sm">
                   Интуитивное внедрение без длительного обучения персонала
                 </p>
                 <div className="pt-6">
                    <div className="flex items-center gap-4 bg-white/5 p-4 py-3 rounded-2xl border border-white/10 w-fit">
                       <ArrowDownLeft className="h-5 w-5 text-indigo-400" />
                       <span className="text-[10px] font-black uppercase text-white tracking-widest">Enterprise Connection Active</span>
                    </div>
                 </div>
              </div>

              <div className="relative w-full lg:w-[450px] aspect-[4/3] rounded-[3rem] border border-white/10 bg-slate-900/50 p-8 flex flex-col justify-between group-hover:border-indigo-500/50 transition-colors">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                          <Database className="h-6 w-6 text-white" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-white tracking-widest">System Load</p>
                          <p className="text-sm font-bold text-slate-400 italic">Core Processing</p>
                       </div>
                    </div>
                    <Cpu className="h-6 w-6 text-indigo-500 opacity-50 group-hover:rotate-180 transition-transform duration-1000" />
                 </div>

                 <div className="space-y-4">
                    <div className="h-2 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
                       <div className="h-full w-[85%] bg-indigo-500 animate-pulse" />
                    </div>
                    <div className="h-2 w-3/4 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                       <div className="h-full w-[65%] bg-emerald-500 animate-pulse delay-500" />
                    </div>
                    <div className="h-2 w-[95%] rounded-full bg-white/5 border border-white/10 overflow-hidden">
                       <div className="h-full w-1/2 bg-indigo-500 animate-pulse delay-1000" />
                    </div>
                 </div>

                 <div className="flex justify-end">
                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.3em]">Status: Nominal</span>
                 </div>
              </div>
           </div>

           {/* Decorative grid for module */}
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
           </div>
        </div>

      </div>
    </section>
  );
}
