'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FeasibilityScore } from '@/components/recipes/feasibility-score';
import { CriticalErrorsBlock } from '@/components/recipes/critical-errors-block';
import { WarningsBlock } from '@/components/recipes/warnings-block';
import { TechnologyCard } from '@/components/recipes/technology-card';
import { RecommendationsBlock } from '@/components/recipes/recommendations-block';
import { BusinessMetrics } from '@/components/recipes/business-metrics';
import {
  feasibilityTestCases,
  criticalErrorsTestCases,
  warningsTestCases,
  technologyCardTestData,
  recommendationsTestData,
  businessMetricsTestCases,
  testCallbacks
} from '@/lib/test-data/ai-insights-test-data';

export default function AIInsightsTestPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'feasibility' | 'errors' | 'warnings' | 'tech' | 'recommendations' | 'metrics'>('all');

  return (
    <div className="min-h-screen bg-background text-gray-900 dark:text-gray-100">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
          <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">AI Insights Components</h1>
          <p className="text-muted-foreground font-medium">Тестовая страница для демонстрации всех компонентов AI Insights V1.1</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'feasibility', 'errors', 'warnings', 'tech', 'recommendations', 'metrics'] as const).map(tabId => (
            <Button
              key={tabId}
              variant={activeTab === tabId ? 'default' : 'outline'}
              onClick={() => setActiveTab(tabId)}
              className="whitespace-nowrap rounded-xl px-6"
            >
              {tabId.charAt(0).toUpperCase() + tabId.slice(1)}
            </Button>
          ))}
        </div>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(activeTab === 'all' || activeTab === 'feasibility') && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-green-500 rounded-full" />
                <h2 className="text-2xl font-bold">🚦 Feasibility Score</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeasibilityScore score={feasibilityTestCases.excellent.score} dishType={feasibilityTestCases.excellent.dishType} />
                <FeasibilityScore score={feasibilityTestCases.good.score} dishType={feasibilityTestCases.good.dishType} />
                <FeasibilityScore score={feasibilityTestCases.poor.score} dishType={feasibilityTestCases.poor.dishType} />
              </div>
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'errors') && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-red-500 rounded-full" />
                <h2 className="text-2xl font-bold">🔴 Critical Errors</h2>
              </div>
              <CriticalErrorsBlock errors={criticalErrorsTestCases.errors} onFixError={testCallbacks.onFixError} />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'warnings') && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-yellow-500 rounded-full" />
                <h2 className="text-2xl font-bold">🟡 Warnings</h2>
              </div>
              <WarningsBlock warnings={warningsTestCases.warnings} onAutoFix={testCallbacks.onAutoFix} />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'tech') && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                <h2 className="text-2xl font-bold">📋 Technology Card</h2>
              </div>
              <TechnologyCard steps={technologyCardTestData} />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'recommendations') && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                <h2 className="text-2xl font-bold">💡 AI Recommendations</h2>
              </div>
              <RecommendationsBlock recommendations={recommendationsTestData} />
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'metrics') && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-purple-500 rounded-full" />
                <h2 className="text-2xl font-bold">📊 Business Metrics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BusinessMetrics {...businessMetricsTestCases.profitable} />
                <BusinessMetrics {...businessMetricsTestCases.marginal} />
                <BusinessMetrics {...businessMetricsTestCases.complex} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
