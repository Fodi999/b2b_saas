'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import AIAlerts from '@/components/dashboard/ai-alerts';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard');

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login`);
    }
  }, [user, router, locale]);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  if (!user) {
    return null;
  }

  const modules = [
    { key: 'inventory', name: t('modules.inventory') },
    { key: 'recipes', name: t('modules.recipes') },
    { key: 'dishes', name: t('modules.dishes') },
    { key: 'menuEngineering', name: t('modules.menuEngineering') },
    { key: 'aiAssistant', name: t('modules.aiAssistant') },
    { key: 'reports', name: t('modules.reports') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {t('welcome', { name: user.name })}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </Button>
          </div>

          {/* AI Alerts - главный блок */}
          <AIAlerts />

          {/* Content */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Модули системы
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => {
                const isActive = module.key === 'aiAssistant' || module.key === 'inventory' || module.key === 'recipes' || module.key === 'dishes';
                const href = module.key === 'aiAssistant' 
                  ? `/${locale}/assistant` 
                  : module.key === 'inventory'
                  ? `/${locale}/inventory`
                  : module.key === 'recipes'
                  ? `/${locale}/recipes`
                  : module.key === 'dishes'
                  ? `/${locale}/dishes`
                  : '#';
                
                return (
                  <Link
                    key={module.key}
                    href={href}
                    className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all dark:border-gray-800 dark:bg-gray-900 ${
                      isActive
                        ? 'hover:border-indigo-300 hover:shadow-lg dark:hover:border-indigo-700' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">{module.name}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {isActive ? '🚀 Открыть' : t('comingSoon')}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* User info */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
              {t('userInfo')}
            </h3>
            <pre className="mt-2 overflow-x-auto text-sm text-indigo-700 dark:text-indigo-300">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
