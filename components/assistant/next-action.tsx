import { LightbulbIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';

export function NextAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <Card className="border-none bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group cursor-pointer h-full">
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
          <div className="space-y-2 flex-1">
            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
              {title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {description}
            </p>
          </div>
          {href && (
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }
  return content;
}
