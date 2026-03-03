import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10" />
        <AlertTriangle className="h-16 w-16 text-indigo-400 relative z-10" />
      </div>

      <h1 className="mt-8 text-6xl font-black italic tracking-tighter text-white">
        404
      </h1>

      <p className="mt-4 text-sm text-white/50 max-w-md leading-relaxed">
        This page doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center px-8 rounded-2xl bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-white/90 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
