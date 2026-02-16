'use client';

import { Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";

export default function AssistantHeader() {
  const t = useTranslations('assistant.header');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
      <div className="flex items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 group">
          <Sparkles className="h-8 w-8 group-hover:scale-110 transition-transform" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                AI <span className="text-indigo-600">Assistant</span>
             </h1>
             <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100/50">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600">Active</span>
             </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            {t('description')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/dashboard`)}
          className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
