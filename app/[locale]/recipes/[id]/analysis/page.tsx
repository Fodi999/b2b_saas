'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle, Scale, Target, Zap, Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getRecipeInsights, RecipeInsightResponse } from '@/lib/api/recipes';

// Import AI Insights Components
import { FeasibilityScore } from '@/components/recipes/feasibility-score';
import { CriticalErrorsBlock } from '@/components/recipes/critical-errors-block';
import { WarningsBlock } from '@/components/recipes/warnings-block';
import { TechnologyCard } from '@/components/recipes/technology-card';
import { RecommendationsBlock } from '@/components/recipes/recommendations-block';
import { BusinessMetrics } from '@/components/recipes/business-metrics';
import { generateRecommendations } from '@/lib/utils/recipe-recommendations';

export default function RecipeAnalysisPage() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const recipeId = params.id as string;

  const [insights, setInsights] = useState<RecipeInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push(`/${locale}/login`);
      return;
    }

    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInsights = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {      const response = await getRecipeInsights(recipeId, locale as any, accessToken);
      setInsights(response);
      setError(null);
    } catch (err: any) {      setError(err.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            Загрузка AI анализа...
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Это может занять несколько секунд
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !insights) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center border-4 border-red-100 dark:border-red-900/50">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Ошибка загрузки
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error || 'Не удалось загрузить AI анализ'}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/recipes/${recipeId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к рецепту
            </Button>
            <Button onClick={fetchInsights}>
              Попробовать снова
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { insights: data } = insights;

  // Get dish type from insights
  const dishType = data.dish_type || 'основное';

  // Generate smart recommendations (frontend rule-based)
  const recommendations = generateRecommendations(dishType);

  // Calculate business metrics (mock for now, will be real when backend provides)
  const totalCost = 0; // TODO: Calculate from ingredients
  const estimatedPrice = 0; // TODO: Get from form or calculate
  const marginPercent = estimatedPrice > 0 ? ((estimatedPrice - totalCost) / estimatedPrice) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/recipes/${recipeId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к рецепту
          </Button>

          {/* Page Header */}
          <div className="rounded-[2rem] border-none bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 rotate-12">
               <Zap className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30 text-white">
                 <Sparkles className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                  AI Анализ Рецепта
                </h1>
                <p className="mt-1 text-indigo-100 font-medium opacity-80">
                  {dishType.charAt(0).toUpperCase() + dishType.slice(1)} • {insights.generation_time_ms}ms processing
                </p>
              </div>
            </div>
          </div>

          {/* Feasibility Score */}
          <FeasibilityScore score={data.feasibility_score} dishType={dishType} />

          {/* Critical Errors */}
          {data.validation.errors.length > 0 && (
            <CriticalErrorsBlock
              errors={data.validation.errors}
              onFixError={(errorCode) => {                // TODO: Redirect to edit mode
                router.push(`/${locale}/recipes/${recipeId}/edit`);
              }}
            />
          )}

          {/* Warnings */}
          {data.validation.warnings.length > 0 && (
            <WarningsBlock
              warnings={data.validation.warnings}
              onAutoFix={(warningCode) => {                // TODO: Implement auto-fix logic
              }}
            />
          )}

          {/* Technology Card (Steps) */}
          {data.steps.length > 0 && (
            <TechnologyCard steps={data.steps} />
          )}

          {/* Recommendations */}
          <RecommendationsBlock recommendations={recommendations} />

          {/* Business Metrics */}
          <BusinessMetrics
            cost={totalCost}
            margin={marginPercent}
            haccp_risk={data.validation.errors.some(e => e.severity === 'error') ? 'high' : 'low'}
            complexity={data.steps.length > 10 ? 5 : Math.ceil(data.steps.length / 2)}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/recipes/${recipeId}`)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к рецепту
            </Button>
            <Button
              onClick={fetchInsights}
              className="flex-1"
            >
              Обновить анализ
            </Button>
          </div>

          {/* Info Note */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Что это:</strong> AI анализирует рецепт с помощью Groq (LLM), 
              проверяет технологию приготовления, безопасность HACCP и дает персонализированные рекомендации. 
              Каждый анализ стоит денег, поэтому запускайте его только когда нужно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
