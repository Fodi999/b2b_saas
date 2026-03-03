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
      const recipe = await createRecipe(data, accessToken);      setCreatedRecipe(recipe);
      return recipe;
    } catch (err) {
      // Если ошибка 401 - пробуем обновить токен и повторить
      if (err instanceof ApiError && err.status === 401) {        
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {          
          // Получаем новый токен из store
          const newToken = useAuthStore.getState().accessToken;
          
          if (newToken) {
            try {
              const recipe = await createRecipe(data, newToken);              setCreatedRecipe(recipe);
              return recipe;
            } catch (retryErr) {
              const errorMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error';              setError(errorMessage);
              return null;
            }
          }
        } else {          setError('Authentication expired. Please login again.');
          return null;
        }
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';      setError(errorMessage);
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
      const recipe = await updateRecipe(id, data, accessToken);      return recipe;
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
