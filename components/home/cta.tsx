'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Globe
} from 'lucide-react';

export default function CTA() {
  const t = useTranslations('cta');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-white dark:bg-slate-950">
      
      {/* Background Orbital Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="relative rounded-[4rem] bg-slate-950 border border-slate-800 p-12 md:p-24 overflow-hidden group shadow-2xl text-center">
          
          {/* Internal Animated Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-12">
            
            <div className="flex flex-col items-center space-y-6">
              <Badge variant="outline" className="px-6 py-2 border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                System Finalization
              </Badge>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
                {t('title')}
              </h2>
              <p className="text-xl md:text-2xl text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed">
                {t('description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Button 
                asChild 
                size="lg" 
                className="h-20 px-12 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-800 transition-all hover:scale-105 active:scale-95 group font-black text-lg uppercase tracking-widest"
              >
                <Link href={`/${locale}/register`} className="flex items-center gap-4">
                  {t('button')}
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              
              <div className="flex flex-col items-start gap-2 px-6">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Enterprise Encrypted</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Node Access</span>
                 </div>
              </div>
            </div>

            {/* Neural Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 border-t border-white/5">
                {[
                  { label: "Uptime", val: "99.9%" },
                  { label: "Sync Rate", val: "MS / 0.4" },
                  { label: "Neural Load", val: "Optimal" },
                  { label: "Security", val: "Lvl 4" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{stat.label}</p>
                    <p className="text-lg font-bold text-white italic">{stat.val}</p>
                  </div>
                ))}
            </div>

          </div>

          {/* Decorative Corner Accents */}
          <div className="absolute top-0 right-0 p-8 border-r border-t border-white/10 rounded-tr-[4rem] w-32 h-32" />
          <div className="absolute bottom-0 left-0 p-8 border-l border-b border-white/10 rounded-bl-[4rem] w-32 h-32" />
          
          <Sparkles className="absolute top-12 left-12 h-12 w-12 text-white/5 animate-pulse" />
          <Zap className="absolute bottom-12 right-12 h-12 w-12 text-white/5 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
