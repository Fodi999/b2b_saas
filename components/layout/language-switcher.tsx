'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

type Locale = 'pl' | 'en' | 'uk' | 'ru';

const languages: Record<Locale, { name: string; flag: string }> = {
  pl: { name: 'Polski', flag: '🇵🇱' },
  en: { name: 'English', flag: '🇬🇧' },
  uk: { name: 'Українська', flag: '🇺🇦' },
  ru: { name: 'Русский', flag: '🇷🇺' },
};

export default function LanguageSwitcher() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLocale = (params.locale as Locale) || 'pl';

  const switchLocale = (newLocale: Locale) => {
    startTransition(() => {
      // Replace current locale in pathname with new locale
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
      router.push(newPathname);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" disabled={isPending}>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages[currentLocale].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(languages) as Locale[]).map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className="cursor-pointer"
          >
            <span className="mr-2">{languages[locale].flag}</span>
            {languages[locale].name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
