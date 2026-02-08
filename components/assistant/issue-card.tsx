import { AlertCircle, AlertTriangle, TrendingDown } from 'lucide-react';

type IssueType = 'margin' | 'expiry' | 'menu';
type Impact = 'high' | 'medium' | 'low';

const impactStyles = {
  high: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900',
    bg: 'bg-red-50 dark:bg-red-950/20',
  },
  medium: {
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-900',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  low: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
};

const typeIcons = {
  margin: TrendingDown,
  expiry: AlertTriangle,
  menu: AlertCircle,
};

export function IssueCard({
  type,
  title,
  description,
  impact,
  metric,
}: {
  type: IssueType;
  title: string;
  description: string;
  impact: Impact;
  metric?: string;
}) {
  const Icon = typeIcons[type];
  const style = impactStyles[impact];

  return (
    <div className={`rounded-xl border p-5 ${style.border} ${style.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
            {metric && (
              <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                {metric}
              </p>
            )}
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
          {impact === 'high' ? 'Высокий' : impact === 'medium' ? 'Средний' : 'Низкий'}
        </span>
      </div>
    </div>
  );
}
