"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  ShieldAlert,
  PieChart,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

interface BusinessMetricsProps {
  cost?: number;
  margin?: number;
  haccp_risk?: 'low' | 'medium' | 'high';
  complexity?: number;
  servings?: number;
  className?: string;
}

export function BusinessMetrics({
  cost,
  margin,
  haccp_risk = 'medium',
  complexity = 3,
  servings = 1,
  className
}: BusinessMetricsProps) {
  const t = useTranslations('recipes.metrics');

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>
              <h2 className="text-xl font-black italic text-white tracking-tight">
                {t('title')}
              </h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-12">
              {t('subtitle')}
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-white/10 bg-white/5 text-white/60 font-black uppercase tracking-widest text-[10px]">
            Live Analytics
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost Card */}
          <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 group hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <DollarSign className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white italic tracking-tighter">
                  ${cost?.toFixed(2)}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">
                  {t('cost.perPortion', { count: servings })}
                </p>
              </div>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-400/80 mb-2">
              {t('cost.title')}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-white/40 font-medium">
              <Info className="w-3 h-3" />
              {t('cost.efficiency')}
            </div>
          </div>

          {/* Margin Card */}
          <div className="bg-emerald-500/[0.03] rounded-[2rem] p-6 border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <PieChart className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-400 italic tracking-tighter">
                  {margin}%
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/40 mt-1">
                  {t('margin.target')}
                </p>
              </div>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-400/80 mb-2">
              {t('margin.title')}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              {t('margin.excellent')}
            </div>
          </div>
        </div>

        {/* HACCP Risk */}
        <div className="mt-6 p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-1">
                {t('risk.title')}
              </h4>
              <p className="text-sm text-white/60 font-medium italic">
                {t('risk.description')}
              </p>
            </div>
          </div>
          <Badge className={cn("px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-xs border shadow-lg", getRiskColor(haccp_risk))}>
            {t(`risk.${haccp_risk}`)}
          </Badge>
        </div>
      </div>
    </div>
  );
}
