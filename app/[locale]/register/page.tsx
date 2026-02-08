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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useAuthStore((s) => s.register);
  const router = useRouter();
  const t = useTranslations('auth');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(name, email, password);
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
            {t('register.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('register.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-2">
              <Label htmlFor="name">{t('register.name')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" size="lg">
            {t('register.submit')}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('register.hasAccount')}{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              {t('register.signIn')}
            </Link>
          </p>
        </form>

        {/* Demo hint */}
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            💡 <strong>Demo mode:</strong> Регистрация сразу создаст аккаунт
          </p>
        </div>
      </div>
    </div>
  );
}
