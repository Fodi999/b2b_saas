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
      className={`transition-all hover:shadow-sm ${'className' in config ? config.className : ''}`}
    >
      <Icon className={`h-4 w-4 ${config.colorClass}`} />
      <AlertTitle className="font-bold tracking-tight">{title}</AlertTitle>
      <AlertDescription className="mt-1 text-xs opacity-80 leading-relaxed">
        {description}
      </AlertDescription>
    </Alert>
  );
}
