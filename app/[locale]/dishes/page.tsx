'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useDishesStore } from '@/lib/stores/dishes-store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UtensilsCrossed, Plus, Trash2, X } from 'lucide-react';

export default function DishesPage() {
  const { user } = useAuthStore();
  const { dishes, deleteDish } = useDishesStore();
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
    if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
      deleteDish(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'profit': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
      case 'loss': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'profit': return '✅ Рентабельно';
      case 'warning': return '⚡ Низкая маржа';
      case 'loss': return '⚠️ Убыточно';
      default: return status;
    }
  };

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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/50">
                  <UtensilsCrossed className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Блюда
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Управляйте меню — AI рассчитает маржу и рентабельность
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/dishes/create`)}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Создать блюдо
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {dishes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/50 dark:to-purple-900/30 flex items-center justify-center mb-6">
                <UtensilsCrossed className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-3 text-center text-gray-900 dark:text-white">
                У вас пока нет блюд
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8">
                Создайте первое блюдо из рецептов — AI автоматически рассчитает
                маржу и предупредит об убытках.
              </p>
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/dishes/create`)}
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Создать первое блюдо
              </Button>
            </div>
          )}

          {/* Dish Cards */}
          {dishes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  {dish.imageUrl ? (
                    <div className="h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/50 dark:to-purple-900/30 flex items-center justify-center">
                      <UtensilsCrossed className="h-16 w-16 text-purple-300 dark:text-purple-700" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {dish.name}
                      </h3>
                      <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${getStatusColor(dish.status)}`}>
                        {getStatusLabel(dish.status)}
                      </span>
                    </div>

                    {/* Components Count */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {dish.components.length} {dish.components.length === 1 ? 'рецепт' : dish.components.length > 4 ? 'рецептов' : 'рецепта'} • 
                      {' '}{dish.components.reduce((sum, c) => sum + c.quantity, 0)} {dish.components.reduce((sum, c) => sum + c.quantity, 0) === 1 ? 'порция' : 'порции'}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2 py-3 border-y border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Себестоимость:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dish.totalCost.toFixed(2)} PLN
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Цена:</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {dish.salePrice.toFixed(2)} PLN
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Маржа:</span>
                        <span className={`font-semibold ${
                          dish.status === 'profit' ? 'text-green-600 dark:text-green-400' :
                          dish.status === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {dish.margin.toFixed(2)} PLN ({dish.marginPercent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                        <span>Food Cost:</span>
                        <span>{dish.foodCostPercent.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Warnings */}
                    {dish.warnings.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedWarnings(expandedWarnings === dish.id ? null : dish.id)}
                          className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                        >
                          <span>⚠️</span>
                          <span className="underline decoration-dotted">
                            {dish.warnings.length} {dish.warnings.length === 1 ? 'предупреждение' : 'предупреждений'}
                          </span>
                        </button>

                        {expandedWarnings === dish.id && (
                          <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                                Проблемы из рецептов:
                              </p>
                              <button
                                onClick={() => setExpandedWarnings(null)}
                                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <ul className="space-y-1">
                              {dish.warnings.map((warning, idx) => (
                                <li key={idx} className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                                  <span className="mt-0.5">•</span>
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/${locale}/dishes/${dish.id}`)}
                      >
                        Подробнее
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dish.id)}
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
