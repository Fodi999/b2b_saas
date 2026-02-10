'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Menu, User, X } from 'lucide-react';
import LanguageSwitcher from './language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/lib/stores/auth-store';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Header() {
  const t = useTranslations('header');
  const { user, tenant } = useAuthStore();
  const params = useParams();
  const locale = params.locale as string;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-xl font-bold text-white">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">RestaurantAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {t('features')}
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {t('howItWorks')}
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {t('pricing')}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            
            {user ? (
              // Logged in state
              <>
                <Link href={`/${locale}/dashboard`}>
                  <Button variant="ghost" className="hidden gap-2 md:inline-flex">
                    <User className="h-4 w-4" />
                    {user.display_name || user.email}
                  </Button>
                </Link>
              </>
            ) : (
              // Logged out state
              <>
                <Link href={`/${locale}/login`}>
                  <Button variant="ghost" className="hidden md:inline-flex">
                    {t('signIn')}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button className="hidden md:inline-flex">
                    {t('getStarted')}
                  </Button>
                </Link>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 dark:border-gray-800 md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="#features" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('features')}
              </Link>
              <Link 
                href="#how-it-works" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('howItWorks')}
              </Link>
              <Link 
                href="#pricing" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('pricing')}
              </Link>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                {user ? (
                  <Link href={`/${locale}/dashboard`} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      {user.display_name || user.email}
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href={`/${locale}/login`} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href={`/${locale}/register`} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full">
                        {t('getStarted')}
                      </Button>
                    </Link>
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
