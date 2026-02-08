import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

interface RecipesState {
  recipes: Recipe[]
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Recipe
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  deleteRecipe: (id: string) => void
  getRecipe: (id: string) => Recipe | undefined
}

export const useRecipesStore = create<RecipesState>()(
  persist(
    (set, get) => ({
      recipes: [],
      
      addRecipe: (recipeData) => {
        const newRecipe: Recipe = {
          ...recipeData,
          id: `recipe-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          recipes: [newRecipe, ...state.recipes],
        }))
        
        return newRecipe
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
      
      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
        }))
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
