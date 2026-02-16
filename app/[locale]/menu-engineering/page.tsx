'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDishesStore } from '@/lib/stores/dishes-store'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Sparkles, TrendingUp, ChevronDown, ChevronUp, X, ArrowLeft, Target, Utensils, LayoutGrid, Star, CircleDollarSign, HelpCircle, Skull, AlertTriangle, Coins } from 'lucide-react'

type MenuCategory = 'star' | 'cash-cow' | 'question' | 'dog'
type FilterType = 'all' | 'problems' | 'high-margin' | 'expiring' | 'low-price'

interface MenuDish {
  dishId: string
  dishName: string
  cost: number
  price: number
  margin: number
  marginPercent: number
  foodCost: number
  category: MenuCategory
  warnings: string[]
  imageUrl?: string
}

// Calculate category based on food cost %
function calculateCategory(foodCost: number): MenuCategory {
  if (foodCost < 30) return 'star'
  if (foodCost >= 30 && foodCost < 40) return 'cash-cow'
  if (foodCost >= 40 && foodCost < 55) return 'question'
  return 'dog'
}

// Category config
const categoryConfig = {
  star: { 
    label: 'Star', 
    icon: Star,
    color: 'bg-emerald-500/10 text-emerald-600 border-none px-3 font-black text-[10px] tracking-widest',
  },
  'cash-cow': { 
    label: 'Cash Cow', 
    icon: CircleDollarSign,
    color: 'bg-blue-500/10 text-blue-600 border-none px-3 font-black text-[10px] tracking-widest',
  },
  question: { 
    label: 'Question', 
    icon: HelpCircle,
    color: 'bg-amber-500/10 text-amber-600 border-none px-3 font-black text-[10px] tracking-widest',
  },
  dog: { 
    label: 'Dog', 
    icon: Skull,
    color: 'bg-red-500/10 text-red-600 border-none px-3 font-black text-[10px] tracking-widest',
  },
}

export default function MenuEngineeringPage() {
  const { user } = useAuthStore()
  const { dishes } = useDishesStore()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('menuEngineering');

  const [filter, setFilter] = useState<FilterType>('all')
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [selectedDish, setSelectedDish] = useState<MenuDish | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Transform dishes to menu dishes
  const menuDishes: MenuDish[] = useMemo(() => {
    return dishes.map(dish => {
      const foodCost = (dish.totalCost / dish.salePrice) * 100
      const category = calculateCategory(foodCost)
      
      return {
        dishId: dish.id,
        dishName: dish.name,
        cost: dish.totalCost,
        price: dish.salePrice,
        margin: dish.margin,
        marginPercent: dish.marginPercent,
        foodCost: dish.foodCostPercent,
        category: category,
        warnings: dish.warnings || [],
        imageUrl: dish.imageUrl,
      }
    })
  }, [dishes])

  // Calculate analytics
  const analytics = useMemo(() => {
    if (menuDishes.length === 0) {
      return {
        totalMarginPercent: 0,
        avgFoodCost: 0,
        problemDishes: 0,
        potentialGrowth: 0,
        monthlyPotential: 0,
      }
    }

    const totalMargin = menuDishes.reduce((sum, d) => sum + d.marginPercent, 0)
    const avgFoodCost = menuDishes.reduce((sum, d) => sum + d.foodCost, 0) / menuDishes.length
    const problemDishes = menuDishes.filter(d => d.category === 'dog' || d.category === 'question').length

    return {
      totalMarginPercent: totalMargin / menuDishes.length,
      avgFoodCost: avgFoodCost,
      problemDishes: problemDishes,
      potentialGrowth: problemDishes > 0 ? 18 : 0,
      monthlyPotential: problemDishes > 0 ? 420 : 0,
    }
  }, [menuDishes])

  // Filter dishes
  const filteredDishes = useMemo(() => {
    switch (filter) {
      case 'problems':
        return menuDishes.filter(d => d.category === 'dog' || d.category === 'question')
      case 'high-margin':
        return menuDishes.filter(d => d.marginPercent >= 70)
      case 'expiring':
        return menuDishes.filter(d => d.warnings.length > 0)
      case 'low-price':
        return menuDishes.filter(d => d.price < 25)
      default:
        return menuDishes
    }
  }, [menuDishes, filter])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10 max-w-7xl animate-in fade-in duration-700">
        <div className="space-y-6 sm:space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-[1.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 group">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                   <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                      {t('header.title')} <span className="text-indigo-600">{t('header.core')}</span>
                   </h1>
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-100/50">
                      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase">{t('header.sync')}</span>
                   </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic text-xs sm:text-sm">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] tracking-widest text-slate-400 hover:text-indigo-600 transition-all border border-slate-200 sm:border-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => setShowRecommendations(true)}
                className="h-10 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-black uppercase text-[9px] tracking-widest shadow-xl transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
                {t('actions.strategy')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             {/* Main Dashboard section of Engineering page */}
             <div className="lg:col-span-3 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('kpi.margin')}</p>
                      <div className="text-3xl font-black text-indigo-600">{analytics.totalMarginPercent.toFixed(1)}%</div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                         <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${analytics.totalMarginPercent}%` }} />
                      </div>
                    </CardContent>
                 </Card>
                 <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('kpi.avgFoodCost')}</p>
                      <div className={`text-3xl font-black ${analytics.avgFoodCost > 35 ? 'text-red-500' : 'text-emerald-500'}`}>{analytics.avgFoodCost.toFixed(1)}%</div>
                    </CardContent>
                 </Card>
                 <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('kpi.problemDishes')}</p>
                      <div className="text-3xl font-black text-amber-500">{analytics.problemDishes}</div>
                    </CardContent>
                 </Card>
                 <Card className="border-none shadow-xl shadow-indigo-500/10 bg-indigo-600 text-white">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">{t('kpi.potential')}</p>
                      <div className="text-3xl font-black text-white">+{analytics.monthlyPotential} PLN</div>
                    </CardContent>
                 </Card>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {(['all', 'problems', 'high-margin'] as FilterType[]).map((f) => (
                      <Button key={f} variant={filter === f ? 'default' : 'ghost'} size="sm" className="h-8 text-[11px] font-black uppercase rounded-lg px-4 transition-all" onClick={() => setFilter(f)}>
                        {f === 'all' ? t('filters.all') : f === 'problems' ? (
                          <span className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3" /> {t('filters.problems')}</span>
                        ) : (
                          <span className="flex items-center gap-1.5"><CircleDollarSign className="h-3 w-3" /> {t('filters.highMargin')}</span>
                        )}
                      </Button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {menuDishes.map((dish) => (
                    <Card key={dish.dishId} className="group overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setSelectedDish(dish)}>
                      <CardHeader className="p-0 relative h-40 overflow-hidden">
                        {dish.imageUrl ? (
                          <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                            <Utensils className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className={categoryConfig[dish.category].color}>
                            {(() => {
                              const Icon = categoryConfig[dish.category].icon;
                              return <Icon className="h-3 w-3 mr-1.5" />;
                            })()}
                            {categoryConfig[dish.category].label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5">
                         <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 line-clamp-1">{dish.dishName}</h3>
                         <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t('card.price')}</p>
                              <p className="text-xl font-bold">{dish.price.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">PLN</span></p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t('card.foodCost')}</p>
                              <p className={`text-xl font-bold ${dish.foodCost > 35 ? 'text-red-500' : 'text-emerald-500'}`}>{dish.foodCost.toFixed(1)}%</p>
                           </div>
                         </div>
                         <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t('card.margin')}</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">+{dish.margin.toFixed(1)} PLN</p>
                         </div>
                      </CardContent>
                    </Card>
                 ))}
              </div>
            </div>

            {/* Recommendations & Insights section */}
            <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6">
               <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">{t('recommendations.title')}</h2>
               <div className="space-y-4">
                 <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-700">
                   <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                     {t('recommendations.priceIncrease')}
                   </p>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">
                     {t('recommendations.markup')}: <span className="font-bold text-slate-900 dark:text-slate-200">15%</span>
                   </p>
                 </div>
                 <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-700">
                   <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                     {t('recommendations.optimizeDishes')}
                   </p>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">
                     {t('recommendations.ingredientSubstitution')}
                   </p>
                 </div>
                 <div className="p-4 bg-red-500/10 rounded-xl border border-red-100 dark:border-red-700">
                   <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                     {t('recommendations.reducePortions')}
                   </p>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">
                     {t('recommendations.recommendedReduction')}: <span className="font-bold text-slate-900 dark:text-slate-200">20%</span>
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedDish} onOpenChange={(open) => !open && setSelectedDish(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-900">
          {selectedDish && (
            <div className="flex flex-col">
              <div className="h-48 bg-slate-900 relative">
                 {selectedDish.imageUrl ? (
                   <img src={selectedDish.imageUrl} className="w-full h-full object-cover opacity-50" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-20"><LayoutGrid className="h-24 w-24 text-white" /></div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                 <div className="absolute bottom-6 left-6 right-6">
                    <Badge className={categoryConfig[selectedDish.category].color + ' mb-2'}>
                       {(() => {
                          const Icon = categoryConfig[selectedDish.category].icon;
                          return <Icon className="h-3 w-3 mr-1.5" />;
                       })()}
                       {categoryConfig[selectedDish.category].label}
                    </Badge>
                    <h2 className="text-2xl font-black text-white">{selectedDish.dishName}</h2>
                 </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Стратегия AI</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
                      {selectedDish.category === 'star' ? 'Лидер меню. Сохраняйте рецептуру.' : 
                       selectedDish.category === 'dog' ? 'Критически низкая маржа. Рекомендуется поднять цену.' :
                       'Провести ротацию ингредиентов.'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-slate-400">Маржинальность</span>
                       <span className="text-emerald-500">{selectedDish.marginPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-slate-400">Себестоимость</span>
                       <span>{selectedDish.cost.toFixed(1)} PLN</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-12">Редактировать</Button>
                  <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setSelectedDish(null)}>Закрыть</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
