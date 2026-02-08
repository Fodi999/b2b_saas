import { AlertTriangle, Info, XCircle } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'info';

const variants = {
  danger: {
    container: 'border-red-500/30 bg-red-500/10 dark:border-red-900/50 dark:bg-red-950/30',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    IconComponent: XCircle,
  },
  warning: {
    container: 'border-yellow-500/30 bg-yellow-500/10 dark:border-yellow-900/50 dark:bg-yellow-950/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-900 dark:text-yellow-100',
    IconComponent: AlertTriangle,
  },
  info: {
    container: 'border-blue-500/30 bg-blue-500/10 dark:border-blue-900/50 dark:bg-blue-950/30',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
    IconComponent: Info,
  },
};

export function InsightCard({
  title,
  description,
  variant = 'info',
}: {
  title: string;
  description: string;
  variant?: Variant;
}) {
  const style = variants[variant];
  const Icon = style.IconComponent;

  return (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-md ${style.container}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${style.title}`}>{title}</h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
