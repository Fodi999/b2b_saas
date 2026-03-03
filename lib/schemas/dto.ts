/**
 * Zod schemas & TypeScript DTOs for ALL backend API responses.
 * Single source of truth for runtime validation + types.
 */
import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

export const Language = z.enum(['ru', 'en', 'pl', 'uk']);
export type Language = z.infer<typeof Language>;

// ============================================================================
// AUTH
// ============================================================================

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().default('Bearer'),
  user_id: z.string(),
  tenant_id: z.string(),
});
export type AuthResponseDTO = z.infer<typeof AuthResponseSchema>;

export const RefreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(), // some backends rotate refresh tokens
  token_type: z.string().optional(),
  user_id: z.string().optional(),
  tenant_id: z.string().optional(),
});
export type RefreshResponseDTO = z.infer<typeof RefreshResponseSchema>;

// ============================================================================
// USER / ME
// ============================================================================

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string().nullable().default(null),
  avatar_url: z.string().nullable().default(null),
  language: Language.default('en'),
  role: z.string().default('owner'),
  tenant_id: z.string(),
});
export type UserDTO = z.infer<typeof UserSchema>;

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type TenantDTO = z.infer<typeof TenantSchema>;

export const MeResponseSchema = z.object({
  user: UserSchema,
  tenant: TenantSchema,
});
export type MeResponseDTO = z.infer<typeof MeResponseSchema>;

// ============================================================================
// PAGINATION
// ============================================================================

export function PaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema).default([]),
    total: z.number().default(0),
    page: z.number().default(1),
    per_page: z.number().default(50),
  });
}
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
};

// ============================================================================
// DISHES
// ============================================================================

export const DishSchema = z.object({
  id: z.string(),
  name: z.string(),
  recipe_id: z.string(),
  description: z.string().nullable().default(null),
  selling_price_cents: z.number().int(),
  recipe_cost_cents: z.number().int().nullable().default(null),
  food_cost_percent: z.number().nullable().default(null),
  profit_margin_percent: z.number().nullable().default(null),
  active: z.boolean().default(true),
  image_url: z.string().nullable().default(null),
});
export type DishDTO = z.infer<typeof DishSchema>;

export const DishesResponseSchema = PaginatedSchema(DishSchema);
export type DishesResponseDTO = z.infer<typeof DishesResponseSchema>;

// ============================================================================
// INVENTORY
// ============================================================================

const CategoryEmbeddedSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const ProductEmbeddedSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.union([CategoryEmbeddedSchema, z.string()]),
  base_unit: z.enum(['kilogram', 'liter', 'piece']),
  image_url: z.string().nullable().optional().default(null),
});

export const InventoryProductRawSchema = z.object({
  id: z.string(),
  product: ProductEmbeddedSchema,
  quantity: z.number(),
  price_per_unit_cents: z.number().int(),
  received_at: z.string().nullable().default(null),
  expires_at: z.string().nullable().default(null),
  created_at: z.string().default(''),
  updated_at: z.string().default(''),
});
export type InventoryProductRawDTO = z.infer<typeof InventoryProductRawSchema>;

export const InventoryProductsResponseSchema = z.object({
  items: z.array(InventoryProductRawSchema).default([]),
  total: z.number().default(0),
  page: z.number().default(1),
  per_page: z.number().default(50),
});

export const InventoryDashboardSchema = z.object({
  total_items: z.number().optional(),
  total_stock_value_cents: z.number().default(0),
  waste_30d_cents: z.number().default(0),
  waste_percentage: z.number().default(0),
  health_score: z.number().default(100),
  expiring_soon_count: z.number().optional(),
  expired_count: z.number().optional(),
  total_value_cents: z.number().optional(),
  stockout_risks: z.array(z.any()).default([]),
  expired_risks: z.array(z.any()).default([]),
});
export type InventoryDashboardDTO = z.infer<typeof InventoryDashboardSchema>;

export const InventoryHealthSchema = z.object({
  health_score: z.number().default(100),
  status: z.enum(['Excellent', 'Good', 'Warning', 'Critical']).default('Excellent'),
  critical: z.number().default(0),
  warning: z.number().default(0),
  expired: z.number().default(0),
  low_stock: z.number().default(0),
  badge_count: z.number().default(0),
});
export type InventoryHealthDTO = z.infer<typeof InventoryHealthSchema>;

export const InventoryAlertSchema = z.object({
  id: z.string(),
  type: z.string(),
  product_name: z.string(),
  message: z.string(),
  severity: z.enum(['critical', 'warning']).default('warning'),
  created_at: z.string().default(''),
});
export type InventoryAlertDTO = z.infer<typeof InventoryAlertSchema>;

// ============================================================================
// CATALOG
// ============================================================================

export const CatalogCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
});
export type CatalogCategoryDTO = z.infer<typeof CatalogCategorySchema>;

export const CatalogIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  category_id: z.string().optional().default(''),
  category: CategoryEmbeddedSchema.optional(),
  default_unit: z.enum(['kilogram', 'liter', 'piece']).default('kilogram'),
  default_shelf_life_days: z.number().optional(),
  allergens: z.array(z.string()).default([]),
  calories_per_100g: z.number().optional(),
  seasons: z.array(z.string()).default([]),
  image_url: z.string().nullable().default(null),
});
export type CatalogIngredientDTO = z.infer<typeof CatalogIngredientSchema>;

// ============================================================================
// RECIPES V2
// ============================================================================

export const RecipeIngredientSchema = z.object({
  ingredient_id: z.string().optional(),
  catalog_ingredient_id: z.string().optional(),
  catalog_ingredient_name: z.string().optional(),
  quantity: z.coerce.number().default(0),   // backend may send string
  unit: z.string().default(''),
  cost_at_use_cents: z.number().nullable().default(null), // backend may send null
});
export type RecipeIngredientDTO = z.infer<typeof RecipeIngredientSchema>;

export const RecipeStatusEnum = z.enum(['draft', 'ai_review', 'approved', 'production', 'published']);
export type RecipeStatus = z.infer<typeof RecipeStatusEnum>;

export const RecipeDTOSchema = z.object({
  id: z.string(),
  tenant_id: z.string().optional().default(''),
  name: z.string(),
  instructions: z.string().default(''),
  language: Language.default('en'),
  servings: z.number().default(1),
  status: RecipeStatusEnum.default('draft'),
  created_at: z.union([z.string(), z.number(), z.array(z.any())]).transform(v => {
    if (Array.isArray(v)) return String(v[0] ?? '');
    if (typeof v === 'number') return String(v);
    return v ?? '';
  }).pipe(z.string()).default(''),
  updated_at: z.union([z.string(), z.number(), z.array(z.any())]).transform(v => {
    if (Array.isArray(v)) return String(v[0] ?? '');
    if (typeof v === 'number') return String(v);
    return v ?? '';
  }).pipe(z.string()).default(''),
  deleted_at: z.string().nullable().default(null),
  ingredients: z.array(RecipeIngredientSchema).default([]),
  translations: z.array(z.any()).optional().default([]),
  image_url: z.string().nullable().optional().default(null),
  total_cost_cents: z.number().nullable().default(null),      // backend may send null
  cost_per_serving_cents: z.number().nullable().default(null), // backend may send null
  cost: z.number().optional(),
  is_public: z.boolean().optional(),
});
export type RecipeDTOType = z.infer<typeof RecipeDTOSchema>;

// ============================================================================
// AI INSIGHTS
// ============================================================================

export const InsightStepSchema = z.object({
  step_number: z.number(),
  action: z.string(),
  description: z.string(),
  duration_minutes: z.number().nullable().default(null),
  temperature: z.string().nullable().default(null),
  technique: z.string().nullable().default(null),
  ingredients_used: z.array(z.string()).default([]),
});

export const InsightValidationSchema = z.object({
  is_valid: z.boolean().default(true),
  errors: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']).default('error'),
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
  })).default([]),
  warnings: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']).default('warning'),
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
  })).default([]),
  missing_ingredients: z.array(z.string()).default([]),
  safety_checks: z.array(z.string()).default([]),
});

export const InsightSuggestionSchema = z.object({
  suggestion_type: z.string(),
  title: z.string(),
  description: z.string(),
  impact: z.string(),
  confidence: z.number().default(0),
});

export const RecipeInsightSchema = z.object({
  id: z.string(),
  recipe_id: z.string(),
  language: z.string(),
  feasibility_score: z.number().default(0),
  dish_type: z.string().optional(),
  steps: z.array(InsightStepSchema).default([]),
  validation: InsightValidationSchema.default({
    is_valid: true,
    errors: [],
    warnings: [],
    missing_ingredients: [],
    safety_checks: [],
  }),
  suggestions: z.array(InsightSuggestionSchema).default([]),
  model: z.string().optional(),
  created_at: z.string().optional(),
});

export const RecipeInsightResponseSchema = z.object({
  insights: RecipeInsightSchema,
  generation_time_ms: z.number().default(0),
});
export type RecipeInsightResponseDTO = z.infer<typeof RecipeInsightResponseSchema>;

// ============================================================================
// MENU ENGINEERING
// ============================================================================

export const MenuDishPerformanceSchema = z.object({
  dish_id: z.string(),
  name: z.string(),
  food_cost_cents: z.number().default(0),
  selling_price_cents: z.number().default(0),
  margin_cents: z.number().default(0),
  sales_count: z.number().default(0),
  ai_recommendation: z.string().optional().default(''),
});
export type MenuDishPerformanceDTO = z.infer<typeof MenuDishPerformanceSchema>;

export const MenuEngineeringResponseSchema = z.object({
  tenant_id: z.string(),
  period_days: z.number(),
  total_revenue_cents: z.number().default(0),
  average_margin_cents: z.number().default(0),
  categories: z.object({
    stars: z.array(MenuDishPerformanceSchema).default([]),
    plowhorses: z.array(MenuDishPerformanceSchema).default([]),
    puzzles: z.array(MenuDishPerformanceSchema).default([]),
    dogs: z.array(MenuDishPerformanceSchema).default([]),
  }),
});
export type MenuEngineeringResponseDTO = z.infer<typeof MenuEngineeringResponseSchema>;

// ============================================================================
// REPORTS
// ============================================================================

export const ReportSummarySchema = z.object({
  revenue_cents: z.number().default(0),
  cost_cents: z.number().default(0),
  profit_cents: z.number().default(0),
  food_cost_percent: z.number().default(0),
  top_dishes: z.array(z.any()).default([]),
  low_margin_dishes: z.array(z.any()).default([]),
  // Extended fields from production endpoint
  period_days: z.number().optional(),
  total_revenue_cents: z.number().optional(),
  total_profit_cents: z.number().optional(),
  total_orders: z.number().optional(),
  avg_order_profit_cents: z.number().optional(),
  inventory_health_score: z.number().optional(),
  waste_cents: z.number().optional(),
  stars: z.number().optional(),
  plowhorses: z.number().optional(),
  puzzles: z.number().optional(),
  dogs: z.number().optional(),
  best_dish: z.object({
    name: z.string(),
    profit_margin_percent: z.number(),
  }).nullable().optional(),
});
export type ReportSummaryDTO = z.infer<typeof ReportSummarySchema>;

// ============================================================================
// ASSISTANT
// ============================================================================

export const AssistantStateSchema = z.object({
  step: z.string(),
  message: z.string().default(''),
  progress: z.number().default(0),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
  })).default([]),
  warnings: z.array(z.object({
    level: z.string(),
    message: z.string(),
  })).default([]),
});
export type AssistantStateDTO = z.infer<typeof AssistantStateSchema>;
