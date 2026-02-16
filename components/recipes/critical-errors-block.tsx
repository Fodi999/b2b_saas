import { XCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface CriticalErrorsBlockProps {
  errors: ValidationError[];
  onFixError?: (errorCode: string) => void;
}

const ERROR_EXPLANATIONS: Record<string, string> = {
  'MISSING_INGREDIENTS': 'Necessary ingredients are missing from the recipe. Production is impossible without them.',
  'RAW_MEAT_DANGER': 'Raw meat poses a health hazard. Thermal processing to at least 75°C internal temperature is required.',
  'NO_TEMPERATURE': 'Missing temperature may lead to improper cooking and safety violations.',
  'IMPOSSIBLE_LOGIC': 'Recipe logic is flawed. Combination of ingredients or actions contradicts culinary principles.',
  'SHORT_INSTRUCTIONS': 'Instructions are too brief and lack sufficient detail for correct preparation.',
};

export function CriticalErrorsBlock({ errors, onFixError }: CriticalErrorsBlockProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <ShieldAlert className="h-32 w-32 text-rose-500" />
      </div>

      <div className="flex items-center gap-4 relative">
        <div className="h-12 w-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
          <XCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-wider text-white">Critical Errors</h3>
          <p className="text-rose-400/60 text-xs font-bold uppercase tracking-widest">{errors.length} issues detected</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        {errors.map((error, index) => (
          <div 
            key={index} 
            className="group bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all hover:border-rose-500/30"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                    {error.code}
                  </span>
                  {error.severity === 'error' && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                      Blocker
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black italic uppercase tracking-tight text-white group-hover:text-rose-400 transition-colors">
                  {error.message}
                </h4>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-2xl">
                  {ERROR_EXPLANATIONS[error.code] || 'Comprehensive AI analysis suggests correcting this parameter to ensure safety and quality.'}
                </p>
              </div>
              
              {onFixError && (
                <Button
                  onClick={() => onFixError(error.code)}
                  className="bg-white text-black hover:bg-zinc-200 rounded-2xl h-12 px-6 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 grow-0 shrink-0"
                >
                  Fix Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

