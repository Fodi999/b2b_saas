'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, ShieldCheck, Zap, Globe, Hotel, UserCircle, Mail, KeyRound } from 'lucide-react';
import { registerUser, fetchMe } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ApiError } from '@/lib/api/client';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const language = locale as 'pl' | 'en' | 'ru' | 'uk';
  const t = useTranslations('auth');
  const setSession = useAuthStore((s) => s.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const auth = await registerUser({
        email,
        password,
        display_name: displayName,
        restaurant_name: tenantName,
        language,
      });

      const me = await fetchMe(auth.access_token);
      setSession({
        accessToken: auth.access_token,
        refreshToken: auth.refresh_token,
        user: me.user,
        tenant: me.tenant,
      });
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Ошибка регистрации');
      } else {
        setError('Произошла ошибка. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden py-10">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in duration-700">
        {/* Header Section */}
        <div className="text-center mb-10">
           <Link href={`/${locale}`} className="inline-block group mb-6">
             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
               <Zap className="h-10 w-10 fill-current" />
             </div>
           </Link>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            {t('register.title')}
          </h1>
          <p className="mt-3 text-slate-500 font-medium italic">
            {t('register.subtitle')}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                       <UserCircle className="h-3 w-3" /> Ваше имя
                    </Label>
                    <Input
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="h-14 rounded-2xl border-slate-200 focus:ring-indigo-600 font-bold bg-slate-50/50"
                      disabled={isLoading}
                    />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                       <Hotel className="h-3 w-3" /> Название заведения
                    </Label>
                    <Input
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Borscht House"
                      className="h-14 rounded-2xl border-slate-200 focus:ring-indigo-600 font-bold bg-slate-50/50"
                      disabled={isLoading}
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                       <Mail className="h-3 w-3" /> {t('register.email')}
                    </Label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-14 rounded-2xl border-slate-200 focus:ring-indigo-600 font-bold bg-slate-50/50"
                      disabled={isLoading}
                    />
                 </div>
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                       <KeyRound className="h-3 w-3" /> {t('register.password')}
                    </Label>
                    <Input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-14 rounded-2xl border-slate-200 focus:ring-indigo-600 font-bold bg-slate-50/50"
                      disabled={isLoading}
                    />
                    <p className="text-[10px] font-bold text-slate-400 pl-1 uppercase tracking-tighter italic">Min character length: 8</p>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Region:</span>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'ru' && '🇷🇺 Russian (CIS)'}
                  {language === 'pl' && '🇵🇱 Polish (EE)'}
                  {language === 'en' && '🇬🇧 English (Global)'}
                  {language === 'uk' && '🇺🇦 Ukrainian (UA)'}
               </div>
               <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse ml-auto" />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 animate-in shake-200">
                 <ShieldCheck className="h-5 w-5 shrink-0 rotate-180" />
                 <p className="text-xs font-black uppercase tracking-tighter">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {t('register.submit')}
                  <ArrowLeft className="ml-3 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm font-bold text-slate-500">
                {t('register.hasAccount')}{' '}
                <Link
                  href={`/${locale}/login`}
                  className="text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest text-[11px] ml-2 border-b-2 border-indigo-600/20 hover:border-indigo-600 transition-all"
                >
                  {t('register.signIn')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
