'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRecipesStore } from '@/lib/stores/recipes-store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChefHat, Plus, Sparkles, Clock, Users, Trash2, X } from 'lucide-react';

export default function RecipesPage() {
  const { user } = useAuthStore();
  const { recipes, deleteRecipe } = useRecipesStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [expandedWarnings, setExpandedWarnings] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
    }
  }, [user, router, locale]);

  if (!user) {
    return null;
  }

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот рецепт?')) {
      deleteRecipe(id)
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко'
      case 'medium': return 'Средне'
      case 'hard': return 'Сложно'
      default: return difficulty
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/50">
                  <ChefHat className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Рецепты
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Создавайте рецепты — бот рассчитает себестоимость
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => router.push(`/${locale}/recipes/create`)}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Создать рецепт
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/50 dark:to-orange-900/30 flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-center text-gray-900 dark:text-white">
                У вас пока нет рецептов
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Создайте первый рецепт — бот автоматически рассчитает себестоимость 
                и проверит наличие продуктов на складе.
              </p>
              <Button 
                size="lg"
                onClick={() => router.push(`/${locale}/recipes/create`)}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Создать первый рецепт
              </Button>
            </div>
          )}

          {/* Recipe Cards */}
          {recipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image - показываем фото если есть, иначе градиент */}
                  {recipe.imageUrl ? (
                    <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/50 dark:to-orange-900/30 flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-orange-300 dark:text-orange-700" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {recipe.name}
                      </h3>
                      {recipe.warnings.length > 0 ? (
                        <button
                          onClick={() => setExpandedWarnings(expandedWarnings === recipe.id ? null : recipe.id)}
                          className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                        >
                          <span>⚠️</span>
                          <span className="underline decoration-dotted">
                            {recipe.warnings.length} {recipe.warnings.length === 1 ? 'предупреждение' : 'предупреждений'}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                          <span>✓</span>
                          <span>Все ингредиенты доступны</span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Warnings */}
                    {expandedWarnings === recipe.id && recipe.warnings.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                            Проблемы со складом:
                          </p>
                          <button
                            onClick={() => setExpandedWarnings(null)}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <ul className="space-y-1">
                          {recipe.warnings.map((warning, idx) => (
                            <li key={idx} className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                              <span className="mt-0.5">•</span>
                              <span>{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-200 dark:border-gray-800">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                          <Users className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {recipe.servings}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          порций
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {recipe.prepTime}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          минут
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-1">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {getDifficultyLabel(recipe.difficulty)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          сложность
                        </p>
                      </div>
                    </div>

                    {/* Cost Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Общая стоимость:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {recipe.totalCost.toFixed(2)} PLN
                          </span>
                          <span className="inline-flex items-center text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                            AI
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          На порцию:
                        </span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {recipe.costPerServing.toFixed(2)} PLN
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/${locale}/recipes/${recipe.id}`)}
                      >
                        Подробнее
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recipe.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
