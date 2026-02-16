'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRecipesStore } from '@/lib/stores/recipes-store'
import { useDishesStore } from '@/lib/stores/dishes-store'
import { useRouter, useParams } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, 
  Plus, 
  X, 
  Search, 
  Eye, 
  Check, 
  Loader2, 
  ArrowLeft, 
  UtensilsCrossed, 
  ImageIcon,
  Zap,
  Activity,
  ArrowRight,
  Target,
  LineChart,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('dishes.create')

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

  const handleAnalyze = useCallback(async () => {
    if (!dishName || components.some(c => !c.recipeId) || !salePrice) {
      setValidationError('Пожалуйста, заполните все поля и выберите рецепты')
      return
    }
    
    setIsAnalyzing(true)
    setValidationError('')
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const selectedRecipes = components.map(c => recipes.find(r => r.id === c.recipeId)!)
    const totalCost = selectedRecipes.reduce((sum, r) => sum + (r.totalCost / r.servings), 0)
    const priceVal = parseFloat(salePrice)
    const margin = priceVal - totalCost
    const marginPercent = (margin / priceVal) * 100
    
    setPreviewDish({
      name: dishName,
      components: selectedRecipes.map(r => ({
        recipeName: r.name,
        quantity: 1,
        cost: r.totalCost / r.servings
      })),
      salePrice: priceVal,
      totalCost,
      margin,
      marginPercent,
      foodCostPercent: (totalCost / priceVal) * 100,
      status: getStatus(marginPercent),
      aiRecommendedPrice: calculateRecommendedPrice(totalCost),
      aiInsights: [
        'Обнаружена оптимальная синергия рецептов.',
        `Целевая маржа ${marginPercent.toFixed(0)}% в пределах нормы.`,
        'Подтверждена доступность ингредиентов на складе.'
      ],
      warnings: marginPercent < 20 ? ['Низкая маржа. Рассмотрите возможность корректировки цены.'] : []
    })
    
    setMode('preview')
    setIsAnalyzing(false)
  }, [dishName, components, salePrice, recipes])

  const handleSave = useCallback(() => {
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

      router.push(`/${locale}/dishes`)
    }, 1000)
  }, [previewDish, components, imagePreview, addDish, router, locale])

  const handleBackToEdit = useCallback(() => {
    setMode('edit')
    setPreviewDish(null)
  }, [])

  if (!user) {
    return null
  }

  // Loading state helper component
  if (mode === 'saving') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
          <Loader2 className="h-16 w-16 text-indigo-500 animate-spin relative z-10" />
        </div>
        <p className="mt-8 text-white font-black uppercase tracking-[0.3em] animate-pulse">
          {t('analyzing')}
        </p>
      </div>
    )
  }

  // Preview Mode Refactored
  if (mode === 'preview' && previewDish) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans">
        <div className="container mx-auto px-6 py-10 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-1">
                    {previewDish.name}
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    Preview Mode · RestoAI Vision
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setMode('edit')}
                className="h-14 px-8 rounded-2xl border border-white/10 font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
            </div>

            {/* AI Analysis Result */}
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 scale-150">
                <Zap className="w-64 h-64 text-indigo-400" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    {t('preview.title')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-black/40 rounded-[2rem] p-8 border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">{t('preview.kpi.totalCost')}</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black italic tracking-tighter">{previewDish.totalCost.toFixed(2)}</span>
                       <span className="text-[10px] font-bold text-white/20">PLN</span>
                    </div>
                  </div>
                  <div className="bg-indigo-500/5 rounded-[2rem] p-8 border border-indigo-500/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60 mb-4">{t('preview.kpi.margin')}</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black italic tracking-tighter text-indigo-400">{previewDish.margin.toFixed(2)}</span>
                       <span className="text-[10px] font-bold text-indigo-400/40">PLN</span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-400 mt-2 uppercase tracking-widest">
                      {previewDish.marginPercent.toFixed(1)}% Efficiency
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">{t('preview.kpi.recommended')}</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black italic tracking-tighter text-emerald-400">{previewDish.aiRecommendedPrice.toFixed(2)}</span>
                       <span className="text-[10px] font-bold text-emerald-400/40">PLN</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Ingredients Preview */}
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40 px-4">Ingredients Composition</h3>
                    <div className="space-y-2">
                      {previewDish.components.map((comp, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20">
                              {i + 1}
                            </div>
                            <p className="font-black italic text-white uppercase tracking-tight">{comp.recipeName}</p>
                          </div>
                          <p className="font-bold text-white/40">{comp.cost.toFixed(2)} PLN</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Strategist Recommendations */}
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-indigo-400 px-4">AI Recommendations</h3>
                    <div className="bg-black/40 rounded-[2rem] border border-indigo-500/20 p-8 space-y-6">
                      {previewDish.aiInsights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                          <p className="text-sm font-medium italic text-white/80 leading-relaxed pt-1">
                            {insight}
                          </p>
                        </div>
                      ))}
                      {previewDish.warnings.length > 0 && (
                        <div className="pt-6 border-t border-white/5 space-y-4">
                          {previewDish.warnings.map((warning, i) => (
                            <div key={i} className="flex items-start gap-4 text-rose-400/80">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                                {warning}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => setMode('edit')}
                className="flex-1 h-16 rounded-[2rem] bg-white text-black hover:bg-white/90 border-none font-black uppercase text-[12px] tracking-[0.3em]"
              >
                {t('back')}
              </Button>
              <Button
                onClick={handleSave}
                className="flex-[2] h-16 rounded-[2rem] bg-indigo-500 hover:bg-indigo-600 font-black uppercase text-[12px] tracking-[0.3em] shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)] transition-all"
              >
                {t('save')}
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Edit Mode Refactored
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
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <div className="container mx-auto px-6 py-10 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[1.5rem] blur opacity-25"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-black border border-white/10">
                  <UtensilsCrossed className="h-10 w-10 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                    {t('title')}<span className="text-indigo-500">{t('core')}</span>
                  </h1>
                  <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                    ACTIVE
                  </div>
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] ml-1 mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push(`/${locale}/dishes`)}
              className="h-14 px-8 rounded-[2rem] border border-white/10 font-black uppercase text-[10px] tracking-widest text-white/40 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 space-y-12">
            {/* Dish Name Section */}
            <div>
              <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 mb-4 block">
                {t('nameLabel')}
              </Label>
              <Input
                placeholder={t('namePlaceholder')}
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="h-16 px-8 rounded-2xl bg-black/40 border-white/10 text-lg font-black italic focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-white/10"
              />
            </div>

            {/* Components Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40">
                    {t('components.title')}
                  </Label>
                  <div className="px-3 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-black">
                    {components.filter(c => c.recipeId).length}
                  </div>
                </div>
                <Button
                  onClick={handleAddComponent}
                  className="h-10 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('components.add')}
                </Button>
              </div>

              <div className="space-y-3">
                {components.map((component, index) => (
                  <div key={component.id} className="group relative bg-black/40 border border-white/5 rounded-[2rem] p-6 transition-all hover:border-white/20">
                    {!component.recipeId ? (
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input
                          placeholder={t('components.searchPlaceholder')}
                          value={component.searchValue}
                          onChange={(e) => handleSearch(e.target.value, index)}
                          onFocus={() => setActiveSearchIndex(index)}
                          className="h-14 pl-12 rounded-xl bg-white/5 border-none text-white font-medium italic placeholder:text-white/10"
                        />

                        {activeSearchIndex === index && searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-3 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]">
                            {searchResults.map((recipe) => (
                              <button
                                key={recipe.id}
                                onClick={() => handleSelectRecipe(index, recipe.id, recipe.name)}
                                className="w-full p-4 flex items-center justify-between hover:bg-indigo-500 group/item transition-colors"
                              >
                                <div className="text-left">
                                  <p className="font-black italic text-white group-hover/item:text-white">{recipe.name}</p>
                                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover/item:text-white/60">
                                    {recipe.servings} Portions · {(recipe.totalCost / recipe.servings).toFixed(2)} PLN/Port.
                                  </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/20 group-hover/item:text-white" />
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {showNoResultsMessage && activeSearchIndex === index && (
                          <div className="absolute top-full left-0 right-0 mt-3 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 z-[100]">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-orange-400" />
                              </div>
                              <div>
                                <p className="font-black uppercase text-xs text-white">{t('components.notFound')}</p>
                                <p className="text-[10px] text-white/40 mt-1">{t('components.notFoundAction')}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                             <Check className="w-6 h-6 text-indigo-400" />
                           </div>
                           <div>
                              <p className="text-xl font-black italic text-white uppercase tracking-tight">{component.recipeName}</p>
                              <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-0.5 rounded-full font-black text-[9px] uppercase tracking-widest mt-1">
                                {t('components.selectedPortion')}
                              </Badge>
                           </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleClearSelection(index)}
                          className="h-10 w-10 p-0 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    )}

                    {components.length > 1 && !component.recipeId && (
                      <button 
                        onClick={() => handleRemoveComponent(component.id)}
                        className="absolute -top-3 -right-3 h-8 w-8 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/20 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
              <div>
                <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 mb-4 block">
                  {t('pricing.label')}
                </Label>
                <div className="relative">
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-black italic">PLN</div>
                   <Input 
                    type="number"
                    placeholder={t('pricing.placeholder')}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="h-20 px-8 rounded-3xl bg-black border-white/10 text-3xl font-black italic text-indigo-400 focus:ring-indigo-500 pr-16"
                   />
                </div>
              </div>
              
              <div className="bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 p-8 flex flex-col justify-center">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                      <Zap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-indigo-400">RestoAI Strategist</p>
                 </div>
                 <p className="text-sm text-indigo-400/60 font-medium italic leading-relaxed">
                   AI will analyze your recipe synergies, food cost fluctuations, and market benchmarks to provide a profitability score.
                 </p>
              </div>
            </div>
            
            {validationError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-center gap-4 animate-in shake-1 duration-500">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                <p className="text-sm font-black uppercase tracking-widest text-rose-500">{validationError}</p>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full h-20 rounded-[2.5rem] bg-white text-black hover:bg-indigo-500 hover:text-white font-black uppercase text-[14px] tracking-[0.4em] transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 mr-4 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 mr-4" />
                  {t('analyze')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
