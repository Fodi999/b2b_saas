import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MenuCategory = 'star' | 'cash-cow' | 'question' | 'dog'

export interface MenuDish {
  dishId: string
  dishName: string
  cost: number // себестоимость
  price: number // цена продажи
  margin: number // маржа в PLN
  marginPercent: number // маржа в %
  foodCost: number // food cost в %
  category: MenuCategory
  warnings: string[]
  imageUrl?: string
}

export interface MenuAnalytics {
  totalMarginPercent: number
  avgFoodCost: number
  problemDishes: number
  potentialGrowth: number // в %
  monthlyPotential: number // в PLN
}

export interface MenuRecommendation {
  dishId: string
  dishName: string
  type: 'increase-price' | 'replace-recipe' | 'promote' | 'disable'
  impact: string // например "+420 PLN / месяц"
  description: string
}

interface MenuStoreState {
  dishes: MenuDish[]
  analytics: MenuAnalytics | null
  recommendations: MenuRecommendation[]
  refreshMenu: () => void
}

// Helper: calculate category based on food cost
function calculateCategory(foodCost: number): MenuCategory {
  if (foodCost < 30) return 'star'
  if (foodCost >= 30 && foodCost < 40) return 'cash-cow'
  if (foodCost >= 40 && foodCost < 55) return 'question'
  return 'dog' // > 55%
}

export const useMenuStore = create<MenuStoreState>()(
  persist(
    (set, get) => ({
      dishes: [],
      analytics: null,
      recommendations: [],

      refreshMenu: () => {
        // This will be called to recalculate menu from dishes store
        // For now, it's a placeholder that will be populated when we integrate with dishes
        const dishes: MenuDish[] = []
        
        // Calculate analytics
        if (dishes.length > 0) {
          const totalMargin = dishes.reduce((sum, d) => sum + d.marginPercent, 0)
          const avgFoodCost = dishes.reduce((sum, d) => sum + d.foodCost, 0) / dishes.length
          const problemDishes = dishes.filter(d => d.category === 'dog' || d.category === 'question').length
          
          const analytics: MenuAnalytics = {
            totalMarginPercent: totalMargin / dishes.length,
            avgFoodCost: avgFoodCost,
            problemDishes: problemDishes,
            potentialGrowth: problemDishes > 0 ? 18 : 0, // mock
            monthlyPotential: problemDishes > 0 ? 420 : 0, // mock
          }

          set({ dishes, analytics })
        } else {
          set({ dishes: [], analytics: null })
        }
      },
    }),
    {
      name: 'menu-storage',
    }
  )
)
