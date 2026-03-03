import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getRecipes,
  deleteRecipe as deleteRecipeAPI,
  type RecipeDTO,
  type RecipeStatus,
} from '@/lib/api/recipes'

// Frontend display type (mapped from DTO)
export interface Recipe {
  id: string
  name: string
  description?: string
  servings: number
  prepTime: number
  difficulty: string
  ingredients: Array<{
    name: string
    amount: string
    unit: string
    cost: number
  }>
  instructions: string
  totalCost: number
  costPerServing: number
  totalWeight: number
  imageUrl?: string
  cost?: number
  margin?: number
  aiInsights: string[]
  warnings: string[]
  createdAt: string
  updatedAt: string
  status: RecipeStatus
}

interface RecipesState {
  recipes: Recipe[]
  isLoading: boolean
  error: string | null

  setRecipes: (recipes: Recipe[]) => void
  fetchRecipes: (accessToken: string) => Promise<void>
  addRecipe: (recipe: Recipe) => void
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  deleteRecipe: (id: string, accessToken: string) => Promise<void>
  getRecipe: (id: string) => Recipe | undefined
}

function mapDTO(dto: RecipeDTO): Recipe {
  return {
    id: dto.id,
    name: dto.name,
    servings: dto.servings,
    imageUrl: dto.image_url || undefined,
    prepTime: 30,
    difficulty: 'medium',
    ingredients: (dto.ingredients ?? []).map(ing => ({
      name: ing.catalog_ingredient_id || ing.ingredient_id || 'Unknown',
      amount: String(ing.quantity),
      unit: ing.unit,
      cost: 0,
    })),
    instructions: dto.instructions,
    cost: dto.cost || 0,
    margin: undefined,
    totalCost: 0,
    costPerServing: 0,
    totalWeight: 0,
    aiInsights: [],
    warnings: [],
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    status: dto.status as RecipeStatus,
  }
}

export const useRecipesStore = create<RecipesState>()(
  persist(
    (set, get) => ({
      recipes: [],
      isLoading: false,
      error: null,

      setRecipes: (recipes) => set({ recipes }),

      fetchRecipes: async (accessToken) => {
        set({ isLoading: true, error: null })
        try {
          const response = await getRecipes(accessToken)
          const mapped = (response.recipes ?? []).map(mapDTO)
          set({ recipes: mapped, isLoading: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch recipes',
            isLoading: false,
          })
        }
      },

      addRecipe: (newRecipe) =>
        set((state) => ({ recipes: [newRecipe, ...state.recipes] })),

      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),

      deleteRecipe: async (id, accessToken) => {
        await deleteRecipeAPI(id, accessToken)
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        }))
      },

      getRecipe: (id) => get().recipes.find((r) => r.id === id),
    }),
    {
      name: 'recipes-storage',
      // Only persist lightweight UI state — never cache the full recipes array
      // (recipes can be thousands of bytes and bust the 5 MB localStorage quota)
      partialize: (state) => ({
        // intentionally empty: nothing persisted
        // Add small fields here if needed, e.g.: selectedId: state.selectedId
      }),
    }
  )
)

// Clear any oversized legacy data left in localStorage from previous builds
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('recipes-storage')
    if (raw && raw.length > 50_000) {
      localStorage.removeItem('recipes-storage')
    }
  } catch {
    // ignore – private browsing or storage not available
  }
}
