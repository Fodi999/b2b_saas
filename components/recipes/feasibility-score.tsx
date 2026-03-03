import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeasibilityScoreProps {
  score: number;
  dishType?: string;
}

export function FeasibilityScore({ score, dishType }: FeasibilityScoreProps) {
  const getScoreStatus = (score: number) => {
    if (score >= 80) {
      return {
        label: 'READY FOR MARKET',
        icon: TrendingUp,
        color: 'text-emerald-400',
        glowColor: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        progressColor: 'bg-emerald-500',
        description: 'Recipe meets all quality and safety standards for high-scale production.'
      };
    } else if (score >= 60) {
      return {
        label: 'NEEDS REFINEMENT',
        icon: AlertTriangle,
        color: 'text-amber-400',
        glowColor: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        progressColor: 'bg-amber-500',
        description: 'Improvements needed in preparation or costing before launch.'
      };
    } else {
      return {
        label: 'CRITICAL ISSUES',
        icon: TrendingDown,
        color: 'text-rose-400',
        glowColor: 'shadow-[0_0_20px_rgba(251,113,133,0.3)]',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/20',
        progressColor: 'bg-rose-500',
        description: 'Recipe has fundamental problems and requires a complete overhaul.'
      };
    }
  };

  const status = getScoreStatus(score);
  const Icon = status.icon;

  return (
    <div className={cn(
      "relative overflow-hidden bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-8",
      status.glowColor
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Target className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Feasibility Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black italic tracking-tighter text-white">{score}</span>
            <span className="text-xl font-bold text-zinc-600">/100</span>
          </div>
        </div>
        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center", status.bgColor)}>
          <Icon className={cn("h-8 w-8", status.color)} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000 ease-out rounded-full", status.progressColor)}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-white/5">
        <div className="group flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", status.progressColor)} />
          <span className={cn("text-xs font-black uppercase tracking-widest", status.color)}>
            {status.label}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Dish Concept</div>
            <div className="text-sm font-bold text-white uppercase italic">{dishType || '—'}</div>
          </div>
        </div>
      </div>
      
      <p className="text-sm font-medium text-zinc-400 leading-relaxed">
        {status.description}
      </p>
    </div>
  );
}
