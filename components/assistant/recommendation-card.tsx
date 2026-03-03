import { Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export function RecommendationCard({
  priority,
  title,
  description,
  action,
  expectedImpact,
  href,
}: {
  priority: number;
  title: string;
  description: string;
  action: string;
  expectedImpact: string;
  href?: string;
}) {
  return (
    <Card className="border-none bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-20"><Zap className="h-32 w-32" /></div>
      <CardHeader className="flex flex-row items-start justify-between p-8 pb-4 relative z-10">
        <div className="space-y-3">
          <Badge className="bg-indigo-600 text-white border-none text-[10px] h-6 px-3 font-black uppercase tracking-widest rounded-full">
            PRIORITY #{priority}
          </Badge>
          <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
            {title}
          </CardTitle>
        </div>
        <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white">
          <Zap className="h-8 w-8" />
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-0 space-y-8 relative z-10">
        <p className="text-slate-300 leading-relaxed text-sm font-medium max-w-2xl">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-stretch sm:items-center justify-between border-t border-white/10 pt-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-0.5">ESTIMATED IMPACT</p>
              <p className="text-2xl font-black text-emerald-400 italic leading-none">
                {expectedImpact}
              </p>
            </div>
          </div>
          
          <Button className="h-16 px-10 bg-white text-slate-900 hover:bg-slate-200 rounded-[1.5rem] gap-3 font-black uppercase text-[12px] tracking-widest shadow-xl transition-all active:scale-95 group" asChild={!!href}>
            {href ? (
              <Link href={href}>
                {action}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                {action}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
