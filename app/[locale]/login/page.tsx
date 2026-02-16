'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowRight, Loader2, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-react';
import { loginUser, fetchMe, updateUserLanguage } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ApiError } from '@/lib/api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    try {
      const auth = await loginUser({ email, password });
      let me = await fetchMe(auth.access_token);
      const expectedLanguage = locale as 'pl' | 'en' | 'ru' | 'uk';
      
      if (me.user.language !== expectedLanguage) {
        me = await updateUserLanguage(expectedLanguage, auth.access_token);
      }

      setSession({
        accessToken: auth.access_token,
        refreshToken: auth.refresh_token,
        user: me.user,
        tenant: me.tenant,
      });
      
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Неверный email или пароль');
      } else {
        setError('Произошла ошибка. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-700 py-6 sm:py-12">
        {/* Logo Section */}
        <div className="text-center mb-6 sm:mb-10">
          <Link href={`/${locale}`} className="inline-block group mb-3 sm:mb-6">
            <div className="mx-auto flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
               <Zap className="h-6 w-6 sm:h-10 sm:w-10 fill-current" />
            </div>
          </Link>
          <h1 className="mt-3 sm:mt-8 text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            Resto <span className="text-indigo-600">AI</span>
          </h1>
          <p className="mt-2 sm:mt-4 text-[9px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic uppercase tracking-widest">
             {t('login.coreVersion') || 'Neural Core v2.4'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 sm:p-12">
          <div className="mb-6 sm:mb-10">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 sm:mb-2">{t('login.title')}</h2>
            <p className="text-[10px] sm:text-sm font-bold text-slate-400">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-200 focus:ring-indigo-600 font-bold bg-slate-50/50"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Password</Label>
                  <Link href="#" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">
                    {t('login.forgot')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-200 focus:ring-indigo-600 font-bold bg-slate-50/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 animate-in shake-200">
                 <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 rotate-180" />
                 <p className="text-[10px] sm:text-xs font-black uppercase tracking-tighter">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  {t('login.submit')}
                  <ArrowRight className="ml-3 h-4 w-4 sm:h-5 sm:w-5" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                {t('login.noAccount')}{' '}
                <Link
                  href={`/${locale}/register`}
                  className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest text-[9px] sm:text-[11px] ml-2 border-b-2 border-indigo-600/20 hover:border-indigo-600 transition-all"
                >
                  {t('login.signUp')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
