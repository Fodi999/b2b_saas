import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { 
  getRecipeInsights, 
  regenerateRecipeInsights,
  type RecipeInsightResponse,
  type RecipeLanguage 
} from '@/lib/api/recipes';
import { ApiError } from '@/lib/api/client';

interface UseRecipeInsightsResult {
  insights: RecipeInsightResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchInsights: (recipeId: string, language: RecipeLanguage) => Promise<void>;
  regenerate: (recipeId: string, language: RecipeLanguage) => Promise<void>;
  reset: () => void;
}

/**
 * Hook для получения AI Insights рецепта с автоматическим обновлением токена
 */
export function useRecipeInsights(): UseRecipeInsightsResult {
  const { accessToken, refreshAccessToken } = useAuthStore();
  const [insights, setInsights] = useState<RecipeInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (recipeId: string, language: RecipeLanguage) => {    
    if (!accessToken) {      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {      
      const response = await getRecipeInsights(recipeId, language, accessToken);      
      setInsights(response);
    } catch (err) {
      // Если ошибка 401 - пробуем обновить токен и повторить
      if (err instanceof ApiError && err.status === 401) {        
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {          
          const newToken = useAuthStore.getState().accessToken;
          
          if (newToken) {
            try {
              const response = await getRecipeInsights(recipeId, language, newToken);              setInsights(response);
              setIsLoading(false);
              return;
            } catch (retryErr) {
              const errorMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error';              setError(errorMessage);
            }
          }
        } else {          setError('Authentication expired. Please login again.');
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const regenerate = async (recipeId: string, language: RecipeLanguage) => {
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {      
      const response = await regenerateRecipeInsights(recipeId, language, accessToken);      
      setInsights(response);
    } catch (err) {
      // Обработка 401 для regenerate
      if (err instanceof ApiError && err.status === 401) {
        
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          const newToken = useAuthStore.getState().accessToken;
          
          if (newToken) {
            try {
              const response = await regenerateRecipeInsights(recipeId, language, newToken);              setInsights(response);
              setIsLoading(false);
              return;
            } catch (retryErr) {
              const errorMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error';              setError(errorMessage);
            }
          }
        } else {
          setError('Authentication expired. Please login again.');
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInsights(null);
    setError(null);
  };

  return {
    insights,
    isLoading,
    error,
    fetchInsights,
    regenerate,
    reset,
  };
}
