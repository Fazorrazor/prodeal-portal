'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavLogo } from '../components/layout/NavLogo';

function createFallbackRef(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 12).toUpperCase();
  }
  return `ERR-${Date.now().toString(36).toUpperCase()}`;
}

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [fallbackRef] = useState(createFallbackRef);
  const referenceId = error.digest || fallbackRef;

  useEffect(() => {
    console.error('[App ErrorBoundary]', {
      referenceId,
      digest: error.digest ?? null,
    });
  }, [error.digest, referenceId]);

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-deep-blue font-body">
      <header className="p-6 border-b border-brand-border/40">
        <NavLogo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="border-t-2 border-brand-red pt-8 max-w-2xl w-full">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-brand-red font-bold mb-3">
            Service Interruption
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold uppercase tracking-tight mb-4">
            Unable to Complete Request.
          </h1>
          <p className="text-sm font-mono tracking-[0.12em] uppercase text-brand-deep-blue/80 mb-6">
            An unexpected error interrupted this page. Please retry or quote the reference below to our desk.
          </p>
          <p className="inline-block px-4 py-2 mb-10 border border-brand-border bg-white text-xs font-mono tracking-[0.18em] uppercase text-brand-deep-blue">
            Reference ID: {referenceId}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center py-4 px-8 bg-brand-deep-blue border-2 border-brand-deep-blue text-white font-mono font-bold uppercase tracking-[0.2em] hover:bg-brand-deep-blue/90 active:scale-[0.98] transition-all"
            >
              Retry Action
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center py-4 px-8 bg-transparent border-2 border-brand-deep-blue text-brand-deep-blue font-mono font-bold uppercase tracking-[0.2em] hover:bg-brand-deep-blue hover:text-white active:scale-[0.98] transition-all"
            >
              Return to Base
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
