import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecommendationCard({
  priority,
  title,
  description,
  action,
  expectedImpact,
}: {
  priority: number;
  title: string;
  description: string;
  action: string;
  expectedImpact: string;
}) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 dark:border-indigo-900 dark:from-indigo-950/30 dark:to-gray-900">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            ПРИОРИТЕТ #{priority}
          </span>
          <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>

      <p className="text-gray-600 dark:text-gray-400">{description}</p>

      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ожидаемый эффект:
          </p>
          <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
            {expectedImpact}
          </p>
        </div>

        <Button className="w-full gap-2">
          {action}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
