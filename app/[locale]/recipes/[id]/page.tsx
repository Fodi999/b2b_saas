'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Users, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { MOCK_RECIPES, RECIPE_CATEGORIES } from '@/lib/mock-data/recipes';
import { MOCK_INVENTORY, formatQuantity } from '@/lib/mock-data/inventory';
import { CATEGORIES } from '@/lib/mock-data/catalog';

export default function RecipeDetailPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const recipeId = params.id as string;

  if (!user) {
    router.push(`/${locale}/login`);
    return null;
  }

  const recipe = MOCK_RECIPES.find(r => r.id === recipeId);

  if (!recipe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Рецепт не найден</p>
      </div>
    );
  }

  const category = RECIPE_CATEGORIES[recipe.category as keyof typeof RECIPE_CATEGORIES];

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
              <div className="text-5xl">{category?.icon || '🍽️'}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {recipe.name}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {recipe.description}
                </p>
                
                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {recipe.prepTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.prepTime} мин
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {recipe.servings} порций
                  </div>
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium dark:bg-gray-800">
                    {category?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="h-5 w-5" />
                <p className="text-sm font-medium">Себестоимость (автоматически)</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                {recipe.totalCost.toFixed(2)} PLN
              </p>
              <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                {recipe.costPerServing.toFixed(2)} PLN за порцию
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
                {recipe.status === 'ok' ? '✅ Все в наличии' : recipe.status === 'warning' ? '⚠️ Есть проблемы' : '❌ Недоступно'}
              </p>
            </div>
          </div>

          {/* AI Insights */}
          {recipe.aiInsights.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    🤖 AI Insights
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {recipe.aiInsights.map((insight, index) => (
                      <li key={index} className="text-sm text-amber-700 dark:text-amber-300">
                        • {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Ingredients List */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Ингредиенты
            </h2>
            <div className="mt-4 space-y-3">
              {recipe.ingredients.map((ingredient, index) => {
                const inventoryItem = MOCK_INVENTORY.find(
                  item => item.catalogProductId === ingredient.catalogProductId
                );
                const catalogCategory = inventoryItem ? CATEGORIES[inventoryItem.category as keyof typeof CATEGORIES] : null;
                const isAvailable = inventoryItem && inventoryItem.quantity >= ingredient.quantity;
                const isExpiring = inventoryItem?.status === 'expiring';
                const isExpired = inventoryItem?.status === 'expired';

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      isExpired
                        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                        : isExpiring
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
                        : !isAvailable
                        ? 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'
                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{catalogCategory?.icon || '📦'}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {ingredient.productName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ingredient.quantity} {ingredient.unit}
                          {inventoryItem && (
                            <> · На складе: {formatQuantity(inventoryItem.quantity, inventoryItem.baseUnit)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isExpired ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                          Просрочен
                        </span>
                      ) : isExpiring ? (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Истекает
                        </span>
                      ) : !isAvailable ? (
                        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          Недостаточно
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                          ✓ В наличии
                        </span>
                      )}
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
              <p className="mt-4 text-gray-700 leading-relaxed dark:text-gray-300">
                {recipe.instructions}
              </p>
            </div>
          )}

          {/* Demo Note */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              💡 <strong>Как это работает:</strong> Бот автоматически проверяет наличие продуктов на складе, 
              считает себестоимость и отслеживает сроки годности. Вы просто видите результат.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
