'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { useInventory } from '@/lib/hooks/use-inventory';
import { deleteInventoryProduct } from '@/lib/api/inventory';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/ui/product-image';
import { 
  ArrowLeft, 
  Plus, 
  Package, 
  AlertCircle, 
  Loader2, 
  Trash2,
  Milk,
  Carrot,
  Beef,
  Fish,
  Apple,
  Wheat,
  Soup,
  Coffee,
  Folder
} from 'lucide-react';
import AddProductModal from '@/components/inventory/add-product-modal';

export default function InventoryPage() {
  const { user, accessToken } = useAuthStore();
  const { items, loading } = useInventoryStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

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
    const baseClasses = "rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:py-1 sm:text-xs";
    
    switch (status) {
      case 'in-stock':
        return <span className={`${baseClasses} bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300`}>🟢 <span className="hidden sm:inline">В норме</span></span>;
      case 'low':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300`}>🟡 <span className="hidden sm:inline">Мало</span></span>;
      case 'expiring':
        return <span className={`${baseClasses} bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300`}>🟠 <span className="hidden sm:inline">Истекает</span></span>;
      case 'expired':
        return <span className={`${baseClasses} bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300`}>🔴 <span className="hidden sm:inline">Просрочен</span></span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300`}>{status}</span>;
    }
  };

  const getCategoryIcon = (category: string, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-10 w-10',
    };
    
    const iconSize = sizeClasses[size];
    
    const iconMap: Record<string, React.ReactNode> = {
      // English
      'Dairy': <Milk className={iconSize} />,
      'Vegetables': <Carrot className={iconSize} />,
      'Meat': <Beef className={iconSize} />,
      'Fish': <Fish className={iconSize} />,
      'Fruits': <Apple className={iconSize} />,
      'Grains': <Wheat className={iconSize} />,
      'Spices': <Soup className={iconSize} />,
      'Beverages': <Coffee className={iconSize} />,
      'Other': <Package className={iconSize} />,
      // Русский
      'Молочные продукты и яйця': <Milk className={iconSize} />,
      'Овощи': <Carrot className={iconSize} />,
      'Мясо': <Beef className={iconSize} />,
      'Рыба': <Fish className={iconSize} />,
      'Фрукты': <Apple className={iconSize} />,
      'Зерновые': <Wheat className={iconSize} />,
      'Специи': <Soup className={iconSize} />,
      'Напитки': <Coffee className={iconSize} />,
      'Другое': <Package className={iconSize} />,
    };
    return iconMap[category] || <Package className={iconSize} />;
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

  // Получаем уникальные категории и группируем продукты
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; count: number }>();
    
    items.forEach(item => {
      if (item.category) {
        const existing = categoryMap.get(item.category);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(item.category, {
            name: item.category,
            count: 1
          });
        }
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }, [items]);

  // Фильтруем продукты по выбранной категории
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') {
      return items;
    }
    return items.filter(item => item.category === activeTab);
  }, [items, activeTab]);

  const expiringCount = items.filter(item => item.status === 'expiring' || item.status === 'expired').length;
  const lowStockCount = items.filter(item => item.status === 'low').length;
  const hasAlerts = expiringCount > 0 || lowStockCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
          {/* BACKEND CONNECTION STATUS - скрываем на мобильных */}
          <div className="hidden rounded-xl border-2 border-green-500 bg-green-50 p-4 dark:bg-green-950/30 sm:block">
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
          <div className="space-y-3 sm:space-y-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="gap-2"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Назад</span>
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/50 sm:h-12 sm:w-12">
                  <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    Склад
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                    {loading ? 'Загрузка...' : `${items.length} позиций на складе`}
                  </p>
                </div>
              </div>

              <Button onClick={() => setIsModalOpen(true)} className="w-full gap-2 sm:w-auto" size="sm">
                <Plus className="h-4 w-4" />
                <span className="sm:inline">Добавить</span>
              </Button>
            </div>
          </div>

          {/* Alerts - показываем только если есть warnings с backend */}
          {hasAlerts && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 sm:text-base">
                    Внимание! Требуется проверка
                  </p>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100 sm:text-base">
                    Внимание! Требуется проверка
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300 sm:text-sm">
                    {expiringCount > 0 && `${expiringCount} продуктов истекают в ближайшее время. `}
                    {lowStockCount > 0 && `${lowStockCount} продуктов заканчиваются.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Вкладки категорий */}
          {!loading && items.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900 sm:p-2">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {/* Вкладка "Все" */}
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                    activeTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-md dark:bg-indigo-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Все</span>
                  <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold sm:ml-1 sm:px-2 ${
                    activeTab === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {items.length}
                  </span>
                </button>

                {/* Вкладки категорий */}
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setActiveTab(category.name)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                      activeTab === category.name
                        ? 'bg-indigo-600 text-white shadow-md dark:bg-indigo-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex-shrink-0">{getCategoryIcon(category.name)}</span>
                    <span className="whitespace-nowrap">{category.name}</span>
                    <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold sm:ml-1 sm:px-2 ${
                      activeTab === category.name
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 sm:h-8 sm:w-8" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 sm:ml-3 sm:text-base">
                Загрузка склада...
              </span>
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
              <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white sm:mt-4 sm:text-lg">
                Склад пуст
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 sm:mt-2 sm:text-sm">
                Добавьте первый продукт чтобы начать учёт
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-3 gap-2 sm:mt-4" size="sm">
                <Plus className="h-4 w-4" />
                Добавить продукт
              </Button>
            </div>
          )}

          {/* Inventory Cards (вместо таблицы) */}
          {!loading && filteredItems.length > 0 && (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-5"
                >
                  {/* 1️⃣ Верх - изображение + идентификация */}
                  <div className="flex gap-3 sm:gap-4">
                    {/* Изображение продукта с fallback на иконку категории */}
                    <ProductImage
                      src={item.image_url}
                      alt={item.product_name}
                      fallbackIcon={getCategoryIcon(item.category, 'lg')}
                      containerClassName="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 sm:h-20 sm:w-20"
                      className="h-full w-full object-cover"
                    />

                    {/* Информация о продукте */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                            {item.product_name}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 sm:mt-1 sm:text-sm">
                            <Folder className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{item.category}</span>
                          </p>
                        </div>

                        {/* Статус бейдж */}
                        <div className="shrink-0">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3️⃣ Средний блок - цифры (одна строка) */}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs sm:mt-4 sm:gap-4 sm:text-sm">
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {formatQuantity(item.quantity, item.base_unit)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      💰 {item.price.toFixed(2)} PLN
                    </span>
                  </div>

                  {/* 3️⃣.5 Даты - вторая строка */}
                  <div className="mt-2 flex flex-col gap-1 text-[10px] sm:mt-2 sm:flex-row sm:flex-wrap sm:gap-3 sm:text-xs">
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
                    <details className="mt-2 sm:mt-3">
                      <summary className="cursor-pointer text-[10px] text-amber-600 hover:text-amber-700 dark:text-amber-400 sm:text-xs">
                        ⚠️ {item.warnings.length} {item.warnings.length === 1 ? 'предупреждение' : 'предупреждения'}
                      </summary>
                      <ul className="mt-1.5 space-y-0.5 pl-4 text-[10px] text-gray-600 dark:text-gray-400 sm:mt-2 sm:space-y-1 sm:pl-5 sm:text-xs">
                        {item.warnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {/* 5️⃣ Футер - кнопка удаления */}
                  <div className="mt-3 flex justify-end border-t border-gray-100 pt-2 dark:border-gray-800 sm:mt-4 sm:pt-3">
                    <button
                      onClick={() => handleDelete(item.id, item.product_name)}
                      disabled={deletingId === item.id}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400 sm:gap-2 sm:px-3 sm:text-sm"
                      title="Удалить продукт"
                    >
                      {deletingId === item.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Удаление...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>Удалить</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State для выбранной категории */}
          {!loading && items.length > 0 && filteredItems.length === 0 && activeTab !== 'all' && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
              <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white sm:mt-4 sm:text-lg">
                В категории "{activeTab}" нет продуктов
              </h3>
              <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 sm:mt-2 sm:text-sm">
                Выберите другую категорию или добавьте новый продукт
              </p>
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
