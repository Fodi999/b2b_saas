'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@restaurant.ai');
  const [password, setPassword] = useState('password');
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const t = useTranslations('auth');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@restaurant.ai"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('login.remember')}
                </label>
              </div>

              <div className="text-sm">
                <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  {t('login.forgot')}
                </Link>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" size="lg">
            {t('login.submit')}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('login.noAccount')}{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              {t('login.signUp')}
            </Link>
          </p>
        </form>

        {/* Demo hint */}
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            💡 <strong>Demo mode:</strong> Используйте любой email/пароль для входа
          </p>
        </div>
      </div>
    </div>
  );
}
