// 🎯 Recipe Types and Categories
// Recipes are created through the creation flow, not pre-populated

export const RECIPE_CATEGORIES = {
  pasta: { name: 'Паста', icon: '🍝' },
  salad: { name: 'Салаты', icon: '🥗' },
  soup: { name: 'Супы', icon: '🍲' },
  meat: { name: 'Мясо', icon: '🥩' },
  seafood: { name: 'Морепродукты', icon: '🐟' },
  dessert: { name: 'Десерты', icon: '🍰' },
  appetizer: { name: 'Закуски', icon: '🍢' },
  other: { name: 'Другое', icon: '🍽️' },
};

// Draft Recipe (user input - no calculations)
export interface RecipeDraft {
  name: string;
  ingredients: {
    inventoryItemId: string;
    rawAmount: string; // Just "200", "80" - no units
  }[];
  rawInstructions: string; // Free text
}

// Final Recipe (after bot processing)
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  servings: number;
  prepTime?: number;
  
  // Bot-processed ingredients
  ingredients: {
    catalogProductId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice?: number;
    cost?: number;
  }[];
  
  // Bot-calculated
  totalCost: number;
  costPerServing: number;
  
  // Bot-formatted
  instructions?: string;
  
  // Bot-analyzed
  status: 'ok' | 'warning' | 'error';
  aiInsights: string[];
}

// Empty array - recipes will be created through the flow
export const MOCK_RECIPES: Recipe[] = [];
