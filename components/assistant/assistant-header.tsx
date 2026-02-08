'use client';

import { Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AssistantHeader() {
  const t = useTranslations('assistant.header');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/${locale}/dashboard`)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-950/50">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </div>
    </div>
  );
}
