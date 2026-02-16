'use client';

import { useAuthInit } from '@/lib/hooks/use-auth-init';
import { ReactNode } from 'react';

export function AuthInitializer({ children }: { children: ReactNode }) {
  useAuthInit();
  
  // Показываем children сразу, но логика auth восстанавливается в фоне
  // Если нужно - можно добавить loading screen:
  // if (!isInitialized) {
  //   return <div>Loading...</div>;
  // }
  
  return <>{children}</>;
}
