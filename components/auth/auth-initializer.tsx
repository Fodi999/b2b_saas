'use client';

import { useAuthInit } from '@/lib/hooks/use-auth-init';
import { ReactNode } from 'react';

export function AuthInitializer({ children }: { children: ReactNode }) {
  useAuthInit();
  
  return <>{children}</>;
}
