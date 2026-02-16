import { AlertCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type IssueType = 'margin' | 'expiry' | 'menu';
type Impact = 'high' | 'medium' | 'low';

const impactConfigs = {
  high: {
    badge: 'bg-rose-500/10 text-rose-600 border-none',
    label: 'High Risk',
    container: 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none',
    iconColor: 'text-rose-500'
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-600 border-none',
    label: 'Action Required',
    container: 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none',
    iconColor: 'text-amber-500'
  },
  low: {
    badge: 'bg-indigo-500/10 text-indigo-600 border-none',
    label: 'Monitor',
    container: 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none',
    iconColor: 'text-indigo-500'
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
  const config = impactConfigs[impact];

  return (
    <Card className={`overflow-hidden transition-all duration-500 hover:-translate-y-2 border-none rounded-[2rem] ${config.container}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2">
        <Badge className={`${config.badge} font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full`}>
          {config.label}
        </Badge>
        <div className={`h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${config.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{title}</h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
        {metric && (
          <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
            <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">
              {metric}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
