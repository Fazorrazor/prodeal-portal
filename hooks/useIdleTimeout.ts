'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseIdleTimeoutOptions {
  idleMs?: number; // Default: 30 minutes
  warnMs?: number; // Default: 2 minutes before logout
  onIdle?: () => void;
  onActive?: () => void;
  refreshEveryMs?: number; // Default: 5 minutes
}

export interface UseIdleTimeoutReturn {
  warning: boolean;
  secondsLeft: number;
  stay: () => void;
}

export const STORAGE_LAST_ACTIVITY = 'prodeal_admin_last_activity';
export const STORAGE_LOGOUT_EVENT = 'prodeal_admin_session_logout';

export function useIdleTimeout({
  idleMs = 30 * 60 * 1000,
  warnMs = 2 * 60 * 1000,
  onIdle,
  onActive,
  refreshEveryMs = 5 * 60 * 1000,
}: UseIdleTimeoutOptions = {}): UseIdleTimeoutReturn {
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => Math.ceil(warnMs / 1000));

  const onIdleRef = useRef(onIdle);
  const onActiveRef = useRef(onActive);
  useEffect(() => {
    onIdleRef.current = onIdle;
    onActiveRef.current = onActive;
  }, [onIdle, onActive]);

  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(0);
  const lastRefreshRef = useRef<number>(Date.now());
  const warningRef = useRef<boolean>(false);
  const hasTriggeredIdleRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_LAST_ACTIVITY);
      const now = Date.now();
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= now && now - parsed < idleMs) {
          lastActivityRef.current = parsed;
          return;
        }
      }
      lastActivityRef.current = now;
      localStorage.setItem(STORAGE_LAST_ACTIVITY, now.toString());
    } catch {
      // Ignore storage quota errors
    }
  }, [idleMs]);

  const stay = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    hasTriggeredIdleRef.current = false;
    warningRef.current = false;
    setWarning(false);
    setSecondsLeft(Math.ceil(warnMs / 1000));

    try {
      localStorage.setItem(STORAGE_LAST_ACTIVITY, now.toString());
    } catch {
      // Ignore storage errors
    }

    lastRefreshRef.current = now;
    onActiveRef.current?.();
  }, [warnMs]);

  // Cross-tab activity and logout synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_LAST_ACTIVITY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime)) {
          lastActivityRef.current = Math.max(lastActivityRef.current, remoteTime);
          if (Date.now() - lastActivityRef.current < idleMs - warnMs && warningRef.current) {
            warningRef.current = false;
            setWarning(false);
          }
        }
      } else if (e.key === STORAGE_LOGOUT_EVENT && !hasTriggeredIdleRef.current) {
        hasTriggeredIdleRef.current = true;
        onIdleRef.current?.();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [idleMs, warnMs]);

  // Passive activity listeners throttled to 1/sec
  useEffect(() => {
    const handleActivity = () => {
      if (warningRef.current) return;
      const now = Date.now();
      if (now - lastThrottleRef.current < 1000) return;
      lastThrottleRef.current = now;
      lastActivityRef.current = now;

      try {
        localStorage.setItem(STORAGE_LAST_ACTIVITY, now.toString());
      } catch {
        // Ignore storage errors
      }

      if (now - lastRefreshRef.current >= refreshEveryMs) {
        lastRefreshRef.current = now;
        onActiveRef.current?.();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'wheel', 'touchstart'] as const;
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [refreshEveryMs]);

  // 1s wall-clock ticker (resilient to tab throttling / sleep)
  useEffect(() => {
    const interval = setInterval(() => {
      const remainingMs = idleMs - (Date.now() - lastActivityRef.current);

      if (remainingMs <= 0) {
        if (!hasTriggeredIdleRef.current) {
          hasTriggeredIdleRef.current = true;
          warningRef.current = false;
          setWarning(false);
          setSecondsLeft(0);
          onIdleRef.current?.();
        }
      } else if (remainingMs <= warnMs) {
        setSecondsLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
        if (!warningRef.current) {
          warningRef.current = true;
          setWarning(true);
        }
      } else if (warningRef.current) {
        warningRef.current = false;
        setWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [idleMs, warnMs]);

  return { warning, secondsLeft, stay };
}
