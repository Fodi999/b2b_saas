'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Users, Sparkles, ChefHat, Info, Utensils, Package, ChevronRight, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { formatQuantity } from '@/lib/utils/format';
import { getRecipe, getRecipeInsights, type RecipeDTO } from '@/lib/api/recipes';

export default function RecipeDetailPage() {
  const { user, accessToken } = useAuthStore();
  const { items: inventoryItems } = useInventoryStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<RecipeDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const fetchRecipeData = async () => {
      if (!accessToken || !recipeId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRecipe(recipeId, accessToken);
        setRecipe(data);
      } catch (err) {
        console.error('❌ [RECIPE_DETAIL] Ошибка загрузки:', err);
        setError('Не удалось загрузить рецепт');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeData();
  }, [user, accessToken, recipeId, router, locale]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Загрузка рецепта...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Произошла ошибка</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Рецепт не найден'}</p>
        <Button onClick={() => router.push(`/${locale}/recipes`)}>
          Вернуться к списку
        </Button>
      </div>
    );
  }

  // AI Analysis Handler
  const handleAnalyze = async () => {
    if (!recipeId || !accessToken) return;

    setIsAnalyzing(true);

    try {
      console.log('🚀 [RECIPE_DETAIL] Запуск AI анализа...', { recipeId });

      // Вызываем API для генерации AI Insights
      const result = await getRecipeInsights(recipeId, 'ru', accessToken);

      console.log('✅ [RECIPE_DETAIL] AI анализ завершен:', {
        score: result.insights.feasibility_score,
        generatedIn: result.generated_in_ms
      });

      // Redirect to analysis page
      router.push(`/${locale}/recipes/${recipeId}/analysis`);
    } catch (err) {
      console.error('❌ [RECIPE_DETAIL] Ошибка AI анализа:', err);
      alert('Не удалось проанализировать рецепт. Попробуйте еще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/recipes`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Рецепты
          </Button>

          {/* Header */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start gap-4">
               <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/30">
                <Utensils className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {recipe.name}
                </h1>
                
                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    30 мин
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {recipe.servings} порций
                  </div>
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium dark:bg-gray-800 uppercase">
                    {recipe.status}
                  </div>
                </div>

                {/* AI Analysis Button */}
                <div className="mt-6">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11 px-6 rounded-xl shadow-lg shadow-indigo-500/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isAnalyzing ? 'Анализируем...' : 'Проанализировать рецепт'}
                  </Button>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    AI проверит технологию, безопасность и даст рекомендации
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Summary (Calculated on frontend or via Insights) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="h-5 w-5" />
                <p className="text-sm font-medium">Себестоимость</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                Рассчитывается AI...
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Package className="h-5 w-5" />
                <p className="text-sm font-medium">Ингредиенты</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {recipe.ingredients.length}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Нажмите анализ для проверки наличия
              </p>
            </div>
          </div>

          {/* Ingredients List */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Ингредиенты
            </h2>
            <div className="mt-4 space-y-3">
              {recipe.ingredients.map((ingredient, index) => {
                // Backend gives us catalog_ingredient_id, we might want names later
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ingredient.catalog_ingredient_id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions (if available) */}
          {recipe.instructions && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Приготовление
              </h2>
              <div className="mt-4 text-gray-700 leading-relaxed dark:text-gray-300 whitespace-pre-wrap">
                {recipe.instructions}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
