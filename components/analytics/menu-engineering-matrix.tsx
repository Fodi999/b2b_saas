'use client';

import { MenuEngineeringAnalysisResponse, MenuEngineeringDish } from '@/lib/api/menu-engineering';
import { Badge } from "@/components/ui/badge";
import { Star, Zap, Search, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuEngineeringMatrixProps {
  analysis: MenuEngineeringAnalysisResponse | null;
  loading: boolean;
}

export function MenuEngineeringMatrix({ analysis, loading }: MenuEngineeringMatrixProps) {
  if (loading) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-[3rem]">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Calculating Economy Matrix...</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const categories = [
    { 
      id: 'stars', 
      title: 'Stars', 
      icon: Star, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-500/5',
      border: 'border-indigo-500/20',
      description: 'High Margin, High Sales',
      items: analysis.categories.stars 
    },
    { 
      id: 'plowhorses', 
      title: 'Plowhorses', 
      icon: Zap, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      description: 'Low Margin, High Sales',
      items: analysis.categories.plowhorses 
    },
    { 
      id: 'puzzles', 
      title: 'Puzzles', 
      icon: Search, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      description: 'High Margin, Low Sales',
      items: analysis.categories.puzzles 
    },
    { 
      id: 'dogs', 
      title: 'Dogs', 
      icon: Trash2, 
      color: 'text-rose-400', 
      bg: 'bg-rose-500/5',
      border: 'border-rose-500/20',
      description: 'Low Margin, Low Sales',
      items: analysis.categories.dogs 
    },
  ];

  return (
    <div className="space-y-12">
      {/* 2x2 Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className={cn(
            "p-8 rounded-[2.5rem] border backdrop-blur-3xl space-y-8 group transition-all duration-700 hover:scale-[1.02]",
            cat.bg, cat.border
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl bg-black/40 border", cat.border)}>
                  <cat.icon className={cn("h-6 w-6", cat.color)} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-wider text-white">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{cat.description}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("px-4 py-1.5 rounded-full font-black text-xs border-none uppercase tracking-widest bg-black/40", cat.color)}>
                {cat.items.length} Dishes
              </Badge>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {cat.items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/10">No dishes in this quadrant</p>
                </div>
              ) : cat.items.map((dish) => (
                <div key={dish.dish_id} className="p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-white text-sm italic uppercase tracking-tight">{dish.name}</h4>
                    <span className="text-[10px] font-black text-indigo-400">{(dish.margin_cents / 100).toFixed(0)} PLN Margin</span>
                  </div>
                  
                  {dish.ai_recommendation && (
                    <div className="flex gap-3 pt-2 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Zap className="h-3 w-3 text-indigo-400 shrink-0" />
                      <p className="text-[10px] font-medium text-zinc-400 italic leading-relaxed">
                        {dish.ai_recommendation}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Food Cost</span>
                        <span className="text-xs font-bold text-white">{(dish.food_cost_cents / 100).toFixed(0)} PLN</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block">Sales</span>
                        <span className="text-xs font-bold text-emerald-400">{dish.sales_count} items</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
