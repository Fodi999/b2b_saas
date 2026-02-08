'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Package, AlertCircle } from 'lucide-react';
import AddProductModal from '@/components/inventory/add-product-modal';
import { MOCK_INVENTORY, formatQuantity, formatDate, computeExpiryDate, computeStatus } from '@/lib/mock-data/inventory';
import { CATEGORIES } from '@/lib/mock-data/catalog';
import type { InventoryItem } from '@/lib/mock-data/inventory';
import type { CatalogProduct } from '@/lib/mock-data/catalog';

export default function InventoryPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  if (!user) {
    router.push(`/${locale}/login`);
    return null;
  }

  const handleAddProduct = (data: {
    product: CatalogProduct;
    price: number;
    quantity: number;
    receivedAt: Date;
  }) => {
    const expiresAt = computeExpiryDate(data.receivedAt, data.product.shelfLifeDays);
    const status = computeStatus(expiresAt);

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      catalogProductId: data.product.id,
      productName: data.product.name,
      category: data.product.category,
      baseUnit: data.product.baseUnit,
      price: data.price,
      quantity: data.quantity,
      receivedAt: data.receivedAt,
      expiresAt,
      status,
    };

    setInventory([newItem, ...inventory]);
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'fresh':
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">Свежий</span>;
      case 'expiring':
        return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">Истекает</span>;
      case 'expired':
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">Просрочен</span>;
    }
  };

  const expiringCount = inventory.filter(item => item.status === 'expiring').length;
  const expiredCount = inventory.filter(item => item.status === 'expired').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
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
                    {inventory.length} позиций на складе
                  </p>
                </div>
              </div>

              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить продукт
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {(expiringCount > 0 || expiredCount > 0) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Внимание! Требуется проверка
                  </p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    {expiringCount > 0 && `${expiringCount} продуктов истекают в ближайшее время. `}
                    {expiredCount > 0 && `${expiredCount} продуктов просрочены.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inventory List */}
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
                      Поступление
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Срок годности
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {inventory.map((item) => {
                    const categoryInfo = CATEGORIES[item.category as keyof typeof CATEGORIES];
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{categoryInfo?.icon || '📦'}</div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.productName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {categoryInfo?.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatQuantity(item.quantity, item.baseUnit)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {item.price.toFixed(2)} PLN
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(item.receivedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(item.expiresAt)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Demo Note */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              💡 <strong>Demo режим:</strong> Продукты выбираются из каталога. 
              Бот автоматически рассчитывает сроки годности и статусы. 
              Данные хранятся локально в этой сессии.
            </p>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
}
