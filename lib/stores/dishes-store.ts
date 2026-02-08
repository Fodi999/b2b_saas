import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DishComponent {
  recipeId: string
  recipeName: string
  quantity: number // количество порций (обычно 1)
  cost: number // рассчитывается из рецепта (цена 1 порции)
}

export interface Dish {
  id: string
  name: string
  description?: string
  components: DishComponent[]
  salePrice: number // цена продажи (PLN)
  totalCost: number // Σ себестоимости всех компонентов
  margin: number // salePrice - totalCost
  marginPercent: number // (margin / salePrice) * 100
  foodCostPercent: number // (totalCost / salePrice) * 100
  status: 'profit' | 'warning' | 'loss' // profit: >25%, warning: 15-25%, loss: <15%
  imageUrl?: string
  aiRecommendedPrice?: number
  aiInsights: string[]
  warnings: string[] // проблемы из рецептов
  createdAt: string
  updatedAt: string
}

interface DishesState {
  dishes: Dish[]
  addDish: (dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>) => Dish
  updateDish: (id: string, dish: Partial<Dish>) => void
  deleteDish: (id: string) => void
  getDish: (id: string) => Dish | undefined
}

export const useDishesStore = create<DishesState>()(
  persist(
    (set, get) => ({
      dishes: [],
      
      addDish: (dishData) => {
        const newDish: Dish = {
          ...dishData,
          id: `dish-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          dishes: [newDish, ...state.dishes],
        }))
        
        return newDish
      },
      
      updateDish: (id, updates) => {
        set((state) => ({
          dishes: state.dishes.map((dish) =>
            dish.id === id
              ? { ...dish, ...updates, updatedAt: new Date().toISOString() }
              : dish
          ),
        }))
      },
      
      deleteDish: (id) => {
        set((state) => ({
          dishes: state.dishes.filter((dish) => dish.id !== id),
        }))
      },
      
      getDish: (id) => {
        return get().dishes.find((dish) => dish.id === id)
      },
    }),
    {
      name: 'dishes-storage',
    }
  )
)
