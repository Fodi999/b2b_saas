import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { createRecipe, updateRecipe, type CreateRecipeRequest, type UpdateRecipeRequest, type RecipeDTO } from '@/lib/api/recipes';
import { ApiError } from '@/lib/api/client';

interface UseRecipeCreateResult {
  isCreating: boolean;
  error: string | null;
  createdRecipe: RecipeDTO | null;
  create: (data: CreateRecipeRequest) => Promise<RecipeDTO | null>;
  update: (id: string, data: UpdateRecipeRequest) => Promise<RecipeDTO | null>;
  reset: () => void;
}

/**
 * Hook для создания и обновления рецепта с автоматическими переводами и обновлением токена
 */
export function useRecipeCreate(): UseRecipeCreateResult {
  const { accessToken, refreshAccessToken } = useAuthStore();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRecipe, setCreatedRecipe] = useState<RecipeDTO | null>(null);

  const create = async (data: CreateRecipeRequest): Promise<RecipeDTO | null> => {
    if (!accessToken) {
      setError('Not authenticated');
      return null;
    }

    setIsCreating(true);
    setError(null);
    setCreatedRecipe(null);

    try {
      console.log('🔄 [USE_RECIPE_CREATE] Starting recipe creation...', data);
      
      const recipe = await createRecipe(data, accessToken);
      
      console.log('✅ [USE_RECIPE_CREATE] Recipe created successfully:', recipe);
      setCreatedRecipe(recipe);
      return recipe;
    } catch (err) {
      // Если ошибка 401 - пробуем обновить токен и повторить
      if (err instanceof ApiError && err.status === 401) {
        console.log('🔄 [USE_RECIPE_CREATE] Token expired, refreshing...');
        
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          console.log('✅ [USE_RECIPE_CREATE] Token refreshed, retrying...');
          
          // Получаем новый токен из store
          const newToken = useAuthStore.getState().accessToken;
          
          if (newToken) {
            try {
              const recipe = await createRecipe(data, newToken);
              console.log('✅ [USE_RECIPE_CREATE] Recipe created after token refresh:', recipe);
              setCreatedRecipe(recipe);
              return recipe;
            } catch (retryErr) {
              const errorMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error';
              console.error('❌ [USE_RECIPE_CREATE] Failed after token refresh:', errorMessage);
              setError(errorMessage);
              return null;
            }
          }
        } else {
          console.error('❌ [USE_RECIPE_CREATE] Token refresh failed');
          setError('Authentication expired. Please login again.');
          return null;
        }
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [USE_RECIPE_CREATE] Failed to create recipe:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const update = async (id: string, data: UpdateRecipeRequest): Promise<RecipeDTO | null> => {
    if (!accessToken) {
      setError('Not authenticated');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      console.log('🔄 [USE_RECIPE_CREATE] Starting recipe update...', { id, data });
      
      const recipe = await updateRecipe(id, data, accessToken);
      
      console.log('✅ [USE_RECIPE_CREATE] Recipe updated successfully:', recipe);
      return recipe;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const newToken = useAuthStore.getState().accessToken;
          if (newToken) {
            try {
              const recipe = await updateRecipe(id, data, newToken);
              return recipe;
            } catch (retryErr) {
              setError(retryErr instanceof Error ? retryErr.message : 'Unknown error');
              return null;
            }
          }
        }
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const reset = () => {
    setError(null);
    setCreatedRecipe(null);
  };

  return {
    isCreating,
    error,
    createdRecipe,
    create,
    update,
    reset,
  };
}
