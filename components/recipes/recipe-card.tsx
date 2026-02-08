'use client';

import { Clock, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { RECIPE_CATEGORIES } from '@/lib/mock-data/recipes';
import type { Recipe } from '@/lib/mock-data/recipes';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type RecipeCardProps = {
  recipe: Recipe;
  cost: number;
  costPerServing: number;
};

export default function RecipeCard({ recipe, cost, costPerServing }: RecipeCardProps) {
  const params = useParams();
  const locale = params.locale as string;
  const category = RECIPE_CATEGORIES[recipe.category as keyof typeof RECIPE_CATEGORIES];

  const getStatusBadge = () => {
    switch (recipe.status) {
      case 'ok':
        return (
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            OK
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <AlertCircle className="h-3 w-3" />
            Внимание
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            <XCircle className="h-3 w-3" />
            Проблема
          </div>
        );
    }
  };

  return (
    <Link
      href={`/${locale}/recipes/${recipe.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{category?.icon || '🍽️'}</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {recipe.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category?.name}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {recipe.description}
      </p>

      {/* Meta Info */}
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
      </div>

      {/* Cost Info */}
      <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              Себестоимость (бот)
            </p>
            <p className="mt-1 text-lg font-bold text-indigo-900 dark:text-indigo-100">
              {cost.toFixed(2)} PLN
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              За порцию
            </p>
            <p className="mt-1 text-lg font-bold text-indigo-900 dark:text-indigo-100">
              {costPerServing.toFixed(2)} PLN
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights Preview */}
      {recipe.aiInsights.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            🤖 AI заметил:
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {recipe.aiInsights[0]}
          </p>
        </div>
      )}
    </Link>
  );
}
