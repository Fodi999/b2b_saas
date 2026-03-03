'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-10 animate-pulse" />
        <AlertTriangle className="h-16 w-16 text-rose-500 relative z-10" />
      </div>

      <h1 className="mt-8 text-2xl font-black uppercase tracking-widest text-white">
        Something went wrong
      </h1>

      <p className="mt-4 text-sm text-white/50 max-w-md leading-relaxed">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>

      {error.digest && (
        <p className="mt-2 text-[10px] font-mono text-white/20">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex gap-4">
        <Button
          onClick={reset}
          className="h-12 px-8 rounded-2xl bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-white/90"
        >
          Try again
        </Button>
        <Button
          onClick={() => (window.location.href = '/')}
          variant="ghost"
          className="h-12 px-8 rounded-2xl border border-white/10 text-white/50 font-black uppercase text-[11px] tracking-widest hover:text-white"
        >
          Go home
        </Button>
      </div>
    </div>
  );
}
