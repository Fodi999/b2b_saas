'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getDishes, deleteDish as deleteDishAPI, type Dish } from '@/lib/api/dishes';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  ArrowRight,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DishesPage() {
  const { user, accessToken } = useAuthStore();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dishes');
  const [expandedWarnings, setExpandedWarnings] = useState<string | null>(null);
  const [dishToDelete, setDishToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDishes = useCallback(async () => {
    if (!accessToken) return;
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await getDishes(accessToken);
      setDishes(data.items);
    } catch {
      setLoadError('Не удалось загрузить блюда');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    loadDishes();
  }, [user, router, locale, loadDishes]);

  if (!user) {
    return null;
  }

  const handleDelete = (id: string) => {
    setDishToDelete(id);
  };

  const confirmDelete = async () => {
    if (!dishToDelete || !accessToken) return;
    try {
      setIsDeleting(true);
      await deleteDishAPI(dishToDelete, accessToken);
      setDishes(prev => prev.filter(d => d.id !== dishToDelete));
      setDishToDelete(null);
    } catch {
      setLoadError('Не удалось удалить блюдо');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusConfig = (dish: Dish) => {
    const fc = dish.food_cost_percent ?? 0;
    if (!dish.active) return {
      label: t('status.loss'),
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500'
    };
    if (fc <= 35) return {
      label: t('status.profit'),
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500'
    };
    if (fc <= 50) return {
      label: t('status.warning'),
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500'
    };
    return {
      label: t('status.loss'),
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500'
    };
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-6 sm:space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 gap-4 sm:gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[1rem] sm:rounded-[1.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] bg-black border border-white/10 shadow-2xl">
                  <UtensilsCrossed className="h-6 w-6 sm:h-10 sm:w-10 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                   <h1 className="text-2xl sm:text-5xl font-black tracking-tighter italic uppercase leading-none">
                      {t('header.title')}<span className="text-indigo-500">{t('header.core')}</span>
                   </h1>
                   <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-full border border-indigo-500/20 glass-portal">
                      <Activity className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 animate-pulse" />
                      <span className="text-[8px] sm:text-[12px] font-black tracking-[0.2em] uppercase">{t('header.sync')}</span>
                   </div>
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[7px] sm:text-[10px] ml-1">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="h-10 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-[2rem] font-black uppercase text-[9px] tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all border border-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                onClick={() => router.push(`/${locale}/dishes/create`)}
                className="h-10 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-[2rem] bg-white text-black hover:bg-indigo-500 hover:text-white font-black uppercase text-[9px] tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.create')}
              </Button>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {dishes.map((dish) => {
              const status = getStatusConfig(dish);
              const costPln = (dish.recipe_cost_cents ?? 0) / 100;
              const pricePln = dish.selling_price_cents / 100;
              const profit = pricePln - costPln;
              const fc = dish.food_cost_percent ?? 0;
              return (
                <div key={dish.id} className="group relative">
                  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 group-hover:border-indigo-500/50 group-hover:bg-white/[0.05] h-full flex flex-col">
                    <div className="p-5 sm:p-8 pb-4">
                      <div className="flex items-start justify-between mb-4 sm:mb-6">
                        <Badge className={cn("px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-black uppercase text-[7px] sm:text-[10px] tracking-widest border shadow-lg", status.color)}>
                          <div className={cn("w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-2", status.dot)} />
                          {status.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(dish.id)}
                          className="h-8 w-8 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="text-lg sm:text-2xl font-black italic text-white tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                        {dish.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
                        <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          {t('card.servings', { count: 1 })}
                        </span>
                        {!dish.active && (
                          <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-rose-400/80 bg-rose-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-rose-500/20">
                            Неактивно
                          </span>
                        )}
                      </div>

                      {/* Main Metrics */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-black/40 rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 border border-white/5">
                          <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{t('card.foodCost')}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-base sm:text-2xl font-black text-white italic">{costPln.toFixed(1)}</span>
                            <span className="text-[8px] sm:text-[10px] font-bold text-white/20">PLN</span>
                          </div>
                        </div>
                        <div className="bg-black/40 rounded-2xl sm:rounded-[2rem] p-3 sm:p-5 border border-white/5">
                          <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{t('card.salePrice')}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-2xl font-black text-white italic">{pricePln.toFixed(1)}</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-white/20">PLN</span>
                          </div>
                        </div>
                      </div>

                      {/* Margin Row */}
                      <div className="bg-indigo-500/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 border border-indigo-500/10 mb-4 sm:mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-1">{t('card.grossProfit')}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-2xl font-black text-indigo-400 italic">{profit.toFixed(1)}</span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-indigo-400/40">PLN</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{t('card.fc')}</p>
                          <span className={cn(
                            "text-xl sm:text-2xl font-black italic",
                            fc > 35 ? "text-rose-400" : "text-emerald-400"
                          )}>
                            {fc.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto p-5 sm:p-6 pt-0">
                      <Button
                        variant="ghost"
                        className="w-full h-11 sm:h-12 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest rounded-xl transition-all group/btn"
                        onClick={() => router.push(`/${locale}/dishes/${dish.id}`)}
                      >
                        {t('card.edit')}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-6" />
              <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">Загрузка блюд...</p>
            </div>
          )}

          {/* Error State */}
          {loadError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-rose-500/5 border border-rose-500/20 rounded-[3rem]">
              <AlertTriangle className="h-12 w-12 text-rose-400 mb-6" />
              <p className="text-rose-400 font-black uppercase tracking-widest text-[11px] mb-6">{loadError}</p>
              <Button onClick={loadDishes} className="h-12 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest border border-white/10">
                Попробовать снова
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !loadError && dishes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] border border-white/5 rounded-[4rem]">
              <div className="h-24 w-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 border border-white/10 group animate-pulse">
                <UtensilsCrossed className="h-12 w-12 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter mb-4 text-white">
                {t('empty.title')}
              </h2>
              <p className="text-white/40 max-w-sm mb-10 font-medium leading-relaxed">
                {t('empty.subtitle')}
              </p>
              <Button 
                onClick={() => router.push(`/${locale}/dishes/create`)}
                className="h-14 px-10 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest"
              >
                {t('empty.button')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!dishToDelete} onOpenChange={() => setDishToDelete(null)}>
        <DialogContent className="bg-black border border-white/10 rounded-[2.5rem] selection:bg-indigo-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic text-white tracking-tight uppercase">
              {t('delete.title')}
            </DialogTitle>
            <DialogDescription className="text-white/40 font-medium leading-relaxed pt-2">
              {t('delete.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 pt-10">
            <Button
              variant="ghost"
              onClick={() => setDishToDelete(null)}
              className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white hover:bg-white/5 border border-white/10"
            >
              {t('delete.cancel')}
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="h-12 px-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-500/20 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
