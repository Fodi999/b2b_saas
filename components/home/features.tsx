'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  FileText,
  UtensilsCrossed,
  BarChart3,
  Bot,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export default function Features() {
  const t = useTranslations('features');

  const features = [
    {
      icon: Package,
      key: 'inventory',
      color: 'text-indigo-600',
      bg: 'from-indigo-500/10 to-transparent',
      shadow: 'shadow-indigo-500/10'
    },
    {
      icon: FileText,
      key: 'recipes',
      color: 'text-emerald-600',
      bg: 'from-emerald-500/10 to-transparent',
      shadow: 'shadow-emerald-500/10'
    },
    {
      icon: UtensilsCrossed,
      key: 'dishes',
      color: 'text-orange-600',
      bg: 'from-orange-500/10 to-transparent',
      shadow: 'shadow-orange-500/10'
    },
    {
      icon: BarChart3,
      key: 'menuEngineering',
      color: 'text-violet-600',
      bg: 'from-violet-500/10 to-transparent',
      shadow: 'shadow-violet-500/10'
    },
    {
      icon: Bot,
      key: 'ai',
      color: 'text-blue-600',
      bg: 'from-blue-500/10 to-transparent',
      shadow: 'shadow-blue-500/10'
    },
  ];

  return (
    <section className="relative bg-white dark:bg-slate-950 py-24 sm:py-32 overflow-hidden px-6">
      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <Badge variant="outline" className="px-5 py-1.5 border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[10px]">
             Full Ecosystem Core
           </Badge>
           <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
             {t('title')}
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {features.map(({ icon: Icon, key, color, bg, shadow }) => (
            <div key={key} className={`group relative p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl ${shadow} transition-all duration-500 hover:-translate-y-2 hover:bg-white dark:hover:bg-slate-900 overflow-hidden`}>
              <div className={`relative z-10 w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${bg} border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500`}>
                <Icon className={`h-7 w-7 ${color} group-hover:text-white transition-colors duration-500`} />
              </div>
              
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-base text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </div>

              {/* Functional Badge Indicator */}
              <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-white dark:bg-slate-800 p-2 px-3 rounded-full border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Zap className="h-3 w-3 text-indigo-600" />
                 <span className="text-[9px] font-black uppercase text-slate-600 dark:text-slate-300">Active v2</span>
              </div>

              {/* Accent Gradient Line */}
              <div className={`absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r ${bg} opacity-20`} />
              
              {/* Mesh background effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 dark:opacity-0 pointer-events-none transition-opacity">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500 rounded-full blur-[64px]" />
              </div>
            </div>
          ))}

          {/* Special Future Card Placeholder */}
          <div className="p-10 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800 bg-transparent flex flex-col items-center justify-center text-center space-y-4 group opacity-50 hover:opacity-100 transition-opacity">
             <div className="h-16 w-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="h-7 w-7 text-slate-400 group-hover:text-indigo-500 transition-colors" />
             </div>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mt-2">Coming Soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
