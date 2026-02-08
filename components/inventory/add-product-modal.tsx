'use client';

import { useState } from 'react';
import { X, Package, Calendar, DollarSign, Scale, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductSearch from './product-search';
import type { CatalogProduct } from '@/lib/mock-data/catalog';
import { UNIT_LABELS, CATEGORIES } from '@/lib/mock-data/catalog';
import { computeExpiryDate, formatDate } from '@/lib/mock-data/inventory';

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    product: CatalogProduct;
    price: number;
    quantity: number;
    receivedAt: Date;
  }) => void;
};

export default function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleProductSelect = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setStep('details');
  };

  const handleBack = () => {
    setStep('search');
    setSelectedProduct(null);
  };

  const handleSubmit = () => {
    if (!selectedProduct || !price || !quantity) return;

    onAdd({
      product: selectedProduct,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      receivedAt: new Date(receivedAt),
    });

    // Reset
    setStep('search');
    setSelectedProduct(null);
    setPrice('');
    setQuantity('');
    setReceivedAt(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const canSubmit = selectedProduct && price && quantity && parseFloat(price) > 0 && parseFloat(quantity) > 0;

  // Вычисляем срок годности для превью
  const expiresAt = selectedProduct && receivedAt
    ? computeExpiryDate(new Date(receivedAt), selectedProduct.shelfLifeDays)
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
            // Step 1: Search Product
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Найдите продукт в каталоге. Все характеристики подставятся автоматически.
                </p>
              </div>
              <ProductSearch onSelect={handleProductSelect} />
            </div>
          ) : (
            // Step 2: Enter Details
            <div className="space-y-6">
              {/* Selected Product Card */}
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {CATEGORIES[selectedProduct!.category as keyof typeof CATEGORIES]?.icon || '📦'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedProduct!.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {CATEGORIES[selectedProduct!.category as keyof typeof CATEGORIES]?.name} · 
                      Срок годности: {selectedProduct!.shelfLifeDays} дней
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    Изменить
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Price */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <DollarSign className="h-4 w-4" />
                    Цена закупки (PLN)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <Scale className="h-4 w-4" />
                    Количество ({UNIT_LABELS[selectedProduct!.baseUnit]})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Received Date */}
                <div className="sm:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <Calendar className="h-4 w-4" />
                    Дата поступления
                  </label>
                  <input
                    type="date"
                    value={receivedAt}
                    onChange={(e) => setReceivedAt(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Auto-computed Info */}
              {expiresAt && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Бот автоматически рассчитал срок годности
                      </p>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                        Срок годности до: <strong>{formatDate(expiresAt)}</strong>
                        {' '}({selectedProduct!.shelfLifeDays} дней с момента поступления)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'details' && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-800">
            <Button variant="outline" onClick={handleBack}>
              Назад
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Добавить продукт
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
