'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { useInventory } from '@/lib/hooks/use-inventory';
import { deleteInventoryProduct } from '@/lib/api/inventory';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/ui/product-image';
import { ArrowLeft, Plus, Package, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import AddProductModal from '@/components/inventory/add-product-modal';

export default function InventoryPage() {
  const { user, accessToken } = useAuthStore();
  const { items, loading } = useInventoryStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Загружаем склад с backend
  const { reloadInventory } = useInventory();

  // Редирект если нет юзера
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
    }
  }, [user, router, locale]);

  // Обработчик удаления продукта
  const handleDelete = async (id: string, name: string) => {
    if (!accessToken) return;
    
    if (!confirm(`Удалить "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteInventoryProduct(id, accessToken);
      await reloadInventory();
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
      alert('Не удалось удалить продукт');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">🟢 В норме</span>;
      case 'low':
        return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">🟡 Мало</span>;
      case 'expiring':
        return <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">🟠 Истекает</span>;
      case 'expired':
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">🔴 Просрочен</span>;
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
    // Конвертируем base_unit в читаемый формат
    if (unit === 'g') return `${quantity} кг`;
    if (unit === 'ml') return `${quantity} л`;
    if (unit === 'pcs') return `${quantity} шт`;
    return `${quantity} ${unit}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getDaysRemaining = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const days = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const expiringCount = items.filter(item => item.status === 'expiring' || item.status === 'expired').length;
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

          {/* Inventory Cards (вместо таблицы) */}
          {!loading && items.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* 1️⃣ Верх - изображение + идентификация */}
                  <div className="flex gap-4">
                    {/* Изображение продукта с fallback на иконку категории */}
                    <ProductImage
                      src={item.image_url}
                      alt={item.product_name}
                      fallbackIcon={getCategoryIcon(item.category)}
                      containerClassName="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0"
                      className="h-full w-full object-cover"
                    />

                    {/* Информация о продукте */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {item.product_name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {item.category}
                          </p>
                        </div>

                        {/* Статус + кнопка удаления */}
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(item.status)}
                          <button
                            onClick={() => handleDelete(item.id, item.product_name)}
                            disabled={deletingId === item.id}
                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950"
                            title="Удалить продукт"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3️⃣ Средний блок - цифры (одна строка) */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Package className="h-4 w-4" />
                      {formatQuantity(item.quantity, item.base_unit)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      💰 {item.price.toFixed(2)} PLN
                    </span>
                  </div>

                  {/* 3️⃣.5 Даты - вторая строка */}
                  <div className="mt-2 flex flex-wrap gap-4 text-xs">
                    {item.received_at && (
                      <span className="text-gray-500 dark:text-gray-400">
                        📥 Получено: {formatDate(item.received_at)}
                      </span>
                    )}
                    <span className={`flex items-center gap-1 ${
                      item.status === 'expired' ? 'text-red-600 dark:text-red-400 font-medium' :
                      item.status === 'expiring' ? 'text-orange-600 dark:text-orange-400 font-medium' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      ⏳ Годен до: {formatDate(item.expiration_date)}
                      {(() => {
                        const days = getDaysRemaining(item.expiration_date);
                        if (days === null) return null;
                        if (days < 0) return <span className="ml-1">(просрочен)</span>;
                        if (days === 0) return <span className="ml-1">(сегодня!)</span>;
                        if (days === 1) return <span className="ml-1">(завтра)</span>;
                        if (days <= 7) return <span className="ml-1">({days}д)</span>;
                        return null;
                      })()}
                    </span>
                  </div>

                  {/* 4️⃣ Warnings - СКРЫТЫ по умолчанию (показываем только если есть) */}
                  {item.warnings && item.warnings.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400">
                        ⚠️ {item.warnings.length} {item.warnings.length === 1 ? 'предупреждение' : 'предупреждения'}
                      </summary>
                      <ul className="mt-2 space-y-1 pl-5 text-xs text-gray-600 dark:text-gray-400">
                        {item.warnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ))}
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
