'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Zap, Brain, Shield } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Hero() {
  const t = useTranslations('hero');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-white dark:bg-slate-950 py-20 px-6">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/10 blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-12">
          
          {/* AI Badge Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              RestoAI Neural Engine v2.4
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
              {t('title').split('.').map((part, i, arr) => (
                <span key={i} className={i === 0 ? "block" : "block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic"}>
                  {part}{i < arr.length - 1 ? '.' : ''}
                </span>
              ))}
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg md:text-2xl font-bold leading-relaxed text-slate-500 dark:text-slate-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Link href={`/${locale}/register`} className="w-full sm:w-auto">
              <Button size="lg" className="h-16 px-10 text-base font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 gap-3 group">
                {t('cta.start')}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={`/${locale}/demo`} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-16 px-10 text-base font-black uppercase tracking-widest rounded-2xl border-2 border-slate-200 dark:border-slate-800 gap-3 hover:bg-slate-50 dark:hover:bg-slate-900">
                <Play className="h-5 w-5 fill-current" />
                {t('cta.demo')}
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview / Floating Insights Overlay */}
          <div className="relative w-full max-w-6xl mt-20 animate-in fade-in zoom-in-95 duration-1000 delay-700">
            <div className="relative rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-2xl p-4 shadow-2xl shadow-indigo-500/10 transition-all duration-700 hover:shadow-indigo-500/20">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-white dark:bg-slate-950 aspect-[16/9] border border-slate-100 dark:border-slate-800">
                {/* Mockup UI Placeholder */}
                <div className="absolute inset-0 flex flex-col">
                  {/* Top Bar */}
                  <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 gap-4">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  {/* Content grid */}
                  <div className="flex-1 grid grid-cols-12 gap-6 p-8">
                     <div className="col-span-8 space-y-6">
                        <div className="h-40 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 animate-pulse" />
                        <div className="grid grid-cols-2 gap-6">
                           <div className="h-32 rounded-3xl bg-indigo-500/5 border border-indigo-500/10" />
                           <div className="h-32 rounded-3xl bg-emerald-500/5 border border-emerald-500/10" />
                        </div>
                     </div>
                     <div className="col-span-4 space-y-6">
                        <div className="h-64 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50" />
                        <div className="h-16 rounded-3xl bg-violet-500/5 border border-violet-500/10" />
                     </div>
                  </div>
                </div>
              </div>

              {/* Floating Meta Cards */}
              <div className="absolute -top-12 -right-6 hidden lg:flex flex-col gap-4 animate-bounce-slow">
                 <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                       <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Margin Insight</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">+12.4% Profit Growth</p>
                    </div>
                 </div>
              </div>

              <div className="absolute top-1/4 -left-12 hidden lg:flex flex-col gap-4 animate-float">
                 <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                       <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Recommendation</p>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">Optimize Dish: "Carbonara"</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
