import { LightbulbIcon } from 'lucide-react';

export function NextAction({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-950/50">
            <LightbulbIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
