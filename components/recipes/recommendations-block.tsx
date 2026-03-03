import React from 'react';
import { ChevronDown, ChevronUp, Sparkles, Shield, Zap, RefreshCw, Target } from 'lucide-react';
import { useState } from 'react';
import { RecipeInsightSuggestion } from '@/lib/api/recipes';
import { cn } from '@/lib/utils';

interface RecommendationsBlockProps {
  recommendations: RecipeInsightSuggestion[];
}

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; description: string; color: string; glow: string }> = {
  improvement: {
    icon: Sparkles,
    label: 'Taste Improvement',
    description: 'Recommendations for biological and sensory refinement',
    color: 'text-purple-400',
    glow: 'bg-purple-500/10'
  },
  safety: {
    icon: Shield,
    label: 'Food Safety',
    description: 'Critical measures to ensure production safety',
    color: 'text-rose-400',
    glow: 'bg-rose-500/10'
  },
  optimization: {
    icon: Zap,
    label: 'Efficiency',
    description: 'Ways to accelerate and simplify preparation',
    color: 'text-blue-400',
    glow: 'bg-blue-500/10'
  },
  substitution: {
    icon: RefreshCw,
    label: 'Substitutions',
    description: 'Alternative ingredients for better cost/quality',
    color: 'text-emerald-400',
    glow: 'bg-emerald-500/10'
  },
};

export function RecommendationsBlock({ recommendations }: RecommendationsBlockProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['improvement', 'safety'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.suggestion_type]) {
      acc[rec.suggestion_type] = [];
    }
    acc[rec.suggestion_type].push(rec);
    return acc;
  }, {} as Record<string, RecipeInsightSuggestion[]>);

  if (recommendations.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8">
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-zinc-600" />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-wider text-white">No Recommendations</h3>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">Recipe logic is optimized</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-wider text-white">AI Recommendations</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Powered by culinary intelligence</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(CATEGORY_CONFIG).map(([categoryKey, config]) => {
          const categoryRecs = groupedRecommendations[categoryKey] || [];
          if (categoryRecs.length === 0) return null;

          const isExpanded = expandedCategories.has(categoryKey);
          const Icon = config.icon;

          return (
            <div 
              key={categoryKey}
              className="group border border-white/5 bg-white/[0.02] rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.04]"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", config.glow)}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors">
                      {config.label}
                    </h4>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mt-1">
                      {categoryRecs.length} suggestions
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-zinc-500" />
                )}
              </button>

              {/* Suggestions List */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {categoryRecs.map((rec, idx) => (
                    <div 
                      key={idx}
                      className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3 transition-all hover:border-indigo-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-black italic uppercase tracking-tighter text-zinc-200">
                          {rec.title}
                        </h5>
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3 text-zinc-600" />
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                            Effect: {rec.impact}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
