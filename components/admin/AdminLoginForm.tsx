'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, ArrowRight, Clock, Eye, EyeOff } from 'lucide-react';
import { sanitizeSafeRedirect } from '../../lib/security';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const redirectTo = sanitizeSafeRedirect(searchParams.get('redirectTo'), '/admin', '/admin');
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password, redirectTo }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      const safeDest = sanitizeSafeRedirect(data.redirectTo || redirectTo, '/admin', '/admin');
      router.push(safeDest);
      router.refresh();
    } catch {
      setError('Unable to reach authentication service. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {(reason === 'idle' || reason === 'revoked') && !error && (
        <div className="p-3.5 bg-amber-50/80 rounded-lg border border-amber-200/70 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {reason === 'idle'
              ? 'You were signed out due to inactivity. Please sign in again.'
              : 'Your session expired or was revoked. Please sign in again.'}
          </p>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50/80 rounded-lg border border-rose-200/70 flex items-start gap-2.5 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 leading-relaxed font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-xs font-medium text-slate-700">
            Work Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-11 px-3.5 bg-slate-50/80 focus:bg-white border border-slate-200/90 focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/15 rounded-lg outline-none transition-[background-color,border-color,box-shadow] duration-150 text-base sm:text-sm text-[#0A1628] placeholder:text-slate-400"
            placeholder="name@prodealindustries.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-xs font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 pl-3.5 pr-11 bg-slate-50/80 focus:bg-white border border-slate-200/90 focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/15 rounded-lg outline-none transition-[background-color,border-color,box-shadow] duration-150 text-base sm:text-sm text-[#0A1628] placeholder:text-slate-400"
              placeholder="••••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="group w-full h-11 px-4 bg-[#0A1628] hover:bg-[#1A56DB] text-white rounded-lg font-medium text-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
