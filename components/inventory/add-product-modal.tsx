'use client';

import { useState } from 'react';
import { X, Package, Calendar, DollarSign, Scale, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductSearch from './product-search';
import { addInventoryProduct, type CatalogIngredientDTO } from '@/lib/api/inventory';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { formatDate } from '@/lib/utils/format';

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [selectedProduct, setSelectedProduct] = useState<CatalogIngredientDTO | null>(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const addItem = useInventoryStore((state) => state.addItem);

  if (!isOpen) return null;

  const handleProductSelect = (product: CatalogIngredientDTO) => {
    setSelectedProduct(product);
    setStep('details');
  };

  const handleBack = () => {
    setStep('search');
    setSelectedProduct(null);
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !price || !quantity || !accessToken) return;

    setIsSubmitting(true);
    
    // Конвертируем данные под backend формат
    const pricePLN = parseFloat(price);
    const priceInCents = Math.round(pricePLN * 100); // PLN -> центы
    const expiresAtISO = `${receivedAt}T23:59:59Z`; // YYYY-MM-DD -> ISO datetime
    
    console.log('📦 Добавляем продукт в склад (backend API):', {
      catalog_ingredient_id: selectedProduct.id,
      quantity: parseFloat(quantity),
      price_per_unit_cents: priceInCents,
      expires_at: expiresAtISO,
    });

    try {
      // Вызов backend API
      const newProduct = await addInventoryProduct(
        {
          catalog_ingredient_id: selectedProduct.id,
          quantity: parseFloat(quantity),
          price_per_unit_cents: priceInCents,
          expires_at: expiresAtISO,
        },
        accessToken
      );

      console.log('✅ Продукт добавлен на склад (backend):', newProduct);

      // Обновляем локальный store
      addItem({
        id: newProduct.id,
        product_name: newProduct.product_name,
        category: newProduct.category,
        quantity: newProduct.quantity,
        base_unit: newProduct.base_unit,
        price: newProduct.price,
        status: newProduct.status,
        expiration_date: newProduct.expiration_date,
        warnings: newProduct.warnings,
      });

      // Reset и close
      setStep('search');
      setSelectedProduct(null);
      setPrice('');
      setQuantity('');
      setReceivedAt(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (error) {
      console.error('❌ Ошибка добавления продукта:', error);
      alert('Ошибка добавления продукта. Проверьте консоль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    selectedProduct && price && quantity && parseFloat(price) > 0 && parseFloat(quantity) > 0 && !isSubmitting;

  // Конвертируем unit для отображения
  const getUnitLabel = (unit: 'kilogram' | 'liter' | 'piece') => {
    if (unit === 'kilogram') return 'кг';
    if (unit === 'liter') return 'л';
    return 'шт';
  };

  // Вычисляем срок годности для превью
  const estimatedShelfLifeDays = selectedProduct?.default_shelf_life_days || 30;
  const expiresAt = selectedProduct && receivedAt
    ? new Date(new Date(receivedAt).getTime() + estimatedShelfLifeDays * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
              <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Добавить продукт на склад
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'search' ? (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Найдите продукт в каталоге, чтобы добавить его на склад
              </p>
              <ProductSearch onSelect={handleProductSelect} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Выбранный продукт */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProduct?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getUnitLabel(selectedProduct?.default_unit || 'piece')} • Срок хранения: {selectedProduct?.default_shelf_life_days} дн.
                    </p>
                  </div>
                  <button
                    onClick={handleBack}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Изменить
                  </button>
                </div>
              </div>

              {/* Поля ввода */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Цена */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DollarSign className="mr-1 inline h-4 w-4" />
                    Цена за единицу (PLN)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                {/* Количество */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Scale className="mr-1 inline h-4 w-4" />
                    Количество ({getUnitLabel(selectedProduct?.default_unit || 'piece')})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Дата поступления */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Дата поступления
                </label>
                <input
                  type="date"
                  value={receivedAt}
                  onChange={(e) => setReceivedAt(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Превью срока годности */}
              {expiresAt && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <CheckCircle className="mr-1 inline h-4 w-4" />
                    Примерный срок годности: <strong>{formatDate(expiresAt)}</strong>
                    <br />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      (Backend автоматически рассчитает точный срок и статус)
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'details' && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-800">
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Назад
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isSubmitting ? 'Добавляем...' : 'Добавить продукт'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
