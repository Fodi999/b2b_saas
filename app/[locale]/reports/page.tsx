'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useDishesStore } from '@/lib/stores/dishes-store'
import { useRecipesStore } from '@/lib/stores/recipes-store'
import { useInventoryStore, type InventoryItem } from '@/lib/stores/inventory-store'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowLeft, TrendingUp, DollarSign, AlertTriangle, Download, FileText, FileSpreadsheet } from 'lucide-react'

type PeriodType = 'today' | '7days' | '30days' | 'custom'
type ModeType = 'overview' | 'profit' | 'inventory' | 'ai'
type DishFilterType = 'all' | 'star' | 'problem' | 'low-margin' | 'risk'

export default function ReportsPage() {
  const { user } = useAuthStore()
  const { dishes } = useDishesStore()
  const { recipes } = useRecipesStore()
  const { items: inventoryItems } = useInventoryStore()
  const router = useRouter()

  const [period, setPeriod] = useState<PeriodType>('30days')
  const [mode, setMode] = useState<ModeType>('overview')
  const [dishFilter, setDishFilter] = useState<DishFilterType>('all')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = 12400 // Mock - should be from sales
    const totalProfit = 3180 // Mock
    const avgFoodCost = dishes.length > 0 
      ? dishes.reduce((sum, d) => sum + d.foodCostPercent, 0) / dishes.length 
      : 24
    const potentialGrowth = 640 // Mock - from AI recommendations

    return {
      revenue: totalRevenue,
      profit: totalProfit,
      avgFoodCost: avgFoodCost,
      potentialGrowth: potentialGrowth,
    }
  }, [dishes])

  // Calculate inventory metrics
  const inventoryMetrics = useMemo(() => {
    const totalValue = inventoryItems.reduce((sum: number, item: InventoryItem) => sum + item.price, 0)
    const expiringValue = inventoryItems
      .filter((item: InventoryItem) => item.status === 'expiring')
      .reduce((sum: number, item: InventoryItem) => sum + item.price, 0)
    const potentialLoss = expiringValue * 0.43 // Mock - 43% potential loss

    return {
      totalValue,
      expiringValue,
      potentialLoss,
      expiringItems: inventoryItems.filter((item: InventoryItem) => item.status === 'expiring'),
    }
  }, [inventoryItems])

  // Filter dishes
  const filteredDishes = useMemo(() => {
    switch (dishFilter) {
      case 'star':
        return dishes.filter(d => d.foodCostPercent < 30)
      case 'problem':
        return dishes.filter(d => d.foodCostPercent >= 40)
      case 'low-margin':
        return dishes.filter(d => d.marginPercent < 50)
      case 'risk':
        return dishes.filter(d => d.warnings && d.warnings.length > 0)
      default:
        return dishes
    }
  }, [dishes, dishFilter])

  // AI recommendations
  const aiRecommendations = useMemo(() => {
    const recs = []
    
    // Find low-margin dishes
    const lowMarginDish = dishes.find(d => d.marginPercent < 20)
    if (lowMarginDish) {
      recs.push({
        type: 'remove-dish',
        title: `Убрать ${lowMarginDish.name} (маржа ${lowMarginDish.marginPercent.toFixed(1)}%)`,
        impact: '+180 PLN/мес',
      })
    }

    // Find dishes to raise price
    const priceIncreaseDish = dishes.find(d => d.foodCostPercent > 35 && d.foodCostPercent < 50)
    if (priceIncreaseDish) {
      recs.push({
        type: 'raise-price',
        title: `Поднять цену на ${priceIncreaseDish.name} на +2 PLN`,
        impact: '+180 PLN/мес',
      })
    }

    // Expiring inventory
    if (inventoryMetrics.expiringItems.length > 0) {
      const topExpiring = inventoryMetrics.expiringItems[0]
      recs.push({
        type: 'use-inventory',
        title: `Использовать ${topExpiring.product_name} в 2 рецептах`,
        impact: `Сэкономить ${topExpiring.price.toFixed(0)} PLN`,
      })
    }

    return recs
  }, [dishes, inventoryMetrics])

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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                <FileText className="h-8 w-8 text-blue-500" />
                Отчёты
              </h1>
              <p className="text-muted-foreground mt-2">
                Финансовые показатели и рекомендации AI
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Для инвестора
                </div>
              </div>
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Для бухгалтера
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Period & Mode Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <span className="text-sm font-medium text-muted-foreground flex items-center">Период:</span>
            <Button
              variant={period === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('today')}
            >
              Сегодня
            </Button>
            <Button
              variant={period === '7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('7days')}
            >
              7 дней
            </Button>
            <Button
              variant={period === '30days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('30days')}
            >
              30 дней
            </Button>
            <Button
              variant={period === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('custom')}
            >
              Произвольно
            </Button>
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-medium text-muted-foreground flex items-center">Режим:</span>
            <Button
              variant={mode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('overview')}
            >
              Обзор
            </Button>
            <Button
              variant={mode === 'profit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('profit')}
            >
              Прибыль
            </Button>
            <Button
              variant={mode === 'inventory' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('inventory')}
            >
              Склад
            </Button>
            <Button
              variant={mode === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('ai')}
            >
              AI
            </Button>
          </div>
        </div>

        {/* AI Executive Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-3">🧠 AI Итог за {period === '30days' ? 'последние 30 дней' : period === '7days' ? '7 дней' : 'сегодня'}</h2>
              <div className="space-y-2 text-foreground mb-4">
                <p>• <strong>Чистая прибыль:</strong> <span className="text-green-600 dark:text-green-400">+{kpis.profit.toFixed(0)} PLN</span></p>
                <p>• <strong>Потери из-за склада:</strong> <span className="text-red-600 dark:text-red-400">–{inventoryMetrics.potentialLoss.toFixed(0)} PLN</span></p>
                <p>• <strong>{dishes.filter(d => d.marginPercent < 20).length} {dishes.filter(d => d.marginPercent < 20).length === 1 ? 'блюдо тянет' : 'блюда тянут'} прибыль вниз</strong></p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2">💡 Что делать дальше:</p>
                <p className="text-muted-foreground text-sm">
                  {dishes.find(d => d.marginPercent < 20) 
                    ? `Убрать ${dishes.find(d => d.marginPercent < 20)?.name} или изменить рецепт — это повысит среднюю маржу на 4–6%`
                    : 'Меню оптимизировано, продолжайте в том же духе'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Выручка</div>
            <div className="text-3xl font-bold text-foreground">{kpis.revenue.toFixed(0)} PLN</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+12% vs прошлый период</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Чистая прибыль</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{kpis.profit.toFixed(0)} PLN</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+8% vs прошлый период</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Средний Food Cost</div>
            <div className={`text-3xl font-bold ${kpis.avgFoodCost < 30 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {kpis.avgFoodCost.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Норма: &lt; 30%</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              Потенциал роста
              <span className="inline-flex items-center text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">AI</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">+{kpis.potentialGrowth.toFixed(0)} PLN</div>
            <div className="text-xs text-muted-foreground mt-1">при применении AI-рекомендаций</div>
          </div>
        </div>

        {/* Dishes Report */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Прибыльность блюд</h2>
            <div className="flex gap-2">
              <Button
                variant={dishFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDishFilter('all')}
              >
                Все ({dishes.length})
              </Button>
              <Button
                variant={dishFilter === 'star' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDishFilter('star')}
              >
                ⭐ Star
              </Button>
              <Button
                variant={dishFilter === 'problem' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDishFilter('problem')}
              >
                ⚠️ Problem
              </Button>
              <Button
                variant={dishFilter === 'low-margin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDishFilter('low-margin')}
              >
                📉 Low margin
              </Button>
              <Button
                variant={dishFilter === 'risk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDishFilter('risk')}
              >
                ⏳ Risk
              </Button>
            </div>
          </div>

          {filteredDishes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Нет блюд с выбранным фильтром
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map(dish => (
                <div key={dish.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{dish.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      dish.foodCostPercent < 30 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : dish.foodCostPercent < 40
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : dish.foodCostPercent < 55
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {dish.foodCostPercent < 30 ? '⭐ Star' : dish.foodCostPercent < 40 ? '💰 Cash Cow' : dish.foodCostPercent < 55 ? '❓ Question' : '☠️ Dog'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Цена:</span>
                      <span className="font-medium text-foreground">{dish.salePrice.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Себестоимость:</span>
                      <span className="font-medium text-foreground">{dish.totalCost.toFixed(2)} PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Маржа:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">+{dish.marginPercent.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Food Cost:</span>
                      <span className={`font-medium ${
                        dish.foodCostPercent < 30 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {dish.foodCostPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Подробнее
                    </Button>
                    {dish.marginPercent < 50 && (
                      <Button variant="outline" size="sm" className="text-xs">
                        Изменить цену
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Report */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Склад и потери</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">💸 Товаров на складе</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {inventoryMetrics.totalValue.toFixed(0)} PLN
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">⏰ Истекает в 7 дней</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {inventoryMetrics.expiringValue.toFixed(0)} PLN
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-red-700 dark:text-red-300 mb-1">❌ Потенциальные потери</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {inventoryMetrics.potentialLoss.toFixed(0)} PLN
              </div>
            </div>
          </div>

          {inventoryMetrics.expiringItems.length > 0 && (
            <>
              <div className="space-y-2 mb-4">
                {inventoryMetrics.expiringItems.slice(0, 5).map((item: InventoryItem) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{item.product_name}</div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        Истекает через 2-3 дня
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{item.price.toFixed(0)} PLN</div>
                      <div className="text-xs text-muted-foreground">{item.quantity} {item.base_unit === 'g' ? 'г' : item.base_unit === 'ml' ? 'мл' : 'шт'}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full">
                👉 Использовать в рецептах
              </Button>
            </>
          )}
        </div>

        {/* AI Actions */}
        {aiRecommendations.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-4">� AI-рекомендации · на основе склада</h2>
                <p className="text-sm text-muted-foreground mb-4">Конкретные действия с прогнозом эффекта:</p>

                <div className="space-y-3">
                  {aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{rec.title}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Эффект: {rec.impact}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Применить
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
