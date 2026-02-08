'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchCatalog, UNIT_LABELS, CATEGORIES } from '@/lib/mock-data/catalog';
import type { CatalogProduct } from '@/lib/mock-data/catalog';

type ProductSearchProps = {
  onSelect: (product: CatalogProduct) => void;
};

export default function ProductSearch({ onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      const searchResults = searchCatalog(value);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (product: CatalogProduct) => {
    onSelect(product);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Начните вводить название продукта..."
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((product) => {
              const categoryInfo = CATEGORIES[product.category as keyof typeof CATEGORIES];
              return (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {/* Category Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-2xl dark:bg-gray-800">
                    {categoryInfo?.icon || '📦'}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {categoryInfo?.name} · Срок годности: {product.shelfLifeDays} дн.
                    </div>
                  </div>

                  {/* Unit Badge */}
                  <div className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {UNIT_LABELS[product.baseUnit]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Продукт не найден. Попробуйте другой запрос.
          </p>
        </div>
      )}
    </div>
  );
}
