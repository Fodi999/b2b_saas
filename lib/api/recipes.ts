import { apiFetch } from './client';
import {
  RecipeDTOSchema,
  RecipeInsightResponseSchema,
  type RecipeDTOType,
  type RecipeInsightResponseDTO,
  type Language,
} from '@/lib/schemas/dto';

// ============================================================================
// Re-export types for consumers
// ============================================================================

export type RecipeLanguage = Language;
export type RecipeStatus = 'draft' | 'ai_review' | 'approved' | 'production' | 'published';
export type RecipeDTO = RecipeDTOType;
export type RecipeInsightResponse = RecipeInsightResponseDTO;

export interface RecipeIngredientDTO {
  ingredient_id?: string;
  catalog_ingredient_id?: string;
  quantity: number;
  unit: string;
}

export interface RecipeTranslationDTO {
  id: string;
  recipe_id: string;
  language: RecipeLanguage;
  name: string;
  instructions: string;
  translated_at: string;
  translated_by: string;
}

export interface CreateRecipeRequest {
  name: string;
  instructions: string;
  language: RecipeLanguage;
  servings: number;
  ingredients: RecipeIngredientDTO[];
  status?: RecipeStatus;
  total_time?: number;
  steps?: RecipeInsightStep[];
  image_url?: string | null;
}

export interface UpdateRecipeRequest {
  name?: string;
  instructions?: string;
  servings?: number;
  total_time?: number;
  ingredients?: RecipeIngredientDTO[];
  steps?: RecipeInsightStep[];
  status?: RecipeStatus;
  language?: RecipeLanguage;
  image_url?: string | null;
}

export interface RecipeListResponse {
  recipes: RecipeDTO[];
  total: number;
  limit?: number;
  offset?: number;
}

// Frontend display type
export interface Recipe {
  id: string;
  name: string;
  instructions: string;
  language: RecipeLanguage;
  servings: number;
  status: RecipeStatus;
  createdAt: string;
  updatedAt: string;
  ingredients: {
    id?: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  imageUrl?: string;
  cost?: number;
  margin?: number;
  prepTime?: number;
  difficulty?: string;
  translations: Map<RecipeLanguage, { name: string; instructions: string }>;
}

// Insight sub-types
export interface RecipeInsightStep {
  step_number: number;
  action: string;
  description: string;
  duration_minutes: number | null;
  temperature: string | null;
  technique: string | null;
  ingredients_used: string[];
}

export interface RecipeInsightValidationError {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface RecipeInsightValidation {
  is_valid: boolean;
  errors: RecipeInsightValidationError[];
  warnings: RecipeInsightValidationError[];
  missing_ingredients: string[];
  safety_checks: string[];
}

export interface RecipeInsightSuggestion {
  suggestion_type: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
}

export interface RecipeInsightDTO {
  id: string;
  recipe_id: string;
  language: RecipeLanguage;
  feasibility_score: number;
  dish_type?: string;
  steps: RecipeInsightStep[];
  validation: RecipeInsightValidation;
  suggestions: RecipeInsightSuggestion[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a recipe via V2 endpoint.
 */
export async function createRecipe(
  data: CreateRecipeRequest,
  accessToken: string
): Promise<RecipeDTO> {
  const mappedData: Record<string, unknown> = {
    name: data.name,
    instructions: data.instructions,
    language: data.language,
    servings: data.servings,
    status: data.status || 'draft',
    total_time: data.total_time || 30,
    steps: data.steps || [],
    image_url: data.image_url,
  };

  if (data.ingredients) {
    mappedData.ingredients = data.ingredients.map(ing => ({
      catalog_ingredient_id: ing.catalog_ingredient_id || ing.ingredient_id,
      quantity: ing.quantity,
      unit: ing.unit,
    }));
  }

  const raw = await apiFetch<unknown>('/api/recipes/v2', {
    method: 'POST',
    body: JSON.stringify(mappedData),
  }, accessToken);

  return RecipeDTOSchema.parse(raw);
}

/**
 * Get recipes list.
 * Backend returns ARRAY directly (per API contract).
 * We normalise into { recipes, total } for the store.
 */
export async function getRecipes(
  accessToken: string,
  params?: {
    page?: number;
    per_page?: number;
    status?: RecipeStatus;
    language?: RecipeLanguage;
    search?: string;
  }
): Promise<RecipeListResponse> {
  const qs = new URLSearchParams();
  const limit = params?.per_page || 50;
  const page = params?.page || 1;
  const offset = (page - 1) * limit;

  qs.set('limit', String(limit));
  qs.set('offset', String(offset));
  if (params?.status) qs.set('status', params.status);
  if (params?.language) qs.set('language', params.language);
  if (params?.search) qs.set('search', params.search);

  const url = `/api/recipes/v2?${qs.toString()}`;
  const raw = await apiFetch<unknown>(url, {}, accessToken);

  // Backend may return: RecipeDTO[] | { recipes: RecipeDTO[] }
  let recipes: RecipeDTO[] = [];

  if (Array.isArray(raw)) {
    recipes = raw.map(r => RecipeDTOSchema.parse(r));
  } else if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const arr = obj.recipes ?? obj.items ?? obj.data ?? [];
    if (Array.isArray(arr)) {
      recipes = arr.map(r => RecipeDTOSchema.parse(r));
    }
  }

  return {
    recipes,
    total: recipes.length,
    limit,
    offset,
  };
}

/**
 * Get single recipe by ID.
 */
export async function getRecipe(
  id: string,
  accessToken: string,
  language?: RecipeLanguage
): Promise<RecipeDTO> {
  const url = language ? `/api/recipes/v2/${id}?language=${language}` : `/api/recipes/v2/${id}`;
  const raw = await apiFetch<unknown>(url, {}, accessToken);
  return RecipeDTOSchema.parse(raw);
}

/**
 * Update recipe (PATCH).
 */
export async function updateRecipe(
  id: string,
  data: UpdateRecipeRequest,
  accessToken: string
): Promise<RecipeDTO> {
  const mappedData: Record<string, unknown> = {};
  if (data.name !== undefined) mappedData.name = data.name;
  if (data.instructions !== undefined) mappedData.instructions = data.instructions;
  if (data.servings !== undefined) mappedData.servings = data.servings;
  if (data.total_time !== undefined) mappedData.total_time = data.total_time;
  if (data.status !== undefined) mappedData.status = data.status;
  if (data.language !== undefined) mappedData.language = data.language;
  if (data.image_url !== undefined) mappedData.image_url = data.image_url;
  if (data.ingredients) {
    mappedData.ingredients = data.ingredients.map(ing => ({
      catalog_ingredient_id: ing.catalog_ingredient_id || ing.ingredient_id,
      quantity: ing.quantity,
      unit: ing.unit,
    }));
  }
  if (data.steps) mappedData.steps = data.steps;

  const raw = await apiFetch<unknown>(`/api/recipes/v2/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(mappedData),
  }, accessToken);

  return RecipeDTOSchema.parse(raw);
}

/**
 * Delete recipe.
 */
export async function deleteRecipe(id: string, accessToken: string): Promise<void> {
  await apiFetch(`/api/recipes/v2/${id}`, { method: 'DELETE' }, accessToken);
}

/**
 * Publish a recipe.
 */
export async function publishRecipe(id: string, accessToken: string): Promise<void> {
  await apiFetch(`/api/recipes/v2/${id}/publish`, { method: 'POST' }, accessToken);
}

// ============================================================================
// AI INSIGHTS
// ============================================================================

/**
 * Get AI insights for a recipe (auto-generates if not cached).
 */
export async function getRecipeInsights(
  recipeId: string,
  language: RecipeLanguage,
  accessToken: string
): Promise<RecipeInsightResponse> {
  const raw = await apiFetch<unknown>(
    `/api/recipes/v2/${recipeId}/insights/${language}`,
    {},
    accessToken
  );
  return RecipeInsightResponseSchema.parse(raw);
}

/**
 * Force-regenerate AI insights.
 */
export async function regenerateRecipeInsights(
  recipeId: string,
  language: RecipeLanguage,
  accessToken: string
): Promise<RecipeInsightResponse> {
  const raw = await apiFetch<unknown>(
    `/api/recipes/v2/${recipeId}/insights/${language}/refresh`,
    { method: 'POST' },
    accessToken
  );
  return RecipeInsightResponseSchema.parse(raw);
}

// ============================================================================
// CONVERTER: DTO → Frontend Recipe
// ============================================================================

export function convertRecipeDTOToFrontend(dto: RecipeDTO): Recipe {
  const translations = new Map<RecipeLanguage, { name: string; instructions: string }>();
  if (dto.translations && Array.isArray(dto.translations)) {
    for (const t of dto.translations) {
      if (t && typeof t === 'object' && 'language' in t) {
        translations.set(t.language as RecipeLanguage, {
          name: (t as { name: string }).name || '',
          instructions: (t as { instructions: string }).instructions || '',
        });
      }
    }
  }

  return {
    id: dto.id,
    name: dto.name,
    instructions: dto.instructions,
    language: dto.language as RecipeLanguage,
    servings: dto.servings,
    status: dto.status as RecipeStatus,
    ingredients: (dto.ingredients || []).map(ing => ({
      id: ing.catalog_ingredient_id,
      name: ing.catalog_ingredient_name || '',
      quantity: ing.quantity,
      unit: ing.unit,
    })),
    translations,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    imageUrl: dto.image_url || undefined,
    cost: dto.cost || 0,
    margin: undefined,
    prepTime: 30,
    difficulty: 'medium',
  };
}
