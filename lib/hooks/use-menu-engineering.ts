import { useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { 
  getMenuEngineeringAnalysis, 
  type MenuEngineeringAnalysisResponse 
} from '@/lib/api/menu-engineering';
import { RecipeLanguage } from '@/lib/api/recipes';
import { ApiError } from '@/lib/api/client';

interface UseMenuEngineeringResult {
  analysis: MenuEngineeringAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalysis: (periodDays?: number, language?: RecipeLanguage) => Promise<void>;
  reset: () => void;
}

/**
 * Hook для получения экономического анализа меню (Menu Engineering)
 */
export function useMenuEngineering(): UseMenuEngineeringResult {
  const { accessToken, refreshAccessToken } = useAuthStore();
  const [analysis, setAnalysis] = useState<MenuEngineeringAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (periodDays: number = 30, language?: RecipeLanguage) => {
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {      
      const response = await getMenuEngineeringAnalysis(accessToken, { 
        period_days: periodDays, 
        language 
      });      setAnalysis(response);
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      // 401: Token expired retry logic
      if (err instanceof ApiError && err.status === 401) {        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          const newToken = useAuthStore.getState().accessToken;
          if (newToken) {
            try {
              const response = await getMenuEngineeringAnalysis(newToken, { 
                period_days: periodDays, 
                language 
              });
              setAnalysis(response);
              return;
            } catch (retryErr: unknown) {
              setError((retryErr as Error).message || 'Error after token refresh');
            }
          }
        } else {
          setError('Authentication expired');
        }
      } else {
        setError(error.message || 'Failed to fetch menu engineering analysis');
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, refreshAccessToken]);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { analysis, isLoading, error, fetchAnalysis, reset };
}
