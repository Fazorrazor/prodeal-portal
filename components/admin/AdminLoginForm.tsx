'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { sanitizeSafeRedirect } from '../../lib/security';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="space-y-6">
      {(reason === 'idle' || reason === 'revoked') && !error && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 font-medium">
            {reason === 'idle'
              ? 'You were signed out due to inactivity. Please sign in again.'
              : 'Your session expired or was revoked. Please sign in again.'}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-8 animate-in fade-in">
        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-brand-deep-blue/70 mb-1.5">
            Work Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-3 px-4 bg-white border border-brand-border/40 rounded-md shadow-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all text-sm text-brand-deep-blue"
            placeholder="name@company.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium text-brand-deep-blue/70 mb-1.5">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-3 px-4 bg-white border border-brand-border/40 rounded-md shadow-sm focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all text-sm text-brand-deep-blue"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full py-3 px-4 bg-brand-blue text-white rounded-md shadow-sm font-medium hover:bg-brand-deep-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
