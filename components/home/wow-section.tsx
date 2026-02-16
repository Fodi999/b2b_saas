'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { 
  XCircle, 
  AlertTriangle, 
  TrendingDown, 
  Sparkles, 
  Zap, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Bot 
} from 'lucide-react';

export default function WowSection() {
  const t = useTranslations('wow');

  const items = [
    { 
      icon: XCircle, 
      key: 'unprofitable', 
      color: 'text-rose-600', 
      bg: 'bg-rose-500/10', 
      border: 'border-rose-500/20',
      actionColor: 'bg-rose-600'
    },
    { 
      icon: AlertTriangle, 
      key: 'expiring', 
      color: 'text-amber-600', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20',
      actionColor: 'bg-amber-600'
    },
    { 
      icon: TrendingDown, 
      key: 'dragging', 
      color: 'text-orange-600', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/20',
      actionColor: 'bg-orange-600'
    },
  ];

  return (
    <section className="relative bg-slate-50 dark:bg-slate-900/50 py-24 sm:py-32 overflow-hidden px-6">
      <div className="container relative z-10 mx-auto max-w-7xl">
        
        <div className="flex flex-col items-center text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md shadow-inner shadow-indigo-500/10 group hover:scale-105 transition-transform">
             <Bot className="h-5 w-5 text-indigo-600 group-hover:animate-bounce" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
               Момент ВАУ
             </span>
           </div>
           <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-3xl">
             {t('title')}
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {items.map(({ icon: Icon, key, color, bg, border, actionColor }) => (
            <div key={key} className={`group relative p-10 rounded-[3rem] border ${border} ${bg} backdrop-blur-xl shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:shadow-indigo-500/10 overflow-hidden`}>
              
              {/* Header Visual */}
              <div className="flex items-center justify-between mb-8">
                <div className={`h-16 w-16 rounded-[1.5rem] bg-white dark:bg-slate-950 flex items-center justify-center border ${border} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className={`h-8 w-8 ${color} group-hover:animate-pulse transition-all`} />
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                   <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Real-time Analysis</span>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase leading-[1.1]">
                  {t(`items.${key}.title`)}
                </h3>
                
                {/* AI AI Insight Block */}
                <div className="mt-8 relative overflow-hidden p-6 bg-slate-900 dark:bg-slate-950 rounded-[2rem] border border-slate-100/10 shadow-xl">
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3 w-full border-b border-slate-800 pb-3 mb-2">
                      <Zap className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400/80">AI Suggestion</span>
                    </div>
                    <p className="text-slate-100 text-base font-bold leading-relaxed">
                      {t(`items.${key}.action`)}
                    </p>
                    <div className="pt-4 w-full">
                       <div className={`inline-flex items-center gap-2 px-4 py-2 ${actionColor} text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20 group-hover:scale-105 transition-transform`}>
                          Apply change
                          <ArrowRight className="h-3 w-3" />
                       </div>
                    </div>
                  </div>
                  {/* Decorative mesh */}
                  <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Mesh background effect for groups */}
              <div className={`absolute -bottom-12 -right-12 h-48 w-48 rounded-full blur-[80px] opacity-10 ${color.replace('text', 'bg')} pointer-events-none`} />
            </div>
          ))}
        </div>

        {/* Global Insight Stat Bar footer */}
        <div className="mt-20 mx-auto max-w-4xl p-8 rounded-[2rem] bg-indigo-600 dark:bg-indigo-950 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in-95 duration-700">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                 <Cpu className="h-8 w-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                 <p className="text-white text-2xl font-black tracking-tight leading-none mb-1">98.4% Accuracy</p>
                 <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-widest">Neural prediction score active</p>
              </div>
           </div>
           
           <div className="h-px md:h-12 w-full md:w-px bg-white/10" />

           <div className="flex items-center gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="text-white font-bold text-sm max-w-[200px]">Data verified by RestoAI Core v2.4 Engine</p>
           </div>
        </div>

      </div>

      {/* Background Decorative elements */}
      <div className="absolute top-0 left-0 h-full w-full opacity-5 pointer-events-none">
         <div className="absolute -top-48 -left-48 h-[600px] w-[600px] bg-indigo-500 rounded-full blur-[200px]" />
         <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] bg-emerald-500 rounded-full blur-[200px]" />
      </div>
    </section>
  );
}
