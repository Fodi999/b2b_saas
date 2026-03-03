'use client';

import { useState } from 'react';
import { Package, Calendar, DollarSign, Scale, Folder, ArrowRight, ChevronLeft, Sparkles, Clock, CalendarDays, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import ProductSearch from './product-search';
import { addInventoryProduct, type CatalogIngredientDTO } from '@/lib/api/inventory';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventory } from '@/lib/hooks/use-inventory';
import { formatDate } from '@/lib/utils/format';

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const t = useTranslations('inventory.modal');
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [selectedProduct, setSelectedProduct] = useState<CatalogIngredientDTO | null>(null);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const { reloadInventory } = useInventory();

  const handleProductSelect = (product: CatalogIngredientDTO) => {
    setSelectedProduct(product);
    setStep('details');
  };

  const handleBack = () => {
    setStep('search');
    setSelectedProduct(null);
  };

  const handleClose = () => {
    setStep('search');
    setSelectedProduct(null);
    setPrice('');
    setQuantity('');
    setReceivedAt(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !price || !quantity || !accessToken) return;

    setIsSubmitting(true);
    
    // Конвертируем данные под backend формат
    const pricePLN = parseFloat(price);
    const priceInCents = Math.round(pricePLN * 100); 
    const receivedAtISO = `${receivedAt}T10:00:00Z`;
    
    // В V3 expires_at обязателен, рассчитываем его если не задан явно
    // Мы берем расчетное значение из UI логики
    const estimatedShelfLifeDays = selectedProduct.default_shelf_life_days || 30;
    const expirationDate = new Date(new Date(receivedAt).getTime() + estimatedShelfLifeDays * 24 * 60 * 60 * 1000);
    const expiresAtISO = expirationDate.toISOString();

    try {
      await addInventoryProduct(
        {
          catalog_ingredient_id: selectedProduct.id,
          quantity: parseFloat(quantity),
          price_per_unit_cents: priceInCents,
          received_at: receivedAtISO,
          expires_at: expiresAtISO,
        },
        accessToken
      );
      await reloadInventory();
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    selectedProduct && price && quantity && parseFloat(price) > 0 && parseFloat(quantity) > 0 && !isSubmitting;

  const getUnitLabel = (unit: 'kilogram' | 'liter' | 'piece') => {
    if (unit === 'kilogram') return 'кг';
    if (unit === 'liter') return 'л';
    return 'шт';
  };

  const estimatedShelfLifeDays = selectedProduct?.default_shelf_life_days || 30;
  const expiresAt = selectedProduct && receivedAt
    ? new Date(new Date(receivedAt).getTime() + estimatedShelfLifeDays * 24 * 60 * 60 * 1000)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[98vw] sm:w-full rounded-[1.5rem] sm:rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-8 pb-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-2 text-left">
            <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
               <Package className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {t('title')}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500">
                {t('subtitle')}
              </DialogDescription>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="flex gap-2 mt-4 sm:mt-6">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'search' || step === 'details' ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-slate-100 dark:bg-slate-800'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step === 'details' ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-slate-100 dark:bg-slate-800'}`} />
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-8 max-h-[75vh] overflow-y-auto scrollbar-hide">
          {step === 'search' ? (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {t('stepSearch')}
                </h3>
                <Badge variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 font-bold px-2 sm:px-3 text-[8px] sm:text-[10px]">STEP 01</Badge>
              </div>
              <ProductSearch onSelect={handleProductSelect} />
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                   {t('stepDetails')}
                </h3>
                <Button variant="ghost" size="sm" onClick={handleBack} className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg sm:rounded-xl font-black uppercase text-[8px] sm:text-[9px] tracking-widest text-indigo-600 hover:bg-indigo-50">
                  <ChevronLeft className="h-3 w-3 mr-1" /> {t('back')}
                </Button>
              </div>

              {selectedProduct && (
                <div className="p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3 sm:gap-6 group hover:border-indigo-500/30 transition-all">
                  <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-lg sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                    {selectedProduct.image_url ? (
                      <img src={selectedProduct.image_url} alt={selectedProduct.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 sm:h-8 sm:w-8 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{selectedProduct.name}</h4>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit">
                      {typeof selectedProduct.category === 'object' ? selectedProduct.category.name : selectedProduct.category || ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="price" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    {t('priceLabel')}
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-base sm:text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="quantity" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    {t('quantityLabel')} ({getUnitLabel(selectedProduct?.default_unit as any)})
                  </Label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-base sm:text-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="space-y-2 sm:space-y-3">
                   <Label htmlFor="receivedAt" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      {t('dateLabel')}
                   </Label>
                   <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="receivedAt"
                        type="date"
                        value={receivedAt}
                        onChange={(e) => setReceivedAt(e.target.value)}
                        className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-base sm:text-lg"
                      />
                   </div>
                </div>
              </div>

              {expiresAt && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-500/10 flex items-center gap-4 text-amber-700 dark:text-amber-400">
                  <Clock className="h-5 w-5 flex-shrink-0 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider">
                     {t('expiryNote', { days: estimatedShelfLifeDays, date: formatDate(expiresAt.toISOString()) })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 sm:p-8 pt-0 flex-row gap-2 sm:gap-4">
          <Button variant="ghost" onClick={handleClose} className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600">
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-[2] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSubmitting ? '...' : step === 'search' ? t('continue') : t('submit')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
