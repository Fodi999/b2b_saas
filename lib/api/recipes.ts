import { apiFetch } from './client';

// ============================================================================
// TYPES - Recipe V2 API
// ============================================================================

export type RecipeLanguage = 'ru' | 'en' | 'pl' | 'uk';
export type RecipeStatus = 'draft' | 'published';

export interface RecipeIngredientDTO {
  ingredient_id?: string; // Прямая ссылка из V2 Docs
  catalog_ingredient_id: string; // Поле для совместимости
  quantity: number;
  unit: string; // 'kilogram', 'liter', 'piece'
}

export interface RecipeTranslationDTO {
  id: string;
  recipe_id: string;
  language: RecipeLanguage;
  name: string;
  instructions: string;
  translated_at: string;
  translated_by: string; // 'deepl' | 'google' | 'manual'
}

export interface RecipeDTO {
  id: string;
  tenant_id: string;
  name: string;
  instructions: string;
  language: RecipeLanguage;
  servings: number;
  status: RecipeStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  ingredients: RecipeIngredientDTO[];
  translations?: RecipeTranslationDTO[];
  
  // Поля из новой спецификации V2 (локализованные)
  name_en?: string;
  name_ru?: string;
  name_pl?: string;
  name_uk?: string;
  description_en?: string;
  description_ru?: string;
  instructions_en?: string;
  instructions_ru?: string;
}

export interface CreateRecipeRequest {
  name: string;
  instructions: string;
  language: RecipeLanguage;
  servings: number;
  ingredients: RecipeIngredientDTO[];
  
  // Новая спецификация позволяет передавать сразу несколько языков
  name_en?: string;
  name_ru?: string;
  name_pl?: string;
  name_uk?: string;
  description_en?: string;
  description_ru?: string;
  instructions_en?: string;
  instructions_ru?: string;
}

export interface UpdateRecipeRequest {
  name?: string;
  instructions?: string;
  servings?: number;
  ingredients?: RecipeIngredientDTO[];
  status?: RecipeStatus;
}

export interface RecipeListResponse {
  recipes: RecipeDTO[];
  total: number;
  page?: number;     // Сделали опциональными для совместимости с limit/offset
  per_page?: number;
  limit?: number;
  offset?: number;
}

// Frontend display types
export interface Recipe {
  id: string;
  name: string;
  instructions: string;
  language: RecipeLanguage;
  servings: number;
  status: RecipeStatus;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }>;
  translations: Map<RecipeLanguage, {
    name: string;
    instructions: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Создать рецепт с автоматическими переводами
 */
export async function createRecipe(data: CreateRecipeRequest, accessToken: string): Promise<RecipeDTO> {
  console.log('📝 [RECIPES API] Создание рецепта:', data);
  
  // Мапим ингредиенты для совместимости с V2 Docs (обеспечиваем ingredient_id)
  const mappedData = {
    ...data,
    ingredients: data.ingredients.map(ing => ({
      ...ing,
      ingredient_id: ing.ingredient_id || ing.catalog_ingredient_id
    }))
  };

  const response = await apiFetch<RecipeDTO>('/api/recipes/v2', {
    method: 'POST',
    body: JSON.stringify(mappedData),
  }, accessToken);

  if (!response) {
    throw new Error('Failed to create recipe: empty response');
  }

  console.log('✅ [RECIPES API] Рецепт создан:', response);
  return response as RecipeDTO;
}

/**
 * Получить список рецептов с пагинацией
 */
export async function getRecipes(
  accessToken: string,
  params?: {
    page?: number;     // Мапится в offset
    per_page?: number; // Мапится в limit
    status?: RecipeStatus;
    language?: RecipeLanguage;
    search?: string;
  }
): Promise<RecipeListResponse> {
  const queryParams = new URLSearchParams();
  
  // Документация V2 требует limit/offset, но мы поддержим оба варианта
  const limit = params?.per_page || 50;
  const page = params?.page || 1;
  const offset = (page - 1) * limit;

  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  
  // Сохраняем поддержку page/per_page если бэкенд все еще их использует
  queryParams.append('page', page.toString());
  queryParams.append('per_page', limit.toString());

  if (params?.status) queryParams.append('status', params.status);
  if (params?.language) queryParams.append('language', params.language);
  if (params?.search) queryParams.append('search', params.search);

  // Добавляем ? в любом случае, так как у нас теперь всегда есть параметры
  const url = `/api/recipes/v2?${queryParams.toString()}`;
  
  console.log('🔍 [RECIPES API] Загрузка списка рецептов:', { url, params });
  
  const response = await apiFetch<RecipeListResponse>(url, {}, accessToken);
  
  if (!response) {
    throw new Error('Failed to fetch recipes: empty response');
  }
  
  // Безопасный доступ к массиву рецептов (на случай DATABASE_ERROR возвращающего null в некоторых полях)
  const recipes = response.recipes || [];
  
  console.log('✅ [RECIPES API] Рецепты загружены:', { 
    count: recipes.length, 
    total: response.total 
  });
  
  return {
    ...response,
    recipes // Гарантируем наличие массива
  } as RecipeListResponse;
}

/**
 * Получить один рецепт по ID с переводами
 */
export async function getRecipe(id: string, accessToken: string, language?: RecipeLanguage): Promise<RecipeDTO> {
  const url = language 
    ? `/api/recipes/v2/${id}?language=${language}`
    : `/api/recipes/v2/${id}`;
  
  console.log('🔍 [RECIPES API] Загрузка рецепта:', { id, language });
  
  const response = await apiFetch<RecipeDTO>(url, {}, accessToken);
  
  if (!response) {
    throw new Error(`Failed to fetch recipe ${id}: empty response`);
  }
  
  console.log('✅ [RECIPES API] Рецепт загружен:', response);
  return response as RecipeDTO;
}

/**
 * Обновить рецепт
 */
export async function updateRecipe(id: string, data: UpdateRecipeRequest, accessToken: string): Promise<RecipeDTO> {
  console.log('[RECIPES API] Обновление рецепта:', { id, data });
  return (await apiFetch(`/api/recipes/v2/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, accessToken)) as RecipeDTO;
}

/**
 * Удалить рецепт
 */
export async function deleteRecipe(id: string, accessToken: string): Promise<void> {
  console.log('[RECIPES API] Удаление рецепта:', { id });
  await apiFetch(`/api/recipes/v2/${id}`, {
    method: 'DELETE',
  }, accessToken);
}

// ============================================================================
// AI INSIGHTS
// ============================================================================

export interface RecipeInsightStep {
  step_number: number;
  action: string;
  description: string;
  duration_minutes: number | null;
  temperature: string | null;     // ✅ По документации строка: '100°C' или 'high heat'
  technique: string | null;       // ✅ boiling, frying, etc.
  ingredients_used: string[];     // ✅ IDs использованных продуктов
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
  dish_type: string;
  feasibility_score: number;
  steps: RecipeInsightStep[];
  validation: RecipeInsightValidation;
  suggestions: RecipeInsightSuggestion[];
  model: string;
}

export interface RecipeInsightResponse {
  insights: RecipeInsightDTO;
  generated_in_ms: number;
}

/**
 * Получить AI Insights для рецепта
 * Автоматически генерирует, если нет в кэше
 */
export async function getRecipeInsights(
  recipeId: string,
  language: RecipeLanguage,
  accessToken: string
): Promise<RecipeInsightResponse> {
  console.log('[RECIPES API] Получение AI Insights:', { recipeId, language });
  console.log('[DEBUG] Recipe ID:', recipeId);
  console.log('[DEBUG] Language:', language);
  console.log('[DEBUG] Has Token:', !!accessToken);
  console.log('[DEBUG] Full URL:', `/api/recipes/v2/${recipeId}/insights/${language}`);
  
  const response = await apiFetch<RecipeInsightResponse>(
    `/api/recipes/v2/${recipeId}/insights/${language}`,
    {},
    accessToken
  );

  if (!response) {
    throw new Error(`Failed to fetch insights for recipe ${recipeId}`);
  }

  console.log('[RECIPES API] AI Insights получены:', {
    score: response.insights.feasibility_score,
    steps: response.insights.steps.length,
    errors: response.insights.validation.errors.length,
    time: response.generated_in_ms
  });
  
  return response as RecipeInsightResponse;
}

/**
 * Пересоздать AI Insights (force regenerate)
 */
export async function regenerateRecipeInsights(
  recipeId: string,
  language: RecipeLanguage,
  accessToken: string
): Promise<RecipeInsightResponse> {
  console.log('[RECIPES API] Пересоздание AI Insights:', { recipeId, language });
  
  const response = await apiFetch<RecipeInsightResponse>(
    `/api/recipes/v2/${recipeId}/insights/${language}/regenerate`,
    {
      method: 'POST',
    },
    accessToken
  );

  if (!response) {
    throw new Error(`Failed to regenerate insights for recipe ${recipeId}`);
  }

  console.log('[RECIPES API] AI Insights пересозданы:', {
    score: response.insights.feasibility_score,
    time: response.generated_in_ms
  });
  
  return response as RecipeInsightResponse;
}

// ============================================================================
// CONVERTERS - DTO → Frontend
// ============================================================================

/**
 * Конвертировать RecipeDTO в Recipe для отображения
 */
export function convertRecipeDTOToFrontend(dto: RecipeDTO): Recipe {
  // Создаём карту переводов
  const translations = new Map<RecipeLanguage, { name: string; instructions: string }>();
  
  if (dto.translations) {
    dto.translations.forEach(t => {
      translations.set(t.language, {
        name: t.name,
        instructions: t.instructions,
      });
    });
  }

  return {
    id: dto.id,
    name: dto.name,
    instructions: dto.instructions,
    language: dto.language,
    servings: dto.servings,
    status: dto.status,
    ingredients: dto.ingredients.map(ing => ({
      id: ing.catalog_ingredient_id,
      name: '', // Имя будет загружено из каталога отдельно
      quantity: ing.quantity,
      unit: ing.unit,
    })),
    translations,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
