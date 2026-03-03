'use client';

import { useState, useEffect } from 'react';
import { Search, Folder, UtensilsCrossed, Sparkles, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { searchCatalogIngredients, type CatalogIngredientDTO } from '@/lib/api/inventory';
import { useAuthStore } from '@/lib/stores/auth-store';
import ProductImage from '@/components/ui/product-image';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ProductSearchProps = {
  onSelect: (product: CatalogIngredientDTO) => void;
};

export default function ProductSearch({ onSelect }: ProductSearchProps) {
  const t = useTranslations('inventory.search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogIngredientDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await searchCatalogIngredients(query, accessToken || undefined);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, accessToken]);

  const handleSelect = (product: CatalogIngredientDTO) => {
    onSelect(product);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {isLoading ? (
              <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500 animate-spin z-10" />
            ) : (
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 z-10" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('placeholder')}
              className="flex h-14 w-full rounded-[1.25rem] border-none bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all font-bold"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[var(--radix-popover-trigger-width)] border-none shadow-2xl rounded-2xl overflow-hidden mt-2 bg-white dark:bg-slate-900" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command className="border-none" shouldFilter={false}>
            <CommandList className="max-h-[300px]">
              {results.length === 0 && !isLoading && (
                <CommandEmpty className="p-8 text-center space-y-4">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {t('results.notFoundTitle')}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {t('results.notFoundDesc')}
                    </p>
                  </div>
                </CommandEmpty>
              )}
              <CommandGroup>
                {results.map((product) => {
                  const unitLabel =
                    product.default_unit === 'kilogram' ? t('units.kg') : product.default_unit === 'liter' ? t('units.l') : t('units.pcs');
                  return (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => handleSelect(product)}
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        fallbackIcon={<UtensilsCrossed className="h-5 w-5 text-muted-foreground" />}
                        containerClassName="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {product.category && (
                            <span className="flex items-center gap-1 mr-2">
                              <Folder className="h-3 w-3" />
                              {product.category.name}
                            </span>
                          )}
                          <span>Базовая ед.: {unitLabel}</span>
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
