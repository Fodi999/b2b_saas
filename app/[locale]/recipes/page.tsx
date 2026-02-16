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
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-[1440px] space-y-12 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <div className="h-1 w-8 bg-zinc-800 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('header.subtitle')}</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
                {t('header.title').split(' ')[0]} <span className="text-indigo-500">{t('header.title').split(' ')[1] || 'CORE'}</span>
              </h1>
              <Badge variant="outline" className="hidden sm:flex px-4 py-1 rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                {t('header.sync')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push(`/${locale}/recipes/create`)}
              className="bg-white text-black hover:bg-zinc-200 rounded-2xl h-14 px-8 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl border-none"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t('actions.create')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-[2rem] font-bold uppercase tracking-wider text-sm flex items-center gap-4">
            <AlertTriangle className="h-6 w-6" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] rounded-[2.5rem] bg-white/[0.03] border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-20 flex flex-col items-center text-center space-y-8">
            <div className="h-24 w-24 rounded-[2rem] bg-zinc-900 flex items-center justify-center border border-white/5">
              <ChefHat className="h-12 w-12 text-zinc-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">No Recipes Found</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Start by creating your first tech card</p>
            </div>
            <Button
              onClick={() => router.push(`/${locale}/recipes/create`)}
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl h-12 px-8 font-black uppercase tracking-widest"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="relative group">
                <Card 
                  key={recipe.id}
                  className="group border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                >
                  {/* Image/Header */}
                  <div className="relative h-56 w-full overflow-hidden">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ChefHat className="h-16 w-16 text-slate-300 dark:text-slate-700" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-widest border-none shadow-lg">
                        {t('card.servings', { count: recipe.servings })}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-8 pb-4 flex-1 flex flex-col gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors mb-2">
                        {recipe.name}
                      </h3>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          {t('card.prepTime', { count: recipe.prepTime })}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                          {getDifficultyLabel(recipe.difficulty)}
                        </div>
                      </div>
                    </div>

                    {/* Costing Section */}
                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black">{t('card.totalCost')}</p>
                          <p className="text-xl font-black text-slate-900 dark:text-slate-100 italic">
                            {recipe.totalCost.toFixed(1)} <span className="text-xs font-bold not-italic opacity-40">PLN</span>
                          </p>
                        </div>
                        <div className="border-l border-slate-200 dark:border-slate-800 pl-6 space-y-1">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black">{t('card.perServing')}</p>
                          <p className="text-xl font-black text-emerald-500 italic">
                            {recipe.costPerServing.toFixed(1)} <span className="text-xs font-bold not-italic opacity-40">PLN</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Warnings / Availablity */}
                    <div className="mt-auto">
                      {recipe.warnings.length > 0 ? (
                        <div className="space-y-4">
                          <button
                            onClick={() => setExpandedWarnings(expandedWarnings === recipe.id ? null : recipe.id)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 transition-all border border-amber-500/10 scale-100 active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-5 w-5 animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest">
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

                  <CardFooter className="p-8 pt-0 gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-slate-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all group/btn"
                      onClick={() => router.push(`/${locale}/recipes/${recipe.id}`)}
                    >
                      {t('card.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(recipe.id)}
                      className="h-12 w-12 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
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
