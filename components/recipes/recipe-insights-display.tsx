"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Timer,
  LayoutList,
  Flame,
  LineChart
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecipeInsightsDisplayProps {
  score: number;
  difficulty: 'low' | 'medium' | 'high';
  ingredientsCount: number;
  stepsCount: number;
  className?: string;
}

export function RecipeInsightsDisplay({
  score,
  difficulty,
  ingredientsCount,
  stepsCount,
  className
}: RecipeInsightsDisplayProps) {
  const t = useTranslations('recipes.insights');

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-400';
    if (s >= 75) return 'text-indigo-400';
    if (s >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return t('purity.perfect');
    if (s >= 75) return t('purity.balanced');
    if (s >= 60) return t('purity.needsWork');
    if (s >= 40) return t('purity.risky');
    return t('purity.critical');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Score Card */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
          <Zap className="w-24 h-24 text-indigo-500" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-1">
                RestoAI Analyzer
              </p>
              <h3 className="text-xl font-black text-white italic tracking-tight">
                {t('title')}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className={cn("text-7xl font-black tracking-tighter italic", getScoreColor(score))}>
                  {score}%
                </span>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 uppercase tracking-widest text-[10px] py-1 px-3 rounded-full">
                  {getScoreLabel(score)}
                </Badge>
              </div>
              {/* Custom Progress Bar */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", 
                    score >= 90 ? "bg-emerald-500" : 
                    score >= 75 ? "bg-indigo-500" : 
                    score >= 50 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t('details.difficulty')}</span>
                </div>
                <div className="text-sm font-black text-white uppercase tracking-widest">{difficulty}</div>
              </div>
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t('details.checked')}</span>
                </div>
                <div className="text-sm font-black text-white uppercase tracking-widest">OK</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Timer className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('details.aiTime')}</p>
              <p className="text-lg font-black text-white italic">0.4s</p>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-emerald-500 opacity-50" />
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <LayoutList className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('details.steps')}</p>
              <p className="text-lg font-black text-white italic">{stepsCount}</p>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-50" />
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Warnings</p>
              <p className="text-lg font-black text-white italic">0</p>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-500 opacity-50" />
        </div>
      </div>
    </div>
  );
}
