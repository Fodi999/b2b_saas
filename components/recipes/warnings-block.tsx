import { AlertTriangle, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValidationWarning {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface WarningsBlockProps {
  warnings: ValidationWarning[];
  onAutoFix?: (warningCode: string) => void;
}

const WARNING_TIPS: Record<string, string> = {
  'NO_TEMPERATURE': 'Indicating temperature helps improve preparation quality and safety.',
  'NO_TIME': 'Exact cooking time facilitates production planning.',
  'NO_EQUIPMENT': 'Equipment information is needed to verify technological capabilities.',
  'SHORT_INSTRUCTIONS': 'Detailed instructions reduce the risk of preparation errors.',
  'MISSING_ALLERGENS': 'Allergen information is mandatory for safety standards compliance.',
};

export function WarningsBlock({ warnings, onAutoFix }: WarningsBlockProps) {
  if (warnings.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-wider text-white">
              Нет предупреждений
            </h3>
            <p className="text-emerald-400/60 text-xs font-bold uppercase tracking-widest">
              Рецепт соответствует всем стандартам качества
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <AlertTriangle className="h-32 w-32 text-amber-500" />
      </div>

      <div className="flex items-center gap-4 relative">
        <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <AlertTriangle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-wider text-white">
            Производственные предупреждения
          </h3>
          <p className="text-amber-400/60 text-xs font-bold uppercase tracking-widest">
            Предложено оптимизаций: {warnings.length}
          </p>
        </div>
      </div>

      <div className="space-y-4 relative">
        {warnings.map((warning, index) => (
          <div 
            key={index} 
            className="group bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all hover:border-amber-500/30"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500 text-black font-bold">
                    {warning.code}
                  </span>
                </div>
                <h4 className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {warning.message}
                </h4>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-2xl">
                  {WARNING_TIPS[warning.code] || 'Искусственный интеллект рекомендует уточнить этот параметр для улучшения общего балла жизнеспособности.'}
                </p>
              </div>
              
              {onAutoFix && (
                <Button
                  onClick={() => onAutoFix(warning.code)}
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl h-12 px-6 font-black uppercase tracking-widest transition-all"
                >
                  <Zap className="mr-2 h-4 w-4 text-amber-400" />
                  Авто-исправление
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
