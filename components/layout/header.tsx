'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Menu, User, X, Zap, Sparkles, LayoutGrid, ChevronDown } from 'lucide-react';
import LanguageSwitcher from './language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/lib/stores/auth-store';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/auth/user-avatar';

export default function Header() {
  const t = useTranslations('header');
  const { user } = useAuthStore();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDashboard = pathname.includes('/dashboard') || pathname.includes('/inventory') || pathname.includes('/recipes') || pathname.includes('/dishes') || pathname.includes('/assistant');

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <Link href={`/${locale}${user ? '/dashboard' : ''}`} className="flex items-center gap-4 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-indigo-500/20 group-hover:scale-105 transition-all duration-500">
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                Resto<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                 <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    v2.4 Core
                 </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation (Center) */}
          {user && (
             <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-[1.25rem] border border-slate-100 dark:border-slate-800">
               {[
                 { label: t('nav.dashboard'), href: `/${locale}/dashboard` },
                 { label: t('nav.inventory'), href: `/${locale}/inventory` },
                 { label: t('nav.recipes'), href: `/${locale}/recipes` },
                 { label: t('nav.dishes'), href: `/${locale}/dishes` },
                 { label: t('nav.reports'), href: `/${locale}/reports` },
               ].map((item) => {
                 const isActive = pathname.startsWith(item.href);
                 return (
                   <Link key={item.href} href={item.href}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-white dark:bg-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                      >
                        {item.label}
                      </Button>
                   </Link>
                 );
               })}
             </nav>
          )}

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
               <LanguageSwitcher />
               <ThemeToggle />
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
            
            {user ? (
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 pl-1 pr-3 py-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 transition-colors group">
                    <UserAvatar size="sm" editable className="h-9 w-9 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform" />
                    <Link href={`/${locale}/dashboard`} className="hidden md:flex flex-col text-left">
                       <span className="text-xs font-black text-slate-900 dark:text-white max-w-[120px] truncate leading-none mb-0.5">{user.display_name || user.email}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Verified User</span>
                    </Link>
                 </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" className="hidden md:inline-flex text-xs font-black uppercase tracking-widest h-11 px-6 rounded-2xl">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button className="hidden md:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-xs font-black uppercase tracking-widest h-11 px-6 rounded-2xl">
                    {t('getStarted')}
                  </Button>
                </Link>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <div className="flex flex-col gap-1 items-end">
                   <div className="h-0.5 w-6 bg-slate-900 dark:bg-white rounded-full" />
                   <div className="h-0.5 w-4 bg-slate-900 dark:bg-white rounded-full" />
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-in slide-in-from-top-6 duration-300 pb-8 pt-4 lg:hidden border-t border-slate-100 dark:border-slate-800 mt-2">
            <nav className="flex flex-col space-y-4">
               {user && (
                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link href={`/${locale}/dashboard`} onClick={() => setIsMobileMenuOpen(false)}>
                       <Button variant="secondary" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2">
                          <LayoutGrid className="h-4 w-4" /> Dashboard
                       </Button>
                    </Link>
                    <Link href={`/${locale}/assistant`} onClick={() => setIsMobileMenuOpen(false)}>
                       <Button variant="secondary" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2">
                          <Sparkles className="h-4 w-4 text-indigo-500" /> AI Assistant
                       </Button>
                    </Link>
                 </div>
               )}

              <div className="flex flex-col gap-2">
                {!user ? (
                   <>
                    <Link href={`/${locale}/login`} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t('signIn')}</Button>
                    </Link>
                    <Link href={`/${locale}/register`} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest">{t('getStarted')}</Button>
                    </Link>
                   </>
                ) : (
                  <div className="flex gap-4 items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                     <LanguageSwitcher />
                     <ThemeToggle />
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
