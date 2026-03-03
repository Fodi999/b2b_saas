'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRecipesStore } from '@/lib/stores/recipes-store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipes/recipe-card';
import { 
  ArrowLeft, 
  ChefHat, 
  Plus, 
  AlertTriangle,
  Loader2,
  Search
} from 'lucide-react';
import { Input } from "@/components/ui/input";
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
import { cn } from '@/lib/utils';

export default function RecipesPage() {
  const { user, accessToken } = useAuthStore();
  const { recipes, isLoading, error, fetchRecipes, deleteRecipe } = useRecipesStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('recipes');
  const [expandedWarnings, setExpandedWarnings] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }
    
    if (accessToken) {
      fetchRecipes(accessToken);
    }
  }, [user, accessToken, router, locale, fetchRecipes]);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.08),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-[1400px] relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Minimal Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.03]">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-[1px] w-6 bg-indigo-500/60 rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-[0.45em] text-indigo-400/80">
                {t('header.subtitle')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold italic uppercase tracking-tighter leading-none text-white/90">
              {t('header.title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400/80 to-indigo-600/80 font-black">{t('header.title').split(' ')[1] || 'CORE'}</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative group w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-indigo-400/60 transition-colors" />
              <Input 
                placeholder="SEARCH..." 
                className="pl-9 h-10 bg-white/[0.03] border-white/5 rounded-lg font-bold uppercase tracking-widest text-[9px] focus-visible:ring-indigo-500/10 placeholder:text-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="h-10 w-10 rounded-lg border-white/5 bg-white/[0.03] hover:bg-white/5 text-white/30 hover:text-white/60 transition-all shadow-none"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push(`/${locale}/recipes/create`)}
              className="bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg h-10 px-6 font-bold uppercase text-[10px] tracking-widest transition-all hover:translate-y-[-1px] active:translate-y-[1px] shadow-lg shadow-indigo-600/10 border-none group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              {t('actions.create')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-4 animate-in zoom-in-95">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-[2rem] bg-white/[0.03] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-24 flex flex-col items-center text-center space-y-8 backdrop-blur-sm">
            <div className="h-24 w-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner group">
              <ChefHat className="h-12 w-12 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                NO ENCRYPTED RECIPES
              </h2>
              <p className="text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">
                THE DATABASE IS EMPTY. INITIATE FIRST PROTOCOL.
              </p>
            </div>
            <Button
              onClick={() => router.push(`/${locale}/recipes/create`)}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              CREATE FIRST DATA_BLOCK
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                cost={recipe.totalCost} 
                costPerServing={recipe.costPerServing} 
              />
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
