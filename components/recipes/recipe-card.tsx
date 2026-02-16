'use client';

import { Clock, Users, AlertCircle, CheckCircle, Utensils, ChevronRight, Zap } from 'lucide-react';
import type { Recipe } from '@/lib/stores/recipes-store';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type RecipeCardProps = {
  recipe: Recipe;
  cost: number;
  costPerServing: number;
};

export default function RecipeCard({ recipe, cost, costPerServing }: RecipeCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('recipes');

  const getStatusBadge = () => {
    switch (recipe.status) {
      case 'published':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 font-black uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
            <CheckCircle className="h-3 w-3" />
            LIVE
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 font-black uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
            <AlertCircle className="h-3 w-3" />
            DRAFT
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Link href={`/${locale}/recipes/${recipe.id}`} className="block group">
      <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-indigo-500/50 rounded-[2.5rem] transition-all duration-300 overflow-hidden relative backdrop-blur-sm">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                <Utensils className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none">
                    Recipe Card
                  </span>
                  {getStatusBadge()}
                </div>
                <h3 className="font-black text-xl text-white italic tracking-tight group-hover:text-indigo-400 transition-colors">
                  {recipe.name}
                </h3>
              </div>
            </div>
            <div className="p-2 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>
          </div>

          {/* Description */}
          {recipe.description && (
            <p className="mb-6 text-sm text-white/60 line-clamp-2 leading-relaxed font-medium">
              {recipe.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                {t('card.prepTime', { count: recipe.prepTime || 0 })}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                {t('card.servings', { count: recipe.servings })}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] border-white/10 text-white/40 px-3 py-1 rounded-full">
              {recipe.difficulty}
            </Badge>
          </div>

          {/* Cost Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-black/40 rounded-[2rem] border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                {t('card.totalCost')}
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-white italic">
                  {cost.toFixed(2)}
                </p>
                <span className="text-[10px] font-bold text-white/40">PLN</span>
              </div>
            </div>
            <div className="p-5 bg-indigo-500/[0.05] rounded-[2rem] border border-indigo-500/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-2 whitespace-nowrap">
                {t('card.perServing')}
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-indigo-400 italic">
                  {costPerServing.toFixed(2)}
                </p>
                <span className="text-[10px] font-bold text-indigo-400/40">PLN</span>
              </div>
            </div>
          </div>

          {/* AI Insights Indicator */}
          {recipe.aiInsights && recipe.aiInsights.length > 0 && (
            <div className="mt-6 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-white/60 leading-tight line-clamp-1 italic font-medium">
                {recipe.aiInsights[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
