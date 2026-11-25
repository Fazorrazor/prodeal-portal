'use client';

import { useCallback, useRef } from 'react';
import { Clock } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  STORAGE_LAST_ACTIVITY,
  STORAGE_LOGOUT_EVENT,
  useIdleTimeout,
} from '../../hooks/useIdleTimeout';

interface SessionGuardProps {
  idleMs?: number;
  warnMs?: number;
  refreshEveryMs?: number;
}

export function SessionGuard({
  idleMs = 30 * 60 * 1000,
  warnMs = 2 * 60 * 1000,
  refreshEveryMs = 5 * 60 * 1000,
}: SessionGuardProps) {
  const isTerminatingRef = useRef(false);
  const supabase = createClientComponentClient();

  const handleLogout = useCallback(
    async (reason: 'idle' | 'manual' | 'revoked' = 'idle') => {
      if (isTerminatingRef.current) return;
      isTerminatingRef.current = true;

      try {
        localStorage.removeItem(STORAGE_LAST_ACTIVITY);
        localStorage.setItem(STORAGE_LOGOUT_EVENT, Date.now().toString());
      } catch {
        // Ignore storage errors
      }

      try {
        await Promise.race([
          Promise.all([
            fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'same-origin', keepalive: true }),
            supabase.auth.signOut(),
          ]),
          new Promise((r) => setTimeout(r, 2000)),
        ]);
      } catch {
        // Proceed to login redirect regardless
      }

      window.location.replace(`/admin/login?reason=${reason}`);
    },
    [supabase.auth]
  );

  const handleSessionHeartbeat = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/session', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (res.status === 401 || res.status === 403) {
        await handleLogout('revoked');
      }
    } catch {
      // Transient offline/network glitch: preserve active session until connectivity returns
    }
  }, [handleLogout]);

  const { warning, secondsLeft, stay } = useIdleTimeout({
    idleMs,
    warnMs,
    refreshEveryMs,
    onIdle: () => void handleLogout('idle'),
    onActive: () => void handleSessionHeartbeat(),
  });

  if (!warning) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-guard-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40"
    >
      <div className="w-full max-w-sm bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 flex flex-col gap-4 text-center">
        <div className="mx-auto w-11 h-11 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
          <Clock className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h2 id="session-guard-title" className="text-base font-semibold text-brand-deep-blue tracking-tight">
            Session Expiring
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You have been inactive. For account security, you will be signed out automatically in:
          </p>
        </div>

        <div className="py-1">
          <span className="text-3xl font-bold tracking-tight text-brand-red tabular-nums font-mono">
            {secondsLeft}s
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={stay}
            className="w-full h-11 px-4 bg-brand-blue hover:bg-brand-deep-blue text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Stay signed in
          </button>
          <button
            type="button"
            onClick={() => void handleLogout('manual')}
            className="w-full h-9 px-4 text-slate-500 hover:text-brand-deep-blue font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Sign out now
          </button>
        </div>
      </div>
    </div>
  );
}
