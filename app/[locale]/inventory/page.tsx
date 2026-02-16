'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useInventoryStore } from '@/lib/stores/inventory-store';
import { useInventory } from '@/lib/hooks/use-inventory';
import { useInventoryAnalytics } from '@/lib/hooks/use-inventory-analytics';
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
  Folder,
  Sparkles as SparklesIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Circle,
  Database,
  Cpu,
  TrendingDown,
  ShieldCheck,
  Zap as ZapIcon
} from 'lucide-react';
import AddProductModal from '@/components/inventory/add-product-modal';
import ProductFormUnified from '@/components/inventory/product-form-unified';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from 'next-intl';

export default function InventoryPage() {
  const { user, accessToken } = useAuthStore();
  const { items, loading } = useInventoryStore();
  const { 
    health, 
    lossReport, 
    isProcessing, 
    runCleanup,
    refresh: refreshAnalytics 
  } = useInventoryAnalytics();
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('inventory');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIFormOpen, setIsAIFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Загружаем склад с backend
  const { reloadInventory } = useInventory();

  // Общий рефреш данных (склад + аналитика)
  const refreshAllData = useCallback(async () => {
    await reloadInventory();
    refreshAnalytics();
  }, [reloadInventory, refreshAnalytics]);

  // Обработчик FIFO очистки
  const handleCleanup = async () => {
    if (!accessToken) return;
    const count = await runCleanup();
    if (count > 0) {
      alert(t('analytics.waste.cleanupSuccess', { count }));
      await reloadInventory();
    }
  };

  // Редирект если нет юзера
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
    }
  }, [user, router, locale]);

  // Обработчик удаления продукта
  const handleDeleteClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const confirmingDelete = async () => {
    if (!productToDelete || !accessToken) return;
    
    try {
      setDeletingId(productToDelete.id);
      await deleteInventoryProduct(productToDelete.id, accessToken);
      await refreshAllData();
      setProductToDelete(null);
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {    
    switch (status) {
      case 'in-stock':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 gap-1.5 font-bold uppercase text-[10px]">
            <CheckCircle2 className="h-3 w-3" /> {t('status.inStock')}
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 gap-1.5 font-bold uppercase text-[10px]">
            <AlertCircle className="h-3 w-3" /> {t('status.low')}
          </Badge>
        );
      case 'expiring':
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20 gap-1.5 font-bold uppercase text-[10px]">
            <Clock className="h-3 w-3" /> {t('status.expiring')}
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="gap-1.5 font-bold uppercase text-[10px]">
             <AlertTriangle className="h-3 w-3" /> {t('status.expired')}
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="font-bold uppercase text-[10px]">{status}</Badge>;
    }
  };

  const tCat = useTranslations('inventory.categories');

  const translateCategory = (category: string) => {
    // Mapping backend strings (hardcoded or English) to translation keys
    const mapping: Record<string, string> = {
      'Dairy': 'Dairy',
      'Молочные продукты и яйця': 'Dairy',
      'Vegetables': 'Vegetables',
      'Овощи': 'Vegetables',
      'Meat': 'Meat',
      'Мясо': 'Meat',
      'Fish': 'Fish',
      'Рыба': 'Fish',
      'Fruits': 'Fruits',
      'Фрукты': 'Fruits',
      'Grains': 'Grains',
      'Зерновые': 'Grains',
      'Spices': 'Spices',
      'Специи': 'Spices',
      'Beverages': 'Beverages',
      'Напитки': 'Beverages',
      'Nuts and seeds': 'Nuts and seeds',
      'Орехи и семена': 'Nuts and seeds',
      'Other': 'Other',
      'Другое': 'Other'
    };

    const key = mapping[category];
    return key ? tCat(key as any) : category;
  };

  const getCategoryIcon = (category: string, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-10 w-10',
    };
    
    const iconSize = sizeClasses[size];
    
    const iconMap: Record<string, React.ReactNode> = {
      'Dairy': <Milk className={iconSize} />,
      'Молочные продукты и яйця': <Milk className={iconSize} />,
      'Vegetables': <Carrot className={iconSize} />,
      'Овощи': <Carrot className={iconSize} />,
      'Meat': <Beef className={iconSize} />,
      'Мясо': <Beef className={iconSize} />,
      'Fish': <Fish className={iconSize} />,
      'Рыба': <Fish className={iconSize} />,
      'Fruits': <Apple className={iconSize} />,
      'Фрукты': <Apple className={iconSize} />,
      'Grains': <Wheat className={iconSize} />,
      'Зерновые': <Wheat className={iconSize} />,
      'Spices': <Soup className={iconSize} />,
      'Специи': <Soup className={iconSize} />,
      'Beverages': <Coffee className={iconSize} />,
      'Напитки': <Coffee className={iconSize} />,
      'Nuts and seeds': <Package className={iconSize} />,
      'Орехи и семена': <Package className={iconSize} />,
      'Other': <Package className={iconSize} />,
      'Другое': <Package className={iconSize} />,
    };
    return iconMap[category] || <Package className={iconSize} />;
  };

  const formatQuantity = (quantity: number, unit: string) => {
    // Конвертируем base_unit в читаемый формат
    const t = (val: string) => val; // Placeholder for logic
    if (unit === 'g') return `${quantity} кг`;
    if (unit === 'ml') return `${quantity} л`;
    if (unit === 'pcs') return `${quantity} шт`;
    return `${quantity} ${unit}`;
  };

  const formatDate = (dateString?: string, localeCode?: string) => {
    if (!dateString) return '-';
    // Use the locale from params
    return new Date(dateString).toLocaleDateString(localeCode === 'ru' ? 'ru-RU' : localeCode === 'pl' ? 'pl-PL' : localeCode === 'uk' ? 'uk-UA' : 'en-US');
  };

  const getDaysRemaining = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const days = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-emerald-500';
      case 'Good': return 'text-indigo-500';
      case 'Warning': return 'text-amber-500';
      case 'Critical': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  const getHealthBg = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'Good': return 'bg-indigo-500/10 border-indigo-500/20';
      case 'Warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'Critical': return 'bg-rose-500/10 border-rose-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  // Получаем уникальные категории и группируем продукты
  const categories = useMemo(() => {
    // Используем мапу для группировки по категориям
    // Нам важно сохранить ОРИГИНАЛЬНОЕ название (ключ) из бекенда для фильтрации, 
    // но если несколько ключей мапятся на одно и то же отображаемое имя, мы можем их объединить.
    // Однако в текущей логике фильтрации filteredItems использует activeTab === item.category.
    // Поэтому лучше оставить их раздельно, но красиво отображать.
    
    const categoryMap = new Map<string, { name: string; count: number }>();
    
    items.forEach(item => {
      const catKey = item.category || 'Other';
      const existing = categoryMap.get(catKey);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(catKey, {
          name: catKey,
          count: 1
        });
      }
    });

    // Сортируем по переведенному названию
    return Array.from(categoryMap.values()).sort((a, b) => 
      translateCategory(a.name).localeCompare(translateCategory(b.name), locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en')
    );
  }, [items, translateCategory, locale]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl animate-in fade-in duration-700">
        <div className="space-y-8 sm:space-y-10">
          {/* Neural Core Status Banner */}
          <div className="relative overflow-hidden group rounded-[2rem] sm:rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10">
              <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[1.5rem] sm:rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-500">
                  <Database className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                     <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {t('core.title')}
                     </h3>
                     <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3">{t('core.status')}</Badge>
                  </div>
                  <p className="text-xs sm:text-slate-500 dark:text-slate-400 font-medium">
                    {t('core.description')}
                  </p>
                </div>
              </div>
              
              <div className="w-full lg:w-auto flex items-center justify-around sm:justify-center gap-4 sm:gap-8 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Memory Engine</p>
                    <p className="text-sm sm:text-lg font-black text-slate-900 dark:text-white">v2.4 Neural</p>
                  </div>
                </div>
                <div className="h-8 sm:h-10 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-right">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Latency</p>
                  <p className="text-sm sm:text-lg font-black text-emerald-500">0.4ms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-white transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5 text-slate-400" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('header.title')}</h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500">{t('header.subtitle')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAIFormOpen(!isAIFormOpen)}
                className={`h-11 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all ${isAIFormOpen ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'border-slate-100 dark:border-slate-800 hover:bg-white'}`}
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                {isAIFormOpen ? t('actions.closeAI') : t('actions.smartAdd')}
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.create')}
              </Button>
            </div>
          </div>

          {/* AI Smart Form section */}
          {isAIFormOpen && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
              <ProductFormUnified 
                onSuccess={() => {
                  setTimeout(() => {
                    refreshAllData();
                  }, 1500);
                }} 
              />
            </div>
          )}

          {/* 🔥 V3: Analytics Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Inventory Health Score */}
            <Card className="rounded-[1.5rem] sm:rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5">
                <ShieldCheck className="h-24 w-24 sm:h-32 sm:w-32" />
              </div>
              <CardContent className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* 🔥 V3: Optimized Circle for 75% Scale / Mini screens */}
                  <div className={`h-16 w-16 sm:h-24 sm:w-24 rounded-full border-[3px] sm:border-8 flex flex-col items-center justify-center transition-all duration-1000 flex-shrink-0 ${getHealthBg(health?.status || 'Good').split(' ')[1]} ${getHealthColor(health?.status || 'Good')}`}>
                    <span className="text-xl sm:text-3xl font-black leading-none">{health?.health_score ?? '--'}</span>
                    <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest mt-0.5">%</span>
                  </div>
                  <div className="flex-1 space-y-3 sm:space-y-2 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
                      <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">
                        {t('analytics.health.title')}
                      </h3>
                      <Badge variant="outline" className={`font-black uppercase text-[8px] sm:text-[10px] py-0 h-5 ${getHealthBg(health?.status || 'Good')}`}>
                        {health?.status ? t(`analytics.health.${health.status.toLowerCase()}`) : '--'}
                      </Badge>
                    </div>
                    <p className="text-[10px] sm:text-sm text-slate-500 font-medium leading-tight">
                      {t('analytics.health.desc')}
                    </p>
                    <div className="grid grid-cols-3 sm:flex justify-center sm:justify-start gap-2 sm:gap-6 pt-2">
                      <div className="text-center sm:text-left">
                        <p className="text-[7px] sm:text-[10px] font-black uppercase text-rose-500 tracking-tight">{t('analytics.health.metrics.expired')}</p>
                        <p className="text-sm sm:text-lg font-black leading-none mt-1">{health?.expired ?? 0}</p>
                      </div>
                      <div className="text-center sm:text-left border-x border-slate-100 dark:border-slate-800 sm:border-none px-2 sm:px-0">
                        <p className="text-[7px] sm:text-[10px] font-black uppercase text-amber-500 tracking-tight">{t('analytics.health.metrics.lowStock')}</p>
                        <p className="text-sm sm:text-lg font-black leading-none mt-1">{health?.low_stock ?? 0}</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-[7px] sm:text-[10px] font-black uppercase text-indigo-500 tracking-tight">{t('analytics.health.metrics.warning')}</p>
                        <p className="text-sm sm:text-lg font-black leading-none mt-1">{health?.warning ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Waste KPI & Loss Analytics */}
            <Card className="rounded-[1.5rem] sm:rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <TrendingDown className="h-24 w-24 sm:h-32 sm:w-32" />
              </div>
              <CardContent className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">
                      {t('analytics.waste.title')}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t('analytics.waste.period')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl sm:text-4xl font-black italic tracking-tighter ${(lossReport?.waste_percentage ?? 0) > 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {lossReport?.waste_percentage ?? '0.0'}%
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">{t('analytics.waste.wasteKpi')}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 gap-4 sm:gap-2">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                      <ZapIcon className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">{t('analytics.waste.totalLoss')}</p>
                      <p className="text-base sm:text-lg font-black">{( (lossReport?.total_loss_cents ?? 0) / 100).toFixed(2)} PLN</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing || (health?.expired ?? 0) === 0}
                    onClick={handleCleanup}
                    className="h-9 sm:h-auto rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black uppercase text-[8px] sm:text-[9px] tracking-widest gap-2"
                  >
                    {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    {t('analytics.waste.cleanButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {hasAlerts && (
            <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Внимание! Требуется проверка</AlertTitle>
              <AlertDescription>
                {expiringCount > 0 && `${expiringCount} продуктов истекают в ближайшее время. `}
                {lowStockCount > 0 && `${lowStockCount} продуктов заканчиваются.`}
              </AlertDescription>
            </Alert>
          )}

          {/* Catalog & Inventory Table */}
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="mb-6">
              <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                <TabsList className="h-11 sm:h-12 bg-slate-100/50 dark:bg-slate-800 p-1.5 rounded-xl sm:rounded-2xl inline-flex w-max shrink-0">
                  <TabsTrigger 
                    value="all" 
                    className="rounded-lg sm:rounded-xl px-4 sm:px-6 font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                  >
                    {tCat('all')} <span className="ml-2 opacity-50">{items.length}</span>
                  </TabsTrigger>
                  {categories.map((cat) => (
                    <TabsTrigger 
                      key={cat.name} 
                      value={cat.name} 
                      className="rounded-lg sm:rounded-xl px-4 sm:px-6 font-black uppercase text-[9px] sm:text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                    >
                      {translateCategory(cat.name)} <span className="ml-2 opacity-50">{cat.count}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <TabsContent value={activeTab}>
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto scrollbar-hide">
                    <Table>
                      <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                          <TableHead className="w-[60px] sm:w-[80px] text-[10px] font-black uppercase tracking-widest text-slate-400 pl-6">{t('table.photo')}</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('table.name')}</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">{t('table.category')}</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('table.quantity')}</TableHead>
                          <TableHead className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{t('table.price')}</TableHead>
                          <TableHead className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">{t('table.expiry')}</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">{t('table.status')}</TableHead>
                          <TableHead className="w-[80px] sm:w-[100px] text-right pr-6"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          ))
                        ) : items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                              {t('empty.description')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="pl-6">
                                <ProductImage
                                  src={item.image_url}
                                  alt=""
                                  containerClassName="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border bg-muted flex items-center justify-center overflow-hidden shadow-sm"
                                />
                              </TableCell>
                              <TableCell className="font-bold text-slate-900 dark:text-slate-100 text-[10px] sm:text-sm">
                                {item.product_name}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(item.category || 'Other')}
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{translateCategory(item.category || 'Other')}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                                {formatQuantity(item.quantity, item.base_unit)}
                              </TableCell>
                              <TableCell className="font-bold text-slate-500 text-[10px] sm:text-sm">
                                {item.price ? `${item.price.toFixed(2)} PLN` : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatDate(item.expiration_date, locale)}</span>
                                  {(() => {
                                    const days = getDaysRemaining(item.expiration_date);
                                    if (days === null) return null;
                                    return (
                                      <span className={`text-[9px] font-black uppercase tracking-tight ${
                                        days < 3 ? 'text-red-500' : 'text-slate-400'
                                      }`}>
                                      {days <= 0 
                                        ? t('expiry.expired') 
                                        : t('expiry.daysLeft', { days })}
                                    </span>
                                    );
                                  })()}
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {getStatusBadge(item.status)}
                              </TableCell>
                              <TableCell className="text-right pr-6">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleDeleteClick(item.id, item.product_name)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t('delete.button')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open: boolean) => !open && setProductToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить продукт?</DialogTitle>
            <DialogDescription>
              Вы собираетесь удалить &quot;{productToDelete?.name}&quot; из складского учета. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setProductToDelete(null)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmingDelete}
              className="flex-1"
              disabled={!!deletingId}
            >
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Add Product Modal */}
          <AddProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={refreshAllData}
          />
        </div>
      </div>
    </div>
  );
}
