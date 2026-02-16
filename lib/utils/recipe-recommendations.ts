import { RecipeInsightSuggestion } from '../api/recipes';

/**
 * AI Recommendations Types and Mock Data
 * 
 * Используется для отображения AI рекомендаций до того момента,
 * пока backend не начнёт их возвращать в AI Insights API
 */

/**
 * Базовые рекомендации, которые показываются для всех рецептов
 */
export const DEFAULT_RECOMMENDATIONS: RecipeInsightSuggestion[] = [
  {
    suggestion_type: 'improvement',
    title: 'Стабилизация вкуса',
    description: 'Дайте блюду "отдохнуть" 5 минут перед подачей для стабилизации вкуса',
    impact: 'high',
    confidence: 0.95
  },
  {
    suggestion_type: 'safety',
    title: 'Температурный режим',
    description: 'Храните готовое блюдо при температуре не выше 5°C',
    impact: 'high',
    confidence: 0.99
  },
  {
    suggestion_type: 'safety',
    title: 'Перекрестное загрязнение',
    description: 'Используйте отдельные доски для разделки мяса и овощей',
    impact: 'high',
    confidence: 0.99
  },
  {
    suggestion_type: 'optimization',
    title: 'Организация процесса',
    description: 'Подготовьте все ингредиенты заранее (mise en place) для экономии времени',
    impact: 'medium',
    confidence: 0.85
  }
];

/**
 * Рекомендации для рецептов с мясом
 */
export const MEAT_RECOMMENDATIONS: RecipeInsightSuggestion[] = [
  {
    suggestion_type: 'safety',
    title: 'Контроль готовности',
    description: 'Обязательно используйте пищевой термометр для контроля внутренней температуры',
    impact: 'high',
    confidence: 0.98
  },
  {
    suggestion_type: 'safety',
    title: 'Разморозка',
    description: 'Не размораживайте мясо при комнатной температуре - только в холодильнике',
    impact: 'high',
    confidence: 0.95
  },
  {
    suggestion_type: 'improvement',
    title: 'Маринование',
    description: 'Маринуйте мясо минимум 2 часа для улучшения текстуры и вкуса',
    impact: 'medium',
    confidence: 0.9
  }
];

/**
 * Рекомендации для десертов
 */
export const DESSERT_RECOMMENDATIONS: RecipeInsightSuggestion[] = [
  {
    suggestion_type: 'improvement',
    title: 'Температура ингредиентов',
    description: 'Используйте ингредиенты комнатной температуры для более однородной текстуры',
    impact: 'medium',
    confidence: 0.88
  },
  {
    suggestion_type: 'optimization',
    title: 'Точность взвешивания',
    description: 'Заранее отмерьте все ингредиенты - при выпечке точность критична',
    impact: 'high',
    confidence: 0.95
  }
];

/**
 * Рекомендации для супов
 */
export const SOUP_RECOMMENDATIONS: RecipeInsightSuggestion[] = [
  {
    suggestion_type: 'improvement',
    title: 'Баланс вкуса',
    description: 'Добавьте соль и специи в конце приготовления для контроля насыщенности вкуса',
    impact: 'medium',
    confidence: 0.85
  },
  {
    suggestion_type: 'optimization',
    title: 'Скорость приготовления',
    description: 'Используйте скороварку для сокращения времени варки бульона на 60%',
    impact: 'medium',
    confidence: 0.8
  }
];

/**
 * Генерирует рекомендации на основе типа блюда
 */
export function generateRecommendations(dishType?: string): RecipeInsightSuggestion[] {
  const recommendations = [...DEFAULT_RECOMMENDATIONS];

  if (!dishType) {
    return recommendations;
  }

  const lowerType = dishType.toLowerCase();

  if (lowerType.includes('meat') || lowerType.includes('мясо') || lowerType.includes('chicken') || lowerType.includes('beef')) {
    recommendations.push(...MEAT_RECOMMENDATIONS);
  }

  if (lowerType.includes('dessert') || lowerType.includes('десерт') || lowerType.includes('cake') || lowerType.includes('торт')) {
    recommendations.push(...DESSERT_RECOMMENDATIONS);
  }

  if (lowerType.includes('soup') || lowerType.includes('суп') || lowerType.includes('broth') || lowerType.includes('бульон')) {
    recommendations.push(...SOUP_RECOMMENDATIONS);
  }

  return recommendations;
}

