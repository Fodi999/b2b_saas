'use client';

import { useAuthInit } from '@/lib/hooks/use-auth-init';
import { ReactNode } from 'react';

export function AuthInitializer({ children }: { children: ReactNode }) {
  const { isInitialized } = useAuthInit();
  
  // 🛡️ Важно: не рендерим детей, пока не проверили токены в localStorage.
  // Это предотвращает лишние API вызовы с невалидными токенами из вложенных компонентов.
  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[9999] flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">Initializing Portal Core...</p>
         </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
