'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRecipesStore } from '@/lib/stores/recipes-store'
import { useDishesStore } from '@/lib/stores/dishes-store'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Plus, X, Search, Eye, Check, Loader2, ArrowLeft, UtensilsCrossed, ImageIcon } from 'lucide-react'

interface DraftComponent {
  id: string
  recipeId: string | null
  recipeName: string
  searchValue: string
}

type ViewMode = 'edit' | 'preview' | 'saving'

interface PreviewDish {
  name: string
  components: Array<{
    recipeName: string
    quantity: number
    cost: number
  }>
  salePrice: number
  totalCost: number
  margin: number
  marginPercent: number
  foodCostPercent: number
  status: 'profit' | 'warning' | 'loss'
  aiRecommendedPrice: number
  aiInsights: string[]
  warnings: string[]
}

// AI calculates recommended price based on cost and target margin
function calculateRecommendedPrice(totalCost: number, targetMargin: number = 0.35): number {
  // Target 35% margin (food cost 65%)
  return totalCost / (1 - targetMargin)
}

// AI determines status based on margin
function getStatus(marginPercent: number): 'profit' | 'warning' | 'loss' {
  if (marginPercent >= 25) return 'profit'
  if (marginPercent >= 15) return 'warning'
  return 'loss'
}

export default function CreateDishPage() {
  const { user } = useAuthStore()
  const { recipes } = useRecipesStore()
  const { addDish } = useDishesStore()
  const router = useRouter()

  const [mode, setMode] = useState<ViewMode>('edit')
  const [dishName, setDishName] = useState('')
  const [components, setComponents] = useState<DraftComponent[]>([
    { id: '1', recipeId: null, recipeName: '', searchValue: '' }
  ])
  const [salePrice, setSalePrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null)
  const [previewDish, setPreviewDish] = useState<PreviewDish | null>(null)
  const [validationError, setValidationError] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleAddComponent = useCallback(() => {
    const newId = (Math.max(...components.map(c => parseInt(c.id)), 0) + 1).toString()
    setComponents(prev => [
      ...prev,
      { id: newId, recipeId: null, recipeName: '', searchValue: '' }
    ])
  }, [components])

  const handleRemoveComponent = useCallback((id: string) => {
    if (components.length > 1) {
      setComponents(prev => prev.filter(c => c.id !== id))
      setActiveSearchIndex(null)
    }
  }, [components.length])

  const handleSearch = useCallback((query: string, index: number) => {
    setComponents(prev =>
      prev.map((comp, i) =>
        i === index
          ? { ...comp, searchValue: query }
          : comp
      )
    )

    if (query.length >= 2) {
      setActiveSearchIndex(index)
    } else {
      setActiveSearchIndex(null)
    }
  }, [])

  const handleSelectRecipe = useCallback((index: number, recipeId: string, recipeName: string) => {
    setComponents(prev =>
      prev.map((comp, i) =>
        i === index
          ? { ...comp, recipeId, recipeName, searchValue: '' }
          : comp
      )
    )
    setActiveSearchIndex(null)
  }, [])

  const handleClearSelection = useCallback((index: number) => {
    setComponents(prev =>
      prev.map((comp, i) =>
        i === index
          ? { ...comp, recipeId: null, recipeName: '', searchValue: '' }
          : comp
      )
    )
  }, [])

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Пожалуйста, загрузите изображение в формате JPEG, PNG или WEBP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ')
      return
    }

    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
  }, [])

  const handleUpdateQuantity = useCallback((index: number, value: string) => {
    setComponents(prev =>
      prev.map((comp, i) =>
        i === index ? { ...comp, quantity: value } : comp
      )
    )
  }, [])

  const handleGeneratePreview = useCallback(() => {
    setValidationError('')

    if (!dishName.trim()) {
      setValidationError('Введите название блюда')
      return
    }

    const validComponents = components.filter(comp =>
      comp.recipeId
    )

    if (validComponents.length === 0) {
      setValidationError('Добавьте хотя бы один рецепт')
      return
    }

    if (!salePrice || parseFloat(salePrice) <= 0) {
      setValidationError('Введите цену продажи')
      return
    }

    setIsAnalyzing(true)
    setMode('preview')

    // Simulate AI analysis
    setTimeout(() => {
      const price = parseFloat(salePrice)
      
      // Calculate total cost from recipes (1 serving each)
      const componentsWithCost = validComponents.map(comp => {
        const recipe = recipes.find(r => r.id === comp.recipeId)
        if (!recipe) return null

        // 1 порция из рецепта
        const servings = recipe.servings || 1
        const costPerServing = recipe.totalCost / servings

        return {
          recipeName: comp.recipeName,
          quantity: 1, // всегда 1 порция
          cost: costPerServing
        }
      }).filter(Boolean) as PreviewDish['components']

      const totalCost = componentsWithCost.reduce((sum, c) => sum + c.cost, 0)
      const margin = price - totalCost
      const marginPercent = (margin / price) * 100
      const foodCostPercent = (totalCost / price) * 100
      const status = getStatus(marginPercent)
      const aiRecommendedPrice = calculateRecommendedPrice(totalCost)

      // Collect warnings from recipes
      const warnings: string[] = []
      validComponents.forEach(comp => {
        const recipe = recipes.find(r => r.id === comp.recipeId)
        if (recipe && recipe.warnings.length > 0) {
          warnings.push(`${recipe.name}: ${recipe.warnings.length} проблем со складом`)
        }
      })

      // AI insights
      const insights: string[] = []
      if (status === 'loss') {
        insights.push(`⚠️ Убыточное блюдо! Рекомендуем цену от ${aiRecommendedPrice.toFixed(2)} PLN`)
      } else if (status === 'warning') {
        insights.push(`⚡ Низкая маржа. Оптимальная цена: ${aiRecommendedPrice.toFixed(2)} PLN`)
      } else {
        insights.push(`✅ Хорошая рентабельность`)
      }

      if (foodCostPercent > 40) {
        insights.push('Food cost выше 40% — рассмотрите оптимизацию')
      }

      if (warnings.length > 0) {
        insights.push('Проверьте доступность ингредиентов в рецептах')
      }

      const preview: PreviewDish = {
        name: dishName,
        components: componentsWithCost,
        salePrice: price,
        totalCost,
        margin,
        marginPercent,
        foodCostPercent,
        status,
        aiRecommendedPrice,
        aiInsights: insights,
        warnings
      }

      setPreviewDish(preview)
      setIsAnalyzing(false)
    }, 1500)
  }, [dishName, components, salePrice, recipes])

  const handleSaveDish = useCallback(() => {
    if (!previewDish) return

    setMode('saving')

    setTimeout(() => {
      addDish({
        name: previewDish.name,
        components: previewDish.components.map((comp, idx) => ({
          recipeId: components[idx].recipeId!,
          recipeName: comp.recipeName,
          quantity: comp.quantity,
          cost: comp.cost
        })),
        salePrice: previewDish.salePrice,
        totalCost: previewDish.totalCost,
        margin: previewDish.margin,
        marginPercent: previewDish.marginPercent,
        foodCostPercent: previewDish.foodCostPercent,
        status: previewDish.status,
        imageUrl: imagePreview || undefined,
        aiRecommendedPrice: previewDish.aiRecommendedPrice,
        aiInsights: previewDish.aiInsights,
        warnings: previewDish.warnings
      })

      router.push('/dishes')
    }, 1000)
  }, [previewDish, components, imagePreview, addDish, router])

  const handleBackToEdit = useCallback(() => {
    setMode('edit')
    setPreviewDish(null)
  }, [])

  if (!user) {
    return null
  }

  if (mode === 'saving') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500" />
          <p className="text-lg text-muted-foreground">Сохраняем блюдо...</p>
        </div>
      </div>
    )
  }

  if (mode === 'preview' && previewDish) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToEdit}
              className="mb-4"
              disabled={isAnalyzing}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к редактированию
            </Button>

            {isAnalyzing ? (
              <div className="bg-card rounded-lg shadow-md border border-border p-8">
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">AI анализирует блюдо...</p>
                    <p className="text-sm text-muted-foreground mt-1">Рассчитываем маржу и рентабельность</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow-md border border-border p-8 space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{previewDish.name}</h1>
                    {imagePreview && (
                      <img src={imagePreview} alt="Dish" className="w-32 h-32 rounded-lg object-cover ml-4" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {previewDish.status === 'profit' && (
                      <span className="inline-flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        ✅ Рентабельно
                      </span>
                    )}
                    {previewDish.status === 'warning' && (
                      <span className="inline-flex items-center gap-1 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                        ⚡ Низкая маржа
                      </span>
                    )}
                    {previewDish.status === 'loss' && (
                      <span className="inline-flex items-center gap-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                        ⚠️ Убыточно
                      </span>
                    )}
                  </div>
                </div>

                {/* Components */}
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">Состав</h2>
                  <div className="space-y-2">
                    {previewDish.components.map((comp, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-foreground font-medium">{comp.recipeName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{comp.quantity} {comp.quantity === 1 ? 'порция' : 'порции'}</span>
                          <span className="text-xs text-muted-foreground/70 min-w-[70px] text-right">
                            {comp.cost.toFixed(2)} PLN
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Себестоимость:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {previewDish.totalCost.toFixed(2)} PLN
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Цена продажи:</span>
                    <span className="text-lg font-bold text-foreground">
                      {previewDish.salePrice.toFixed(2)} PLN
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">Маржа:</span>
                      <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                        AI
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${
                      previewDish.status === 'profit' ? 'text-green-600 dark:text-green-400' :
                      previewDish.status === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {previewDish.margin.toFixed(2)} PLN ({previewDish.marginPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Food Cost:</span>
                    <span>{previewDish.foodCostPercent.toFixed(1)}%</span>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                    <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    AI Анализ
                    <span className="text-xs font-normal text-muted-foreground ml-auto">
                      рекомендуемая цена: {previewDish.aiRecommendedPrice.toFixed(2)} PLN
                    </span>
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {previewDish.aiInsights.map((insight, idx) => (
                      <li key={idx}>• {insight}</li>
                    ))}
                  </ul>
                </div>

                {/* Warnings */}
                {previewDish.warnings.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      ⚠️ Предупреждения из рецептов
                    </p>
                    <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                      {previewDish.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveDish} className="flex-1">
                    Сохранить блюдо
                  </Button>
                  <Button variant="outline" onClick={handleBackToEdit}>
                    Редактировать
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const searchResults = activeSearchIndex !== null
    ? recipes.filter(recipe => {
        const query = components[activeSearchIndex]?.searchValue.toLowerCase() || ''
        return query.length >= 2 && recipe.name.toLowerCase().includes(query)
      })
    : []

  const showNoResultsMessage = activeSearchIndex !== null
    && components[activeSearchIndex]?.searchValue.length >= 2
    && searchResults.length === 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <UtensilsCrossed className="h-8 w-8 text-purple-500" />
            Создать блюдо с AI
          </h1>
          <p className="text-muted-foreground mt-2">
            Выберите рецепты (по 1 порции каждый) и цену — AI рассчитает маржу
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md border border-border p-6 space-y-6">
          {/* Dish Name */}
          <div>
            <Label htmlFor="dish-name">Название блюда *</Label>
            <Input
              id="dish-name"
              placeholder="Например: Борщ с пампушками"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Recipe Components */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label>
                  Рецепты (по 1 порции каждого) *
                  <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    {components.filter(c => c.recipeId).length}
                  </span>
                </Label>
                <span className="text-xs text-muted-foreground">
                  AI использует себестоимость 1 порции
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddComponent}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>

            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={component.id} className="relative border border-border rounded-lg p-3 space-y-2 bg-muted/30">
                  {/* Search Input or Selected Recipe */}
                  {!component.recipeId ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск рецепта (мин. 2 символа)"
                        value={component.searchValue}
                        onChange={(e) => handleSearch(e.target.value, index)}
                        className="pl-9"
                      />

                      {activeSearchIndex === index && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                          {searchResults.map((recipe) => (
                            <button
                              key={recipe.id}
                              type="button"
                              onClick={() => handleSelectRecipe(index, recipe.id, recipe.name)}
                              className="w-full text-left px-3 py-2 hover:bg-accent border-b border-border last:border-b-0"
                            >
                              <div className="font-medium text-foreground">{recipe.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {recipe.servings} {recipe.servings === 1 ? 'порция' : recipe.servings > 4 ? 'порций' : 'порции'} • 
                                Стоимость 1 порции: {(recipe.totalCost / recipe.servings).toFixed(2)} PLN
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {showNoResultsMessage && activeSearchIndex === index && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 z-50">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground mb-1">
                                Рецепт не найден
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Создайте рецепт сначала в разделе "Рецепты"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded px-3 py-2">
                      <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium text-purple-900 dark:text-purple-100">
                        {component.recipeName}
                      </span>
                      <span className="text-xs text-purple-600 dark:text-purple-400 mr-2">
                        1 порция
                      </span>
                      <button
                        type="button"
                        onClick={() => handleClearSelection(index)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Remove Button */}
                  {components.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(component.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sale Price */}
          <div>
            <Label htmlFor="sale-price">Цена продажи *</Label>
            <div className="relative mt-1">
              <Input
                id="sale-price"
                type="number"
                step="0.01"
                placeholder="29.00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                PLN
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Фото блюда (опционально)</Label>
            <div className="mt-1">
              {!imagePreview ? (
                <label className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-sm text-foreground mb-1">
                    Нажмите для загрузки фото
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPEG, PNG или WEBP (макс. 5 МБ)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {validationError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleGeneratePreview}
              className="flex-1"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI анализирует...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Предпросмотр с AI
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dishes')}
              disabled={isAnalyzing}
            >
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
