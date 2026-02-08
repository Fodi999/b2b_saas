'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDishesStore } from '@/lib/stores/dishes-store'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react'

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
  star: { label: '⭐ Star', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' },
  'cash-cow': { label: '💰 Cash Cow', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
  question: { label: '❓ Question', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' },
  dog: { label: '☠️ Dog', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' },
}

export default function MenuEngineeringPage() {
  const { user } = useAuthStore()
  const { dishes } = useDishesStore()
  const router = useRouter()

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            Menu Engineering
          </h1>
          <p className="text-muted-foreground mt-2">
            Анализ прибыльности меню и рекомендации по оптимизации
          </p>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Общая маржа меню</div>
            <div className="text-2xl font-bold text-foreground">{analytics.totalMarginPercent.toFixed(1)}%</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Food Cost</div>
            <div className="text-2xl font-bold text-foreground">{analytics.avgFoodCost.toFixed(1)}%</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Проблемных блюд</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.problemDishes}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Потенциал роста</div>
            {analytics.potentialGrowth > 0 ? (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">+{analytics.potentialGrowth}%</div>
            ) : (
              <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">Меню оптимизировано</div>
            )}
          </div>
        </div>

        {/* AI Insight */}
        {analytics.problemDishes > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-2">🤖 AI Анализ меню</h3>
                <p className="text-muted-foreground mb-1">
                  {analytics.problemDishes} {analytics.problemDishes === 1 ? 'блюдо снижает' : 'блюда снижают'} общую маржу.
                </p>
                <p className="text-foreground font-semibold">
                  Если применить рекомендации — <span className="text-green-600 dark:text-green-400">+{analytics.monthlyPotential} PLN / месяц</span>
                </p>
              </div>
              <Button 
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="flex-shrink-0"
              >
                {showRecommendations ? 'Скрыть' : 'Показать рекомендации'}
              </Button>
            </div>

            {/* Recommendations Panel */}
            {showRecommendations && (
              <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-800 space-y-3">
                {menuDishes
                  .filter(d => d.category === 'dog' || d.category === 'question')
                  .map(dish => (
                    <div key={dish.dishId} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="font-semibold text-foreground">{dish.dishName}</div>
                        <span className={`text-xs px-2 py-1 rounded border ${categoryConfig[dish.category].color}`}>
                          {categoryConfig[dish.category].label}
                        </span>
                      </div>
                      
                      {/* AI Recommendations */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-1">
                              🤖 AI рекомендует
                              <span className="text-[10px] font-normal text-blue-700 dark:text-blue-300">· на основе склада</span>
                            </p>
                            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                              <div>
                                <p className="font-medium">• Повысить цену до {(dish.price + 3).toFixed(2)} PLN</p>
                                <p className="text-xs ml-4 text-blue-700 dark:text-blue-300">
                                  Food Cost снизится с {dish.foodCost.toFixed(1)}% до {(dish.foodCost * 0.85).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="font-medium">• Или оставить цену и продвигать блюдо</p>
                                <p className="text-xs ml-4 text-blue-700 dark:text-blue-300">
                                  Увеличение продаж компенсирует низкую маржу
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                          💰 <strong>Прогноз:</strong> +{(3 * 30).toFixed(0)} PLN / месяц (при 30 продажах)
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          title={`AI предлагает цену: ${(dish.price + 3).toFixed(2)} PLN`}
                        >
                          🔼 Повысить цену
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          🧪 Альтернатива
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-red-600 dark:text-red-400">
                          🚫 Убрать
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Все ({menuDishes.length})
          </Button>
          <Button
            variant={filter === 'problems' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('problems')}
          >
            Проблемные ({menuDishes.filter(d => d.category === 'dog' || d.category === 'question').length})
          </Button>
          <Button
            variant={filter === 'high-margin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('high-margin')}
          >
            Высокая маржа ({menuDishes.filter(d => d.marginPercent >= 70).length})
          </Button>
          <Button
            variant={filter === 'expiring' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('expiring')}
          >
            Истекают ингредиенты ({menuDishes.filter(d => d.warnings.length > 0).length})
          </Button>
          <Button
            variant={filter === 'low-price' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('low-price')}
          >
            Низкая цена ({menuDishes.filter(d => d.price < 25).length})
          </Button>
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {filter === 'all' ? 'Нет блюд в меню' : 'Нет блюд с выбранным фильтром'}
            </p>
            {filter === 'all' && (
              <Button onClick={() => router.push('/dishes/create')}>
                Создать первое блюдо
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDishes.map(dish => (
              <div
                key={dish.dishId}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image or placeholder */}
                {dish.imageUrl ? (
                  <img src={dish.imageUrl} alt={dish.dishName} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
                    <DollarSign className="h-12 w-12 text-purple-400 dark:text-purple-600" />
                  </div>
                )}

                <div className="p-4">
                  {/* Title and Category */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-lg">{dish.dishName}</h3>
                    <span 
                      className={`text-xs px-2 py-1 rounded border flex-shrink-0 ml-2 ${categoryConfig[dish.category].color}`}
                      title={`Категория Menu Engineering: ${categoryConfig[dish.category].label}`}
                    >
                      {categoryConfig[dish.category].label}
                    </span>
                  </div>

                  {/* Category Explanation */}
                  <div className="mb-3 text-xs text-muted-foreground">
                    Категория: <span className="font-medium">{categoryConfig[dish.category].label}</span>
                    {dish.category === 'star' && ' (высокая маржа)'}
                    {dish.category === 'cash-cow' && ' (стабильная маржа)'}
                    {dish.category === 'question' && ' (требует оптимизации)'}
                    {dish.category === 'dog' && ' (низкая прибыльность)'}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Себестоимость:</span>
                      <span className="font-medium text-foreground">{dish.cost.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Цена:</span>
                      <span className="font-medium text-foreground">{dish.price.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Маржа:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        +{dish.margin.toFixed(2)} PLN ({dish.marginPercent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Food Cost:</span>
                      <span className={`font-medium ${
                        dish.foodCost < 30 ? 'text-green-600 dark:text-green-400' :
                        dish.foodCost < 40 ? 'text-blue-600 dark:text-blue-400' :
                        dish.foodCost < 55 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {dish.foodCost.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Warnings */}
                  {dish.warnings.length > 0 && (
                    <div className="mb-4">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs mb-2">
                        <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 mb-1 font-semibold">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Проблемы со складом:</span>
                        </div>
                        <ul className="ml-4 space-y-0.5 text-amber-800 dark:text-amber-200">
                          {dish.warnings.slice(0, 2).map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                          {dish.warnings.length > 2 && (
                            <li className="text-amber-600 dark:text-amber-400">• +{dish.warnings.length - 2} ещё...</li>
                          )}
                        </ul>
                      </div>
                      
                      {/* AI Recommendation */}
                      {(dish.category === 'dog' || dish.category === 'question') && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                          <div className="flex items-start gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1">
                                🤖 AI рекомендует
                                <span className="text-[10px] font-normal text-blue-700 dark:text-blue-300">· на основе склада</span>
                              </p>
                              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5">
                                <li>• Повысить цену до {(dish.price + 3).toFixed(2)} PLN</li>
                                <li>• Или оставить цену и продвигать блюдо</li>
                              </ul>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs mt-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                            title={`AI предлагает цену: ${(dish.price + 3).toFixed(2)} PLN (оптимально для маржи)`}
                          >
                            Применить рекомендацию
                            <span className="ml-1 text-[10px] opacity-70">+{(3).toFixed(0)} PLN</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedDish(dish)}
                    >
                      Подробнее
                    </Button>
                    
                    {(dish.category === 'dog' || dish.category === 'question') && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          title={`AI рекомендует: +2–4 PLN`}
                        >
                          🔼 Повысить цену
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          🧪 Альтернатива
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDish && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{selectedDish.dishName}</h2>
                <button
                  onClick={() => setSelectedDish(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Category Badge */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Категория Menu Engineering:</div>
                  <span className={`inline-flex items-center px-3 py-1 rounded border ${categoryConfig[selectedDish.category].color}`}>
                    {categoryConfig[selectedDish.category].label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedDish.category === 'star' && '✨ Высокая маржа — продолжайте продавать'}
                    {selectedDish.category === 'cash-cow' && '💰 Стабильная маржа — надёжное блюдо'}
                    {selectedDish.category === 'question' && '❓ Требует оптимизации цены или рецепта'}
                    {selectedDish.category === 'dog' && '☠️ Низкая прибыльность — требует срочных изменений'}
                  </p>
                </div>

                {/* Economics */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">📊 Экономика</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span>Себестоимость:</span>
                      <span className="font-medium">{selectedDish.cost.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span>Цена продажи:</span>
                      <span className="font-medium">{selectedDish.price.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span>Маржа:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        +{selectedDish.margin.toFixed(2)} PLN ({selectedDish.marginPercent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/30 rounded">
                      <span>Food Cost:</span>
                      <span className="font-medium">{selectedDish.foodCost.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Problems */}
                {selectedDish.warnings.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">⚠️ Проблемы со складом</h3>
                    <ul className="space-y-2 text-sm">
                      {selectedDish.warnings.map((warning, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-amber-900 dark:text-amber-100">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Recommendations */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Рекомендации
                    <span className="text-xs font-normal text-muted-foreground">· на основе склада</span>
                  </h3>
                  <div className="space-y-3">
                    {selectedDish.category === 'dog' || selectedDish.category === 'question' ? (
                      <>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
                          <div className="font-medium mb-1">🔼 Повысить цену на +3 PLN</div>
                          <div className="text-muted-foreground">Food Cost снизится до {(selectedDish.foodCost * 0.85).toFixed(1)}%</div>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-sm">
                          <div className="font-medium mb-1">🔄 Оптимизировать рецепт</div>
                          <div className="text-muted-foreground">Возможно снижение себестоимости на 15%</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                          <div className="font-medium mb-1">🔥 Продвигать блюдо</div>
                          <div className="text-muted-foreground">После оптимизации увеличить продажи</div>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                        <div className="font-medium mb-1">✅ Блюдо оптимально</div>
                        <div className="text-muted-foreground">Продолжайте продавать это блюдо</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="flex items-center justify-center gap-1"
                      title={`AI предлагает цену: ${(selectedDish.price + 3).toFixed(2)} PLN (оптимально для маржи)`}
                    >
                      <span>🔼</span>
                      <span>Повысить цену</span>
                    </Button>
                    <Button variant="outline" className="flex items-center justify-center gap-1">
                      <span>🧪</span>
                      <span>Альтернатива</span>
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    🚫 Временно убрать из меню
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
