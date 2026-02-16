import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getRecipes, deleteRecipe as deleteRecipeAPI, type RecipeDTO } from '@/lib/api/recipes'

// We map Backend DTO to our Frontend state
export interface Recipe {
  id: string
  name: string
  description?: string
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
  totalWeight: number
  imageUrl?: string
  aiInsights: string[]
  warnings: string[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
}

interface RecipesState {
  recipes: Recipe[]
  isLoading: boolean
  error: string | null
  
  setRecipes: (recipes: Recipe[]) => void
  fetchRecipes: (accessToken: string) => Promise<void>
  addRecipe: (recipe: Recipe) => void // Adds locally after backend save
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  deleteRecipe: (id: string, accessToken: string) => Promise<void>
  getRecipe: (id: string) => Recipe | undefined
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
          
          // Map DTOs to our internal structure
          const mappedRecipes: Recipe[] = response.recipes.map(dto => ({
            id: dto.id,
            name: dto.name,
            servings: dto.servings,
            prepTime: 30, // Default if not in DTO
            difficulty: 'medium', // Default if not in DTO
            ingredients: dto.ingredients.map(ing => ({
              name: ing.catalog_ingredient_id, // We don't have joined name here, need to rethink
              amount: ing.quantity.toString(),
              unit: ing.unit,
              cost: 0 // Will be calculated by AI or shown in insights
            })),
            instructions: dto.instructions,
            totalCost: 0,
            costPerServing: 0,
            totalWeight: 0,
            aiInsights: [],
            warnings: [],
            createdAt: dto.created_at,
            updatedAt: dto.updated_at,
            status: dto.status
          }))
          
          set({ recipes: mappedRecipes, isLoading: false })
        } catch (err) {
          console.error('❌ [RECIPES_STORE] Fetch error:', err)
          set({ error: 'Failed to fetch recipes', isLoading: false })
        }
      },

      addRecipe: (newRecipe) => {
        set((state) => ({
          recipes: [newRecipe, ...state.recipes],
        }))
      },
      
      updateRecipe: (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id
              ? { ...recipe, ...updates, updatedAt: new Date().toISOString() }
              : recipe
          ),
        }))
      },
      
      deleteRecipe: async (id, accessToken) => {
        try {
          await deleteRecipeAPI(id, accessToken)
          set((state) => ({
            recipes: state.recipes.filter((recipe) => recipe.id !== id),
          }))
        } catch (err) {
          console.error('❌ [RECIPES_STORE] Delete error:', err)
          throw err
        }
      },
      
      getRecipe: (id) => {
        return get().recipes.find((recipe) => recipe.id === id)
      },
    }),
    {
      name: 'recipes-storage',
    }
  )
)
