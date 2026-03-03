'use client';

import { Clock, Users, AlertCircle, CheckCircle, Utensils, ChevronRight, Zap, Sparkles } from 'lucide-react';
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
    const badgeClass = "bg-white/5 border-white/5 gap-1 font-bold uppercase tracking-[0.2em] text-[8px] px-1.5 py-0.5 rounded-md";
    
    switch (recipe.status) {
      case 'production':
        return (
          <Badge variant="outline" className={cn(badgeClass, "text-emerald-400/80 border-emerald-500/10")}>
            <CheckCircle className="h-2.5 w-2.5" />
            {t('status.production')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className={cn(badgeClass, "text-blue-400/80 border-blue-500/10")}>
            <CheckCircle className="h-2.5 w-2.5" />
            {t('status.approved')}
          </Badge>
        );
      case 'ai_review':
        return (
          <Badge variant="outline" className={cn(badgeClass, "text-indigo-400/80 border-indigo-500/10 animate-pulse")}>
            <Sparkles className="h-2.5 w-2.5" />
            {t('status.ai_review')}
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className={cn(badgeClass, "text-zinc-400/80 border-white/5")}>
            <AlertCircle className="h-2.5 w-2.5" />
            {t('status.draft')}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Link href={`/${locale}/recipes/${recipe.id}`} className="block group">
      <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-indigo-500/50 rounded-[2rem] transition-all duration-300 overflow-hidden relative backdrop-blur-sm shadow-xl">
        
        {/* Image Header */}
        <div className="relative h-48 w-full overflow-hidden border-b border-white/5">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-indigo-500/5 flex items-center justify-center">
              <Utensils className="h-16 w-16 text-white/5" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            {getStatusBadge()}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-extrabold text-base text-white/90 italic tracking-tight group-hover:text-indigo-400 transition-colors uppercase leading-tight">
              {recipe.name}
            </h3>
            <div className="p-1 px-1.5 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            </div>
          </div>

          {/* Minimal Meta Info */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
              <Clock className="h-2.5 w-2.5 text-indigo-400/80" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-white">
                {recipe.prepTime || 30}M
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
              <Users className="h-2.5 w-2.5 text-emerald-400/80" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-white">
                {recipe.servings}P
              </span>
            </div>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20 ml-auto border-l border-white/5 pl-2">
              {recipe.difficulty}
            </span>
          </div>

          {/* Footer Stats */}
          <div className="pt-4 border-t border-white/[0.03] flex items-end justify-between">
            <div className="space-y-0.5">
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/20 block">
                FOOD COST
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-white italic tracking-tighter">
                  {cost?.toLocaleString() || '0.00'}
                </span>
                <span className="text-[8px] font-bold text-white/30 uppercase">PLN</span>
              </div>
            </div>
            
            <div className="h-6 w-[1px] bg-white/5" />

            <div className="space-y-0.5 text-right">
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/20 block">
                MARGIN
              </span>
              <div className="flex items-baseline gap-0.5 justify-end">
                <span className="text-sm font-black text-emerald-400 italic tracking-tighter">
                  {recipe.margin || '75'}
                </span>
                <span className="text-[8px] font-bold text-emerald-400/30 uppercase">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
