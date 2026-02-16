import { Clock, Thermometer, Zap, ClipboardList, Target } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecipeInsightStep {
  step_number: number;
  action: string;
  description: string;
  duration_minutes: number | null;
  temperature: string | null;
  technique: string | null;
  ingredients_used: string[];
}

interface TechnologyCardProps {
  steps: RecipeInsightStep[];
}

export function TechnologyCard({ steps }: TechnologyCardProps) {
  const totalDuration = steps.reduce((sum, step) => sum + (step.duration_minutes || 0), 0);

  return (
    <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-wider text-white">Technology Card</h3>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Step-by-step production flow</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-white/5 border border-white/5 rounded-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-500" />
            <div>
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total Time</div>
              <div className="text-lg font-black italic text-white">{totalDuration} <span className="text-xs uppercase font-bold text-zinc-500 not-italic ml-1">min</span></div>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Steps</div>
              <div className="text-lg font-black italic text-white">{steps.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-16 text-[10px] font-black uppercase tracking-widest text-zinc-500">№</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Action / Tech Process</TableHead>
              <TableHead className="w-28 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">Conditions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step) => (
              <TableRow key={step.step_number} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="align-top py-6">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    {step.step_number}
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="space-y-2">
                    <h4 className="font-black italic uppercase tracking-wider text-white group-hover:text-indigo-400 transition-colors">
                      {step.action}
                    </h4>
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xl">
                      {step.description}
                    </p>
                    {step.ingredients_used && step.ingredients_used.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {step.ingredients_used.map((ing, i) => (
                          <Badge key={i} variant="outline" className="bg-white/5 text-[10px] font-black uppercase tracking-widest py-1 border-white/10">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right py-6 align-top">
                  <div className="space-y-3">
                    {step.duration_minutes && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-white italic">{step.duration_minutes}m</span>
                        <Clock className="h-3 w-3 text-zinc-600" />
                      </div>
                    )}
                    {step.temperature && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-orange-400 italic">{step.temperature}</span>
                        <Thermometer className="h-3 w-3 text-zinc-600" />
                      </div>
                    )}
                    {step.technique && (
                      <div className="flex items-center justify-end">
                        <Badge className="bg-white/5 text-[9px] font-black uppercase tracking-[0.15em] py-0.5 border-white/5 text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                          {step.technique}
                        </Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

