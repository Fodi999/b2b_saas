'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRecipesStore } from '@/lib/stores/recipes-store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ChefHat, 
  Plus, 
  Sparkles, 
  Clock, 
  Users, 
  Trash2, 
  X, 
  Loader2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from 'next-intl';

export default function RecipesPage() {
  const { user, accessToken } = useAuthStore();
  const { recipes, isLoading, error, fetchRecipes, deleteRecipe } = useRecipesStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('recipes');
  const [expandedWarnings, setExpandedWarnings] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    
    if (accessToken) {
      fetchRecipes(accessToken);
    }
  }, [user, accessToken, router, locale, fetchRecipes]);

  if (!user) {
    return null;
  }

  const handleDelete = (id: string) => {
    setRecipeToDelete(id);
  };

  const confirmDelete = async () => {
    if (recipeToDelete && accessToken) {
      try {
        await deleteRecipe(recipeToDelete, accessToken);
        setRecipeToDelete(null);
      } catch (err) {
        alert('Не удалось удалить рецепт');
      }
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return t('difficulty.easy')
      case 'medium': return t('difficulty.medium')
      case 'hard': return t('difficulty.hard')
      default: return difficulty
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12 max-w-[1440px] space-y-6 sm:space-y-12 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 mb-2">
              <div className="h-0.5 w-4 sm:w-8 bg-zinc-400 dark:bg-zinc-800 rounded-full" />
              <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em]">{t('header.subtitle')}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
                {t('header.title').split(' ')[0]} <span className="text-indigo-600 dark:text-indigo-500">{t('header.title').split(' ')[1] || 'CORE'}</span>
              </h1>
              <Badge variant="outline" className="px-2 sm:px-4 py-0.5 sm:py-1 rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest text-[7px] sm:text-[10px]">
                {t('header.sync')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </Button>
            <Button
              onClick={() => router.push(`/${locale}/recipes/create`)}
              className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg sm:rounded-2xl h-10 sm:h-14 px-4 sm:px-8 font-black uppercase text-[9px] sm:text-[12px] tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20 border-none flex-1 sm:flex-initial"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {t('actions.create')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] font-bold uppercase tracking-wider text-[11px] sm:text-sm flex items-center gap-4">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[350px] sm:h-[400px] rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-20 flex flex-col items-center text-center space-y-6 sm:space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">No Recipes Found</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-xs">Start by creating your first tech card</p>
            </div>
            <Button
              onClick={() => router.push(`/${locale}/recipes/create`)}
              variant="outline"
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl sm:rounded-2xl h-10 sm:h-12 px-6 sm:px-8 font-black uppercase text-[10px] tracking-widest"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <Card 
                  key={recipe.id}
                  className="group border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-3xl sm:rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                >
                  {/* Image/Header */}
                  <div className="relative h-40 sm:h-56 w-full overflow-hidden">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-700" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <Badge className="bg-white/95 dark:bg-black/95 backdrop-blur-md px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-indigo-600 dark:text-indigo-400 font-black uppercase text-[7px] sm:text-[10px] tracking-widest border-none shadow-lg">
                        {t('card.servings', { count: recipe.servings })}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-5 sm:p-8 pb-4 flex-1 flex flex-col gap-3 sm:gap-6">
                    <div>
                      <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors mb-2">
                        {recipe.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Clock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-indigo-500" />
                          {t('card.prepTime', { count: recipe.prepTime })}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Sparkles className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-indigo-500" />
                          {getDifficultyLabel(recipe.difficulty)}
                        </div>
                      </div>
                    </div>

                    {/* Costing Section */}
                    <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
                      <div className="grid grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1">
                          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black">{t('card.totalCost')}</p>
                          <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 italic">
                            {recipe.totalCost.toFixed(1)} <span className="text-[10px] font-bold not-italic opacity-40">PLN</span>
                          </p>
                        </div>
                        <div className="border-l border-slate-200 dark:border-slate-800 pl-4 sm:pl-6 space-y-1">
                          <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black">{t('card.perServing')}</p>
                          <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-500 italic">
                            {recipe.costPerServing.toFixed(1)} <span className="text-[10px] font-bold not-italic opacity-40">PLN</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Warnings / Availablity */}
                    <div className="mt-auto">
                      {recipe.warnings.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          <button
                            onClick={() => setExpandedWarnings(expandedWarnings === recipe.id ? null : recipe.id)}
                            className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/5 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 transition-all border border-amber-500/10 scale-100 active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-left">
                                {recipe.warnings.length === 1 
                                  ? t('status.warnings', { count: recipe.warnings.length }) 
                                  : t('status.warningsPlural', { count: recipe.warnings.length })}
                              </span>
                            </div>
                            {expandedWarnings === recipe.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          
                          {expandedWarnings === recipe.id && (
                            <div className="p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20 space-y-3 animate-in slide-in-from-top-4 duration-300">
                              <ul className="space-y-2">
                                {recipe.warnings.map((warning, idx) => (
                                  <li key={idx} className="text-xs font-bold text-amber-800 dark:text-amber-200 flex items-start gap-3 leading-tight opacity-80">
                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                                    <span>{warning}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{t('status.fullStock')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 sm:p-8 pt-0 gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-10 sm:h-12 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all group/btn"
                      onClick={() => router.push(`/${locale}/recipes/${recipe.id}`)}
                    >
                      {t('card.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(recipe.id)}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </CardFooter>
                </Card>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(recipe.id);
                  }}
                  className="absolute top-6 right-6 p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!recipeToDelete} onOpenChange={(open) => !open && setRecipeToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить рецепт?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Рецепт будет навсегда удален из вашей базы данных.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRecipeToDelete(null)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1"
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
