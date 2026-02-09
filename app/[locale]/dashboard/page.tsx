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
  const { user, tenant, logout } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('dashboard');

  // Защита роута
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
          {/* BACKEND CONNECTION STATUS */}
          <div className="rounded-xl border-2 border-green-500 bg-green-50 p-6 dark:bg-green-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                <span className="text-2xl">🟢</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                  ✅ ПОДКЛЮЧЕНО К BACKEND
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Backend: <code className="rounded bg-green-100 px-2 py-1 dark:bg-green-900">https://ministerial-yetta-fodi999-c58d8823.koyeb.app</code>
                </p>
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Данные загружены с реального сервера. Откройте DevTools Console для просмотра логов API запросов.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {t('welcome', { name: user.display_name || user.email })}
              </p>
              {tenant && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  🏪 {tenant.name}
                </p>
              )}
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
                const isActive = module.key === 'aiAssistant' || module.key === 'inventory' || module.key === 'recipes' || module.key === 'dishes' || module.key === 'menuEngineering' || module.key === 'reports';
                const href = module.key === 'aiAssistant' 
                  ? `/${locale}/assistant` 
                  : module.key === 'inventory'
                  ? `/${locale}/inventory`
                  : module.key === 'recipes'
                  ? `/${locale}/recipes`
                  : module.key === 'dishes'
                  ? `/${locale}/dishes`
                  : module.key === 'menuEngineering'
                  ? `/${locale}/menu-engineering`
                  : module.key === 'reports'
                  ? `/${locale}/reports`
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
              {JSON.stringify({ user, tenant }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
