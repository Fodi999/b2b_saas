import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Variant = 'danger' | 'warning' | 'info';

const variants = {
  danger: {
    variant: 'destructive' as const,
    icon: XCircle,
    colorClass: 'text-destructive',
  },
  warning: {
    variant: 'default' as const,
    icon: AlertTriangle,
    colorClass: 'text-amber-500',
    className: 'bg-amber-500/5 border-amber-500/20',
  },
  info: {
    variant: 'default' as const,
    icon: Info,
    colorClass: 'text-blue-500',
    className: 'bg-blue-500/5 border-blue-500/20',
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
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <Alert 
      variant={config.variant} 
      className={`transition-all hover:shadow-sm p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] ${'className' in config ? config.className : ''}`}
    >
      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${config.colorClass}`} />
      <AlertTitle className="font-bold tracking-tight text-xs sm:text-sm mb-1">{title}</AlertTitle>
      <AlertDescription className="mt-0.5 text-[10px] sm:text-xs opacity-80 leading-relaxed font-medium">
        {description}
      </AlertDescription>
    </Alert>
  );
}
