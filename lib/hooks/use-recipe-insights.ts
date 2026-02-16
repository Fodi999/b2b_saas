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
    console.log('🚀 [USE_RECIPE_INSIGHTS] fetchInsights вызван!', { recipeId, language, hasToken: !!accessToken });
    
    if (!accessToken) {
      console.error('❌ [USE_RECIPE_INSIGHTS] Нет токена авторизации!');
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[USE_RECIPE_INSIGHTS] Загрузка AI Insights...', { recipeId, language });
      
      const response = await getRecipeInsights(recipeId, language, accessToken);
      
      console.log('[USE_RECIPE_INSIGHTS] AI Insights загружены:', {
        score: response.insights.feasibility_score,
        errors: response.insights.validation.errors.length,
      });
      
      setInsights(response);
    } catch (err) {
      // Если ошибка 401 - пробуем обновить токен и повторить
      if (err instanceof ApiError && err.status === 401) {
        console.log('[USE_RECIPE_INSIGHTS] Token expired, refreshing...');
        
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          console.log('[USE_RECIPE_INSIGHTS] Token refreshed, retrying...');
          
          const newToken = useAuthStore.getState().accessToken;
          
          if (newToken) {
            try {
              const response = await getRecipeInsights(recipeId, language, newToken);
              console.log('[USE_RECIPE_INSIGHTS] AI Insights loaded after token refresh');
              setInsights(response);
              setIsLoading(false);
              return;
            } catch (retryErr) {
              const errorMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error';
              console.error('[USE_RECIPE_INSIGHTS] Failed after token refresh:', errorMessage);
              setError(errorMessage);
            }
          }
        } else {
          console.error('[USE_RECIPE_INSIGHTS] Token refresh failed');
          setError('Authentication expired. Please login again.');
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[USE_RECIPE_INSIGHTS] Ошибка загрузки:', errorMessage);
        setError(errorMessage);
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
      console.log('[USE_RECIPE_INSIGHTS] Пересоздание AI Insights...', { recipeId, language });
      
      const response = await regenerateRecipeInsights(recipeId, language, accessToken);
      
      console.log('[USE_RECIPE_INSIGHTS] AI Insights пересозданы:', {
        score: response.insights.feasibility_score,
      });
      
      setInsights(response);
    } catch (err) {
      // Обработка 401 для regenerate
      if (err instanceof ApiError && err.status === 401) {
        console.log('[USE_RECIPE_INSIGHTS] Token expired (regenerate), refreshing...');
        
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          const newToken = useAuthStore.getState().accessToken;
          
          if (newToken) {
            try {
              const response = await regenerateRecipeInsights(recipeId, language, newToken);
              console.log('[USE_RECIPE_INSIGHTS] Regenerated after token refresh');
              setInsights(response);
              setIsLoading(false);
              return;
            } catch (retryErr) {
              const errorMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error';
              console.error('[USE_RECIPE_INSIGHTS] Failed regenerate after token refresh:', errorMessage);
              setError(errorMessage);
            }
          }
        } else {
          setError('Authentication expired. Please login again.');
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[USE_RECIPE_INSIGHTS] Ошибка пересоздания:', errorMessage);
        setError(errorMessage);
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
