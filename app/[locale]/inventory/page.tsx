'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Package, AlertCircle, Loader2 } from 'lucide-react';
import AddProductModal from '@/components/inventory/add-product-modal';

export default function InventoryPage() {
  const { user } = useAuthStore();
  const { items, loading } = useInventoryStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загружаем склад с backend
  useInventory();

  // Редирект если нет юзера
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
    }
  }, [user, router, locale]);

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">В наличии</span>;
      case 'low':
        return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">Мало</span>;
      case 'expiring':
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">Истекает</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-950 dark:text-gray-300">{status}</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Dairy': '🥛',
      'Vegetables': '🥕',
      'Meat': '🥩',
      'Fish': '🐟',
      'Fruits': '🍎',
      'Grains': '🌾',
      'Spices': '🧂',
      'Beverages': '🥤',
      'Other': '📦',
    };
    return icons[category] || '📦';
  };

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity} ${unit}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const expiringCount = items.filter(item => item.status === 'expiring').length;
  const lowStockCount = items.filter(item => item.status === 'low').length;
  const hasAlerts = expiringCount > 0 || lowStockCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* BACKEND CONNECTION STATUS */}
          <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4 dark:bg-green-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <span className="text-xl">🟢</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 dark:text-green-100">
                  ✅ СКЛАД ЗАГРУЖЕН С BACKEND (Query DTO)
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Product данные приходят joined - нет N+1 запросов! Статусы и warnings рассчитываются на frontend.
                </p>
              </div>
            </div>
          </div>

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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/50">
                  <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Склад
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {loading ? 'Загрузка...' : `${items.length} позиций на складе`}
                  </p>
                </div>
              </div>

              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить продукт
              </Button>
            </div>
          </div>

          {/* Alerts - показываем только если есть warnings с backend */}
          {hasAlerts && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Внимание! Требуется проверка
                  </p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    {expiringCount > 0 && `${expiringCount} продуктов истекают в ближайшее время. `}
                    {lowStockCount > 0 && `${lowStockCount} продуктов заканчиваются.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Загрузка склада с BACKEND...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
              <Package className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Склад пуст
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Добавьте первый продукт чтобы начать учёт
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Добавить продукт
              </Button>
            </div>
          )}

          {/* Inventory Table */}
          {!loading && items.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        Продукт
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        Количество
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        Цена
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        Срок годности
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        Warnings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.product_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {item.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatQuantity(item.quantity, item.base_unit)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {item.price.toFixed(2)} PLN
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(item.expiration_date)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4">
                          {item.warnings && item.warnings.length > 0 ? (
                            <div className="space-y-1">
                              {item.warnings.map((warning, idx) => (
                                <div key={idx} className="text-xs text-amber-600 dark:text-amber-400">
                                  ⚠️ {warning}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
