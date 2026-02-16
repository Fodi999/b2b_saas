'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useInventoryStore, type InventoryItem } from '@/lib/stores/inventory-store'
import { useInventory } from '@/lib/hooks/use-inventory'
import { useRecipeCreate } from '@/lib/hooks/use-recipe-create'
import { useAuthInit } from '@/lib/hooks/use-auth-init'
import { useRouter, useParams } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Sparkles, 
  ImageIcon, 
  Plus, 
  X, 
  Search, 
  Eye, 
  Check, 
  Loader2, 
  ArrowLeft,
  Activity,
  Zap,
  ChevronRight,
  Target,
  LineChart,
  ClipboardList
} from 'lucide-react'
import type { RecipeLanguage, RecipeIngredientDTO } from '@/lib/api/recipes'
import { useRecipeInsights } from '@/lib/hooks/use-recipe-insights'
import { FeasibilityScore } from '@/components/recipes/feasibility-score'
import { CriticalErrorsBlock } from '@/components/recipes/critical-errors-block'
import { WarningsBlock } from '@/components/recipes/warnings-block'
import { TechnologyCard } from '@/components/recipes/technology-card'
import { RecommendationsBlock } from '@/components/recipes/recommendations-block'
import { BusinessMetrics } from '@/components/recipes/business-metrics'
import { generateRecommendations } from '@/lib/utils/recipe-recommendations'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface DraftIngredient {
  id: string
  inventoryItemId: string | null
  catalogIngredientId: string | null // ✅ Добавляем ID из каталога
  productName: string
  rawAmount: string
  searchValue: string
  unit: string // ✅ Теперь unit хранится в draft
}

type ViewMode = 'edit' | 'preview' | 'analyzing' | 'insights'

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
function botEstimateCost(amount: number, inventoryItem: InventoryItem | null | undefined): number {
  if (!inventoryItem) return 0
  if (inventoryItem.quantity === 0) return 0
  const pricePerUnit = inventoryItem.price / inventoryItem.quantity
  return amount * pricePerUnit
}

export default function CreateRecipePage() {
  const { user } = useAuthStore()
  const { items: inventoryItems } = useInventoryStore()
  const { isInitialized } = useAuthInit()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('recipes.create')
  const tInsights = useTranslations('recipes.insights')
  
  const [mode, setMode] = useState<ViewMode>('edit')
  const [recipeName, setRecipeName] = useState('')
  const [recipeServings, setRecipeServings] = useState(4)
  const [ingredients, setIngredients] = useState<DraftIngredient[]>([
    { id: '1', inventoryItemId: null, catalogIngredientId: null, productName: '', rawAmount: '', searchValue: '', unit: 'g' }
  ])
  const [ingredientUnits, setIngredientUnits] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null)
  const [previewRecipe, setPreviewRecipe] = useState<PreviewRecipe | null>(null)
  const [validationError, setValidationError] = useState<string>('')
  const [language] = useState<RecipeLanguage>(
    locale === 'pl' ? 'pl' : locale === 'uk' ? 'uk' : locale === 'en' ? 'en' : 'ru'
  )
  
  const [draftRecipeId, setDraftRecipeId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const { create: createRecipeAPI, update: updateRecipeAPI } = useRecipeCreate()
  const { insights, isLoading: insightsLoading, fetchInsights } = useRecipeInsights()

  useInventory()

  useEffect(() => {
    if (mode === 'insights' && !insights && !insightsLoading) {
      setMode('preview')
    }
  }, [mode, insights, insightsLoading])

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
    }
  }, [user, router, isInitialized])

  const handleAddIngredient = useCallback(() => {
    const newId = (Math.max(...ingredients.map(i => parseInt(i.id)), 0) + 1).toString()
    setIngredients(prev => [
      ...prev,
      { id: newId, inventoryItemId: null, catalogIngredientId: null, productName: '', rawAmount: '', searchValue: '', unit: 'g' }
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

  const handleSelectProduct = useCallback((
    index: number, 
    itemId: string, 
    itemName: string, 
    itemUnit: string,
    catalogIngredientId?: string
  ) => {
    setIngredients(prev => {
      const ingredientId = prev[index]?.id
      const updated = prev.map((ing, i) =>
        i === index
          ? { 
              ...ing, 
              inventoryItemId: itemId, 
              catalogIngredientId: catalogIngredientId || itemId,
              productName: itemName, 
              searchValue: '',
              unit: itemUnit
            }
          : ing
      )
      
      if (ingredientId) {
        setIngredientUnits(prevUnits => ({ ...prevUnits, [ingredientId]: itemUnit }))
      }
      
      return updated
    })
    
    setActiveSearchIndex(null)
  }, [])

  const handleClearSelection = useCallback((index: number) => {
    setIngredients(prev =>
      prev.map((ing, i) =>
        i === index
          ? { ...ing, inventoryItemId: null, catalogIngredientId: null, productName: '', searchValue: '', unit: 'g' }
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
    
    setTimeout(() => {
      const totalCost = validIngredients.reduce((sum, ing) => {
        const quantity = parseFloat(ing.rawAmount) || 0
        const inventoryItem = inventoryItems.find((item: InventoryItem) => item.id === ing.inventoryItemId)
        return sum + botEstimateCost(quantity, inventoryItem)
      }, 0)

      const totalWeight = validIngredients.reduce((sum, ing) => {
        const quantity = parseFloat(ing.rawAmount) || 0
        return sum + quantity
      }, 0)

      const warnings: string[] = []
      validIngredients.forEach(ing => {
        const inventoryItem = inventoryItems.find((item: InventoryItem) => item.id === ing.inventoryItemId)
        if (inventoryItem) {
          if (inventoryItem.status === 'expiring') {
            warnings.push(`${inventoryItem.product_name} истекает через несколько дней`)
          }
          const needed = parseFloat(ing.rawAmount)
          if (inventoryItem.quantity < needed) {
            warnings.push(`Недостаточно ${inventoryItem.product_name} на складе (нужно: ${needed}, есть: ${inventoryItem.quantity})`)
          }
        }
      })

      const servings = recipeServings
      const preview: PreviewRecipe = {
        title: recipeName,
        servings: servings,
        prepTime: 30,
        difficulty: 'medium',
        ingredients: validIngredients.map((ing) => {
          const ingredientId = ing.id
          const inventoryItem = inventoryItems.find((item: InventoryItem) => item.id === ing.inventoryItemId)
          const amount = parseFloat(ing.rawAmount)
          return {
            name: ing.productName,
            amount: ing.rawAmount,
            unit: ingredientUnits[ingredientId] || 'г',
            cost: botEstimateCost(amount, inventoryItem)
          }
        }),
        instructions: instructions,
        totalCost: totalCost,
        costPerServing: totalCost / servings,
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
      setMode('preview')
    }, 1500)
  }, [recipeName, recipeServings, ingredients, instructions, ingredientUnits, inventoryItems])

  const handleAnalyzeRecipe = useCallback(async () => {
    if (!previewRecipe) return
    if (isAnalyzing) return
    
    try {
      setIsAnalyzing(true)
      setMode('analyzing')
      
      const recipeIngredients: RecipeIngredientDTO[] = ingredients
        .filter(ing => ing.catalogIngredientId && ing.rawAmount)
        .map(ing => {
          let quantity = parseFloat(ing.rawAmount) || 0
          let unit = 'kilogram'
          
          if (ing.unit === 'g') {
            quantity = quantity / 1000
            unit = 'kilogram'
          } else if (ing.unit === 'ml') {
            quantity = quantity / 1000
            unit = 'liter'
          } else if (ing.unit === 'liter') {
            unit = 'liter'
          } else if (ing.unit === 'piece' || ing.unit === 'pcs') {
            unit = 'piece'
          }
          
          return {
            catalog_ingredient_id: ing.catalogIngredientId!,
            quantity,
            unit,
          }
        })
      
      let recipeId = draftRecipeId;

      if (recipeId) {
        await updateRecipeAPI(recipeId, {
          name: recipeName + ' (черновик)',
          instructions: instructions,
          servings: recipeServings,
          ingredients: recipeIngredients,
        })
      } else {
        const draftRecipe = await createRecipeAPI({
          name: recipeName + ' (черновик)',
          instructions: instructions,
          language: language,
          servings: recipeServings,
          ingredients: recipeIngredients,
        })
        if (draftRecipe) {
          recipeId = draftRecipe.id
          setDraftRecipeId(recipeId)
        }
      }
      
      if (recipeId) {
        await fetchInsights(recipeId, language)
        setMode('insights')
      }
    } catch (error) {
      console.error('❌ Ошибка AI анализа:', error)
      alert('Не удалось проанализировать рецепт. Попробуйте ещё раз.')
      setMode('preview')
    } finally {
      setIsAnalyzing(false)
    }
  }, [previewRecipe, ingredients, recipeName, recipeServings, instructions, language, createRecipeAPI, updateRecipeAPI, draftRecipeId, fetchInsights, isAnalyzing])

  const handleSaveAfterAnalysis = useCallback(async () => {
    if (!previewRecipe) return
    
    try {
      if (draftRecipeId) {
        // Publish the draft and update the name
        await updateRecipeAPI(draftRecipeId, {
          name: recipeName,
          status: 'published'
        })
        router.push(`/${locale}/recipes`)
      } else {
        const recipeIngredients: RecipeIngredientDTO[] = ingredients
          .filter(ing => ing.catalogIngredientId && ing.rawAmount)
          .map(ing => {
            let quantity = parseFloat(ing.rawAmount) || 0
            let unit = 'kilogram'
            
            if (ing.unit === 'g') {
              quantity = quantity / 1000
              unit = 'kilogram'
            } else if (ing.unit === 'ml') {
              quantity = quantity / 1000
              unit = 'liter'
            } else if (ing.unit === 'liter') {
              unit = 'liter'
            } else if (ing.unit === 'piece' || ing.unit === 'pcs') {
              unit = 'piece'
            }
            
            return {
              catalog_ingredient_id: ing.catalogIngredientId!,
              quantity,
              unit,
            }
          })
        
        const finalRecipe = await createRecipeAPI({
          name: recipeName,
          instructions: instructions,
          language: language,
          servings: recipeServings,
          ingredients: recipeIngredients,
        })
        
        if (finalRecipe) {
          router.push(`/${locale}/recipes`)
        }
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения рецепта:', error)
      alert('Не удалось сохранить рецепт. Попробуйте ещё раз.')
    }
  }, [previewRecipe, draftRecipeId, ingredients, recipeName, instructions, language, createRecipeAPI, updateRecipeAPI, router, locale])

  const handleBackToEdit = useCallback(() => {
    setMode('edit')
  }, [])

  if (!user) {
    return null
  }

  if (mode === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 p-12 rounded-[2.5rem] flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl animate-ping rounded-full" />
              <div className="h-20 w-20 bg-indigo-500 rounded-2xl flex items-center justify-center relative">
                <Sparkles className="h-10 w-10 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-wider text-white">
                {t('analyzing.title')}
              </h2>
              <p className="text-zinc-400 font-medium max-w-[300px]">
                {t('analyzing.subtitle')}
              </p>
            </div>

            <div className="w-full max-w-[200px] space-y-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-[loading_2s_infinite]" />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span>{t('analyzing.phase_1')}</span>
                <span>{t('analyzing.phase_2')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'insights' && insights) {
    // Используем рекомендации от AI, если они есть, иначе генерируем локально
    const recommendations = (insights.insights.suggestions && insights.insights.suggestions.length > 0)
      ? insights.insights.suggestions
      : generateRecommendations(insights.insights.dish_type)

    return (
      <div className="max-w-[1440px] mx-auto pb-20 space-y-12">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 lg:px-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <div className="h-1 w-8 bg-zinc-800 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('steps.step4')}</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              AI <span className="text-indigo-500">INSIGHTS</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleBackToEdit}
              className="bg-black/40 border-white/10 text-white hover:bg-white/5 rounded-2xl h-12 px-6 font-bold uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('actions.back')}
            </Button>
            <Button 
              onClick={handleSaveAfterAnalysis}
              className="bg-emerald-500 hover:bg-emerald-600 text-black rounded-2xl h-12 px-8 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-none"
            >
              {t('actions.save')}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 lg:px-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <FeasibilityScore 
              score={insights.insights.feasibility_score} 
              dishType={insights.insights.dish_type} 
            />
            <CriticalErrorsBlock errors={insights.insights.validation.errors} />
            <WarningsBlock warnings={insights.insights.validation.warnings} />

            <div className="grid grid-cols-1 gap-6">
              <TechnologyCard steps={insights.insights.steps} />
            </div>

            <RecommendationsBlock recommendations={recommendations} />
          </div>

          {/* Sidebar Metrics */}
          <div className="lg:col-span-4 space-y-8">
            <BusinessMetrics 
              cost={previewRecipe?.totalCost} 
              servings={previewRecipe?.servings} 
              complexity={3} // Default complexity
              haccp_risk="medium" // Default risk
            />
            
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black italic uppercase tracking-wider text-white text-base">
                    {tInsights('sections.market.title')}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Safety validation</p>
                </div>
              </div>
              <div className="space-y-5 pt-4">
                {insights.insights.validation.safety_checks.map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                    <p className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors leading-relaxed font-bold italic uppercase tracking-tight">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto pb-20 space-y-12">
      {/* Header section with RS 2026 aesthetics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 lg:px-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <div className="h-1 w-8 bg-zinc-800 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {mode === 'edit' ? t('steps.step1') : t('steps.step2')}
            </span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            {mode === 'edit' ? (
              <>NEW <span className="text-indigo-500">RECIPE</span></>
            ) : (
              <>AI <span className="text-indigo-500">PREVIEW</span></>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'preview' && (
            <Button 
              variant="outline" 
              onClick={handleBackToEdit}
              className="bg-black/40 border-white/10 text-white hover:bg-white/5 rounded-2xl h-12 px-6 font-bold uppercase tracking-wider transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('actions.back')}
            </Button>
          )}
          <Button 
            disabled={isAnalyzing}
            onClick={mode === 'edit' ? handleGeneratePreview : handleAnalyzeRecipe}
            className={cn(
              "rounded-2xl h-12 px-8 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg border-none",
              mode === 'edit' 
                ? "bg-white text-black hover:bg-zinc-200" 
                : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            )}
          >
            {isAnalyzing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : mode === 'edit' ? (
              <>
                {t('actions.preview')}
                <Eye className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                {t('actions.analyze')}
                <Sparkles className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {validationError && (
        <div className="mx-4 lg:mx-8 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl font-bold uppercase tracking-wider text-xs animate-in fade-in slide-in-from-top-4">
          {validationError}
        </div>
      )}

      {mode === 'edit' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4 lg:px-8">
          <div className="space-y-8">
            {/* Meta Section */}
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-black italic uppercase tracking-wider text-white">
                  {t('sections.general.title')}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                    {t('sections.general.name_label')}
                  </Label>
                  <Input
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder={t('sections.general.name_placeholder')}
                    className="bg-white/5 border-white/10 rounded-2xl h-14 px-6 text-white text-lg font-bold placeholder:text-zinc-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                      {t('sections.preview.servings')}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={recipeServings}
                      onChange={(e) => setRecipeServings(parseInt(e.target.value) || 1)}
                      className="bg-white/5 border-white/10 rounded-2xl h-14 px-6 text-white text-lg font-bold focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                      Language (Brain Target)
                    </Label>
                    <div className="bg-white/5 border border-white/10 rounded-2xl h-14 px-6 flex items-center text-white font-bold opacity-50">
                      {language.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">
                    {t('sections.general.image_label')}
                  </Label>
                  {imagePreview ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden group border border-white/10">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={handleRemoveImage}
                          className="rounded-2xl h-12 w-12"
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-[2rem] border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer group">
                      <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                        <ImageIcon className="h-8 w-8 text-zinc-500 group-hover:text-zinc-300" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">
                        {t('sections.general.image_upload')}
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-black italic uppercase tracking-wider text-white">
                  {t('sections.instructions.title')}
                </h3>
              </div>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={t('sections.instructions.placeholder')}
                className="min-h-[300px] bg-white/5 border-white/10 rounded-2xl p-6 text-white text-base leading-relaxed font-medium placeholder:text-zinc-600 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Ingredients Section */}
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="font-black italic uppercase tracking-wider text-white">
                    {t('sections.ingredients.title')}
                  </h3>
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 font-bold uppercase tracking-widest px-3 py-1">
                  {ingredients.length} ITEMS
                </Badge>
              </div>

              <div className="space-y-4">
                {ingredients.map((ing, index) => (
                  <div key={ing.id} className="group relative space-y-3 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        {ing.productName ? (
                          <div className="flex items-center justify-between h-12 px-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                            <span className="text-white font-bold">{ing.productName}</span>
                            <button onClick={() => handleClearSelection(index)} className="text-indigo-400 hover:text-white transition-colors">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                              placeholder={t('sections.ingredients.search_placeholder')}
                              value={ing.searchValue}
                              onChange={(e) => handleSearch(e.target.value, index)}
                              className="bg-white/5 border-white/10 rounded-2xl h-12 pl-11 pr-4 text-white font-bold placeholder:text-zinc-600 focus:ring-orange-500"
                            />
                            {activeSearchIndex === index && (
                              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-3xl">
                                {(() => {
                                  const filtered = inventoryItems.filter(item => 
                                    item.product_name.toLowerCase().includes(ing.searchValue.toLowerCase())
                                  );
                                  
                                  if (filtered.length === 0) {
                                    return (
                                      <div className="px-6 py-8 text-center space-y-2">
                                        <X className="h-8 w-8 text-zinc-700 mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                          {t('sections.ingredients.not_found')}
                                        </p>
                                      </div>
                                    );
                                  }

                                  return filtered.map(item => (
                                    <button
                                      key={item.id}
                                      disabled={item.quantity <= 0}
                                      onClick={() => handleSelectProduct(index, item.id, item.product_name, item.base_unit, item.catalog_ingredient_id)}
                                      className={cn(
                                        "w-full px-6 py-4 text-left flex items-center justify-between group/item transition-colors",
                                        item.quantity <= 0 
                                          ? "opacity-40 cursor-not-allowed bg-red-500/5" 
                                          : "hover:bg-white/5"
                                      )}
                                    >
                                      <div>
                                        <div className={cn(
                                          "text-sm font-bold transition-colors",
                                          item.quantity <= 0 ? "text-zinc-500" : "text-white group-hover/item:text-indigo-400"
                                        )}>
                                          {item.product_name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <div className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">
                                            {item.category} • {item.quantity} {item.base_unit}
                                          </div>
                                          {item.quantity <= 0 && (
                                            <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0 rounded-md font-black uppercase tracking-widest">
                                              {t('sections.ingredients.out_of_stock')}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      {item.quantity > 0 && (
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                          <Plus className="h-4 w-4 text-white" />
                                        </div>
                                      )}
                                    </button>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-32 relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={ing.rawAmount}
                          onChange={(e) => handleUpdateIngredient(index, 'rawAmount', e.target.value)}
                          className="bg-white/5 border-white/10 rounded-2xl h-12 px-4 text-white font-bold text-right focus:ring-orange-500"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-500 uppercase">
                          {ing.unit || 'g'}
                        </span>
                      </div>

                      {ingredients.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveIngredient(ing.id)}
                          className="h-12 w-12 rounded-2xl text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleAddIngredient}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/5 border-dashed rounded-[1.5rem] h-14 font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all group"
                >
                  <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  {t('sections.ingredients.add_button')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Visual and Info */}
            <div className="space-y-8">
              <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 glass-portal shadow-2xl">
                {imagePreview ? (
                  <img src={imagePreview} alt={previewRecipe?.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-500/10 flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <ImageIcon className="h-20 w-20 text-indigo-500/30" />
                    <span className="text-zinc-500 font-black uppercase tracking-widest text-sm">Preview Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-10 left-10">
                  <Badge className="bg-indigo-500 text-white border-none font-black uppercase tracking-[0.2em] px-4 py-1.5 mb-2">
                    {previewRecipe?.difficulty}
                  </Badge>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
                    {previewRecipe?.title}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: t('sections.preview.servings'), value: previewRecipe?.servings, unit: 'pers', icon: Target, glow: 'bg-blue-500/10', color: 'text-blue-400' },
                  { label: t('sections.preview.time'), value: previewRecipe?.prepTime, unit: 'min', icon: Zap, glow: 'bg-amber-500/10', color: 'text-amber-400' },
                  { label: t('sections.preview.weight'), value: previewRecipe?.totalWeight, unit: 'g', icon: Activity, glow: 'bg-emerald-500/10', color: 'text-emerald-400' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 p-6 rounded-[2rem] space-y-3 transition-all hover:bg-white/[0.06] hover:border-white/10 group">
                    <div className="flex items-center justify-between">
                      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.glow)}>
                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black italic text-white tracking-tighter">{stat.value}</span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Breakdown */}
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black italic uppercase tracking-wider text-white">{t('sections.preview.cost_analysis')}</h3>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Live calculation</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black italic text-emerald-400 tracking-tighter">
                      ${previewRecipe?.totalCost.toFixed(2)}
                    </div>
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      TOTAL ESTIMATE
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {previewRecipe?.ingredients.map((ing, i) => (
                    <div key={i} className="group flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 rounded-xl transition-colors">
                      <div className="space-y-1">
                        <div className="text-zinc-200 font-bold group-hover:text-white transition-colors">{ing.name}</div>
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">
                          {ing.amount} {ing.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-400 font-bold group-hover:text-emerald-400 transition-colors">${ing.cost.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">{t('sections.preview.cost_per_serving')}</span>
                  </div>
                  <span className="text-2xl font-black italic text-emerald-400">${previewRecipe?.costPerServing.toFixed(2)}</span>
                </div>
              </div>

              {previewRecipe?.warnings && previewRecipe.warnings.length > 0 && (
                <div className="bg-black/40 backdrop-blur-3xl border border-orange-500/20 rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 text-orange-500">
                    <Zap className="h-24 w-24" />
                  </div>
                  <div className="flex items-center gap-3 text-orange-400 relative">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="font-black italic uppercase tracking-wider">Inventory Alerts</h3>
                  </div>
                  <div className="space-y-3 relative">
                    {previewRecipe.warnings.map((warning, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-sm font-bold text-orange-200/80 items-center">
                        <div className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-wider text-white">{t('sections.preview.instructions')}</h3>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">AI Processed sequence</p>
                </div>
              </div>
            </div>
            <p className="text-zinc-400 text-lg leading-relaxed font-bold italic uppercase tracking-tight whitespace-pre-wrap px-4 border-l-2 border-indigo-500/30">
              {previewRecipe?.instructions}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
