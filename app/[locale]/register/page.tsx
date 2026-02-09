'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { registerUser, fetchMe } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ApiError } from '@/lib/api/client';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'pl' | 'en' | 'ru' | 'uk'>('ru');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('auth');
  const setSession = useAuthStore((s) => s.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('🚀 [REGISTER] Начало регистрации через BACKEND');

    try {
      // 1. Регистрация - получаем токены
      console.log('1️⃣ [REGISTER] Вызов registerUser()...');
      const auth = await registerUser({
        email,
        password,
        display_name: displayName,
        restaurant_name: tenantName,
        language,
      });
      console.log('✅ [REGISTER] Токены получены с BACKEND:', {
        user_id: auth.user_id,
        tenant_id: auth.tenant_id,
        has_access_token: !!auth.access_token,
        has_refresh_token: !!auth.refresh_token,
      });

      // 2. Получаем данные пользователя
      console.log('2️⃣ [REGISTER] Вызов fetchMe()...');
      const me = await fetchMe(auth.access_token);
      console.log('✅ [REGISTER] Данные пользователя получены с BACKEND:', {
        user: me.user,
        tenant: me.tenant,
      });

      // 3. Сохраняем сессию
      console.log('3️⃣ [REGISTER] Сохранение сессии в Zustand store...');
      setSession({
        accessToken: auth.access_token,
        refreshToken: auth.refresh_token,
        user: me.user,
        tenant: me.tenant,
      });
      console.log('✅ [REGISTER] Сессия сохранена!');

      // 4. Редирект на dashboard
      console.log('4️⃣ [REGISTER] Редирект на dashboard...');
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      console.error('❌ [REGISTER] Ошибка:', err);
      if (err instanceof ApiError) {
        setError(err.message || 'Ошибка регистрации');
      } else {
        setError('Произошла ошибка. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };  return (
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
              <Label htmlFor="display_name">Ваше имя *</Label>
              <Input
                id="display_name"
                name="display_name"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Иван Иванов"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_name">Название ресторана *</Label>
              <Input
                id="tenant_name"
                name="tenant_name"
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Borscht House"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">Минимум 8 символов</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Язык интерфейса</Label>
              <select
                id="language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'pl' | 'en' | 'ru' | 'uk')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ru">🇷🇺 Русский</option>
                <option value="pl">🇵🇱 Polski</option>
                <option value="en">🇬🇧 English</option>
                <option value="uk">🇺🇦 Українська</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full gap-2" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Создание аккаунта...
              </>
            ) : (
              <>
                {t('register.submit')}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
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
