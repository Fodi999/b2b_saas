'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRecipesStore } from '@/lib/stores/recipes-store'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, ImageIcon, Plus, X, Search, Eye, Check, Loader2, ArrowLeft } from 'lucide-react'
import { MOCK_INVENTORY } from '@/lib/mock-data/inventory'

interface DraftIngredient {
  id: string
  inventoryItemId: string | null
  productName: string
  rawAmount: string
  searchValue: string
  // Note: unit is NOT stored in draft - it will be determined by AI/bot during preview
}

type ViewMode = 'edit' | 'preview' | 'saving'

interface PreviewRecipe {
  title: string
  servings: number
  prepTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: Array<{
    name: string
    amount: string
    unit: string
    cost: number
  }>
  instructions: string
  totalCost: number
  costPerServing: number
  totalWeight: number // AI calculates total output weight
  aiInsights: string[]
  warnings: string[] // AI warnings about inventory
}

// Bot estimation function (placeholder for future AI backend)
function botEstimateCost(amount: number, inventoryItem: any): number {
  // Calculate cost based on actual inventory price
  if (!inventoryItem) return 0
  
  // Price per unit (convert to base unit)
  const pricePerUnit = inventoryItem.price / inventoryItem.quantity
  return amount * pricePerUnit
}

export default function CreateRecipePage() {
  const { user } = useAuthStore()
  const { addRecipe } = useRecipesStore()
  const router = useRouter()

  const [mode, setMode] = useState<ViewMode>('edit')
  const [recipeName, setRecipeName] = useState('')
  const [ingredients, setIngredients] = useState<DraftIngredient[]>([
    { id: '1', inventoryItemId: null, productName: '', rawAmount: '', searchValue: '' }
  ])
  // Temporary storage for units - will be determined by product selection
  const [ingredientUnits, setIngredientUnits] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null)
  const [previewRecipe, setPreviewRecipe] = useState<PreviewRecipe | null>(null)
  const [validationError, setValidationError] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleAddIngredient = useCallback(() => {
    const newId = (Math.max(...ingredients.map(i => parseInt(i.id)), 0) + 1).toString()
    setIngredients(prev => [
      ...prev,
      { id: newId, inventoryItemId: null, productName: '', rawAmount: '', searchValue: '' }
    ])
  }, [ingredients])

  const handleRemoveIngredient = useCallback((id: string) => {
    if (ingredients.length > 1) {
      setIngredients(prev => prev.filter(i => i.id !== id))
      setActiveSearchIndex(null)
    }
  }, [ingredients.length])

  const handleSearch = useCallback((query: string, index: number) => {
    setIngredients(prev => 
      prev.map((ing, i) => 
        i === index 
          ? { ...ing, searchValue: query }
          : ing
      )
    )
    
    if (query.length >= 2) {
      setActiveSearchIndex(index)
    } else {
      setActiveSearchIndex(null)
    }
  }, [])

  const handleSelectProduct = useCallback((index: number, itemId: string, itemName: string, itemUnit: string) => {
    setIngredients(prev =>
      prev.map((ing, i) =>
        i === index
          ? { ...ing, inventoryItemId: itemId, productName: itemName, searchValue: '' }
          : ing
      )
    )
    // Store unit separately - it's metadata from the product, not part of the draft
    setIngredientUnits(prev => ({ ...prev, [index]: itemUnit }))
    setActiveSearchIndex(null)
  }, [])

  const handleClearSelection = useCallback((index: number) => {
    setIngredients(prev =>
      prev.map((ing, i) =>
        i === index
          ? { ...ing, inventoryItemId: null, productName: '', searchValue: '' }
          : ing
      )
    )
  }, [])

  const handleUpdateIngredient = useCallback((index: number, field: keyof DraftIngredient, value: string) => {
    setIngredients(prev =>
      prev.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
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

  const handleGeneratePreview = useCallback(() => {
    setValidationError('')

    if (!recipeName.trim()) {
      setValidationError('Введите название рецепта')
      return
    }

    const validIngredients = ingredients.filter(ing => 
      ing.inventoryItemId && ing.rawAmount && parseFloat(ing.rawAmount) > 0
    )

    if (validIngredients.length === 0) {
      setValidationError('Добавьте хотя бы один ингредиент с количеством')
      return
    }

    if (!instructions.trim()) {
      setValidationError('Добавьте инструкции по приготовлению')
      return
    }

    setIsAnalyzing(true)
    setMode('preview')

    // Simulate AI analysis
    setTimeout(() => {
      const totalCost = validIngredients.reduce((sum, ing) => {
        const quantity = parseFloat(ing.rawAmount) || 0
        const inventoryItem = MOCK_INVENTORY.find(item => item.id === ing.inventoryItemId)
        return sum + botEstimateCost(quantity, inventoryItem)
      }, 0)

      // AI calculates total weight (output)
      const totalWeight = validIngredients.reduce((sum, ing) => {
        const quantity = parseFloat(ing.rawAmount) || 0
        return sum + quantity
      }, 0)

      // AI checks inventory status and generates warnings
      const warnings: string[] = []
      validIngredients.forEach(ing => {
        const inventoryItem = MOCK_INVENTORY.find(item => item.id === ing.inventoryItemId)
        if (inventoryItem) {
          if (inventoryItem.status === 'expiring') {
            warnings.push(`${inventoryItem.productName} истекает через несколько дней`)
          }
          const needed = parseFloat(ing.rawAmount)
          if (inventoryItem.quantity < needed) {
            warnings.push(`Недостаточно ${inventoryItem.productName} на складе (нужно: ${needed}, есть: ${inventoryItem.quantity})`)
          }
        }
      })

      const preview: PreviewRecipe = {
        title: recipeName,
        servings: 4, // Estimated by AI (mock)
        prepTime: 30, // Estimated by AI (mock)
        difficulty: 'medium', // Estimated by AI (mock)
        ingredients: validIngredients.map((ing) => {
          const originalIndex = ingredients.indexOf(ing)
          const inventoryItem = MOCK_INVENTORY.find(item => item.id === ing.inventoryItemId)
          const amount = parseFloat(ing.rawAmount)
          return {
            name: ing.productName,
            amount: ing.rawAmount,
            unit: ingredientUnits[originalIndex] || 'г',
            cost: botEstimateCost(amount, inventoryItem)
          }
        }),
        instructions: instructions,
        totalCost: totalCost,
        costPerServing: totalCost / 4,
        totalWeight: totalWeight,
        warnings: warnings,
        aiInsights: [
          'Оптимальная температура подачи: 65-70°C',
          'Рекомендуем использовать свежие ингредиенты',
          'Время активной подготовки: ~15 минут'
        ]
      }

      setPreviewRecipe(preview)
      setIsAnalyzing(false)
    }, 1500)
  }, [recipeName, ingredients, instructions, ingredientUnits])

  const handleSaveRecipe = useCallback(() => {
    if (!previewRecipe) return
    
    setMode('saving')
    
    setTimeout(() => {
      // Save recipe to store
      addRecipe({
        name: previewRecipe.title,
        servings: previewRecipe.servings,
        prepTime: previewRecipe.prepTime,
        difficulty: previewRecipe.difficulty,
        ingredients: previewRecipe.ingredients,
        instructions: previewRecipe.instructions,
        totalCost: previewRecipe.totalCost,
        costPerServing: previewRecipe.costPerServing,
        totalWeight: previewRecipe.totalWeight,
        imageUrl: imagePreview || undefined,
        aiInsights: previewRecipe.aiInsights,
        warnings: previewRecipe.warnings,
      })
      
      router.push('/recipes')
    }, 1000)
  }, [previewRecipe, imagePreview, addRecipe, router])

  const handleBackToEdit = useCallback(() => {
    setMode('edit')
    setPreviewRecipe(null)
  }, [])

  if (!user) {
    return null
  }

  if (mode === 'saving') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="text-lg text-muted-foreground">Сохраняем ваш рецепт...</p>
        </div>
      </div>
    )
  }

  if (mode === 'preview' && previewRecipe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-6xl">
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
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">AI анализирует рецепт...</p>
                    <p className="text-sm text-muted-foreground mt-1">Оцениваем стоимость, время приготовления и сложность</p>
                  </div>
                </div>
              </div>
            ) : (
            <div className="bg-card rounded-lg shadow-md border border-border p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">{previewRecipe.title}</h1>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    Порций: {previewRecipe.servings}
                    <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">AI</span>
                  </span>
                  <span className="flex items-center gap-1">
                    Время: {previewRecipe.prepTime} мин
                    <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">AI</span>
                  </span>
                  <span className="flex items-center gap-1">
                    Сложность: {previewRecipe.difficulty === 'easy' ? 'Легко' : previewRecipe.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                    <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">AI</span>
                  </span>
                </div>
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="Recipe" className="w-32 h-32 rounded-lg object-cover" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Ингредиенты</h2>
              <div className="space-y-2">
                {previewRecipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-foreground font-medium">{ing.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-foreground">{ing.amount} {ing.unit}</span>
                      <span className="text-xs text-muted-foreground/70 min-w-[70px] text-right">
                        {ing.cost.toFixed(2)} PLN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between items-center font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <span>Общая стоимость</span>
                    <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      AI
                    </span>
                  </div>
                  <span>{previewRecipe.totalCost.toFixed(2)} PLN</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Стоимость на порцию</span>
                  <span>{previewRecipe.costPerServing.toFixed(2)} PLN</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>Выход блюда (общий)</span>
                    <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      AI
                    </span>
                  </div>
                  <span>{previewRecipe.totalWeight.toFixed(0)} г</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-foreground">Инструкции</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">{previewRecipe.instructions}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                AI Рекомендации
                <span className="text-xs font-normal text-muted-foreground ml-auto">на основе склада</span>
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {previewRecipe.aiInsights.map((insight, idx) => (
                  <li key={idx}>• {insight}</li>
                ))}
              </ul>
            </div>

            {/* Inventory Status Check */}
            {previewRecipe.warnings.length > 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Обнаружены проблемы со складом
                    </p>
                    <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                      {previewRecipe.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                  <span className="text-green-900 dark:text-green-100 font-medium">
                    Все ингредиенты доступны на складе
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveRecipe} className="flex-1">
                Сохранить рецепт
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
    ? MOCK_INVENTORY.filter(item => {
        const query = ingredients[activeSearchIndex]?.searchValue.toLowerCase() || ''
        return query.length >= 2 && item.productName.toLowerCase().includes(query)
      })
    : []

  const showNoResultsMessage = activeSearchIndex !== null 
    && ingredients[activeSearchIndex]?.searchValue.length >= 2 
    && searchResults.length === 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="h-8 w-8 text-blue-500" />
            Создать рецепт с AI
          </h1>
          <p className="text-muted-foreground mt-2">
            Добавьте ингредиенты и инструкции, AI поможет оптимизировать ваш рецепт
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md border border-border p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Recipe Name */}
            <div>
              <Label htmlFor="recipe-name">Название рецепта *</Label>
              <Input
                id="recipe-name"
                placeholder="Например: Борщ домашний"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>
                  Ингредиенты *
                  <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {ingredients.filter(i => i.inventoryItemId).length}
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddIngredient}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="relative border border-border rounded-lg p-3 space-y-2 bg-muted/30">
                    {/* Search Input or Selected Product */}
                    {!ingredient.inventoryItemId ? (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Поиск продукта (мин. 2 символа)"
                          value={ingredient.searchValue}
                          onChange={(e) => handleSearch(e.target.value, index)}
                          className="pl-9"
                        />
                        
                        {activeSearchIndex === index && searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                            {searchResults.map((item) => {
                              const itemName = item.productName
                              const itemUnit = item.baseUnit
                              const displayUnit = itemUnit === 'g' ? 'г' : itemUnit === 'ml' ? 'мл' : itemUnit === 'pcs' ? 'шт' : itemUnit
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(index, item.id, itemName, displayUnit)}
                                  className="w-full text-left px-3 py-2 hover:bg-accent border-b border-border last:border-b-0 text-foreground"
                                >
                                  <div className="font-medium">{itemName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Склад: {item.quantity} {displayUnit}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                        
                        {showNoResultsMessage && activeSearchIndex === index && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 z-50">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-1">
                                  Продукт не найден на складе
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Для создания рецепта продукт должен быть на складе. Добавьте его сначала в инвентарь.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-3 py-2">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium text-green-900 dark:text-green-100">
                          {ingredient.productName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleClearSelection(index)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Amount and Unit */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Количество"
                          value={ingredient.rawAmount}
                          onChange={(e) => handleUpdateIngredient(index, 'rawAmount', e.target.value)}
                          disabled={!ingredient.inventoryItemId}
                        />
                      </div>
                      <div className="w-20 flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {ingredient.inventoryItemId && ingredientUnits[index] ? ingredientUnits[index] : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ingredient.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Instructions */}
            <div>
              <Label htmlFor="instructions">Инструкции по приготовлению *</Label>
              <Textarea
                id="instructions"
                placeholder="Опишите пошагово процесс приготовления..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="mt-1 min-h-[200px]"
              />
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
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {validationError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t">
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
            onClick={() => router.push('/recipes')}
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
