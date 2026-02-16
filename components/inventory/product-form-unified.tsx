'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check, AlertCircle, Languages, Scale, Tag, ArrowRight, Zap, Target, Globe } from 'lucide-react';
import { createProductUnified } from '@/lib/api/inventory';

interface ProcessingStep {
  name: string;
  status: 'pending' | 'loading' | 'done' | 'error';
  label: string;
}

interface ProductResult {
  id: string;
  name_en: string;
  name_pl: string;
  name_ru: string;
  name_uk: string;
  category_id: string;
  category_name?: string;
  unit: 'kilogram' | 'liter' | 'piece';
  image_url?: string | null;
}

export default function ProductFormUnified({ onSuccess }: { onSuccess?: (product: any) => void }) {
  const { accessToken } = useAuthStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ProductResult | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { name: 'analyze', status: 'pending', label: 'Анализ названия' },
    { name: 'translate', status: 'pending', label: 'Перевод (4 языка)' },
    { name: 'classify', status: 'pending', label: 'Классификация' },
    { name: 'save', status: 'pending', label: 'Сохранение в базу' },
  ]);
  const startTimeRef = useRef<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const updateStep = (name: string, status: ProcessingStep['status']) => {
    setSteps(prev => prev.map(s => s.name === name ? { ...s, status } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);
    setDuration(0);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
    startTimeRef.current = Date.now();

    try {
      if (!accessToken) {
        throw new Error('No access token found. Please login first.');
      }

      updateStep('analyze', 'loading');
      setTimeout(() => updateStep('analyze', 'done'), 150);
      setTimeout(() => updateStep('translate', 'loading'), 200);

      const data = await createProductUnified(input, accessToken);

      updateStep('translate', 'done');
      updateStep('classify', 'done');
      updateStep('save', 'done');

      const totalTime = Date.now() - startTimeRef.current;
      setDuration(totalTime);
      setResult(data);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during AI processing');
      setSteps(prev => prev.map(s => s.status === 'loading' ? { ...s, status: 'error' } : s));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border-none shadow-2xl shadow-indigo-500/10 bg-white dark:bg-slate-900 overflow-hidden rounded-[2rem]">
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 scale-[2] rotate-12">
           <Zap className="h-40 w-40" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30">
                   <Sparkles className="h-6 w-6 text-white" />
                 </div>
                 <h2 className="text-3xl font-black tracking-tight leading-none">AI Smart Catalog</h2>
              </div>
              <p className="text-indigo-100/80 font-medium max-w-md">
                Просто начните вводить название продукта на любом языке. AI возьмет на себя перевод и систематизацию.
              </p>
           </div>
           
           <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-indigo-600 bg-indigo-50/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                   <Globe className="h-4 w-4 text-white/70" />
                </div>
              ))}
           </div>
        </div>
      </div>

      <CardContent className="p-10 space-y-10">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
             <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
             </div>
             <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Например: 'Organic Whole Milk'..."
                className="w-full pl-12 pr-4 h-16 text-lg font-bold rounded-2xl border-slate-200 focus-visible:ring-indigo-600 shadow-sm dark:bg-slate-800 dark:border-slate-700"
                disabled={loading}
              />
          </div>
          <Button type="submit" size="lg" disabled={loading} className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Добавить'}
          </Button>
        </form>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in duration-500">
            {steps.map((step) => (
              <div key={step.name} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                step.status === 'loading' ? 'bg-indigo-50/50 border-indigo-200 shadow-md ring-2 ring-indigo-500/10' : 
                step.status === 'done' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex-shrink-0">
                  {step.status === 'loading' ? <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> :
                   step.status === 'done' ? <div className="h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"><Check className="h-3 w-3 text-white" /></div> :
                   step.status === 'error' ? <AlertCircle className="h-5 w-5 text-red-500" /> :
                   <div className="h-5 w-5 rounded-full border-2 border-slate-200" />}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest ${step.status === 'loading' ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center gap-4 animate-in shake-200">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <p className="text-sm font-black">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Результат обработки AI</h3>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50/30 border-indigo-100 gap-1">
                <Zap className="h-3 w-3 fill-current" /> {duration}ms latency
              </Badge>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Languages className="h-4 w-4" /> Локализация
                </div>
                <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/80 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                  {[
                    { l: 'EN', v: result.name_en },
                    { l: 'PL', v: result.name_pl },
                    { l: 'RU', v: result.name_ru },
                    { l: 'UK', v: result.name_uk }
                  ].map((row) => (
                    <div key={row.l} className="flex justify-between items-center group">
                      <span className="text-[10px] font-black text-slate-400 w-8">{row.l}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform">{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Tag className="h-4 w-4" /> Аналитика Системы
                </div>
                <div className="space-y-4 bg-slate-50/80 dark:bg-slate-800/80 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 h-full">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Выбранная категория</p>
                      <div className="text-lg font-black text-indigo-600 flex items-center justify-between">
                         {result.category_name || 'Интерпретировано'}
                         <ArrowRight className="h-4 w-4 opacity-50" />
                      </div>
                   </div>
                   <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Ед. изм.</p>
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                             <Scale className="h-4 w-4 text-indigo-500" />
                             {result.unit === 'kilogram' ? 'Килограмм' : result.unit === 'liter' ? 'Литр' : 'Штука'}
                          </div>
                       </div>
                       <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          <Check className="h-6 w-6" />
                       </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-4 bg-emerald-50/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">
                  Успешно интегрировано в каталог ингредиентов
                </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
