import { LightbulbIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function NextAction({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-none bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
        <LightbulbIcon className="h-16 w-16 text-indigo-500" />
      </div>
      
      <CardContent className="p-8">
        <div className="flex gap-6 items-start relative z-10">
          <div className="flex-shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
              <LightbulbIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
              {title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
