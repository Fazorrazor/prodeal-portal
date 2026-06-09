'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    const redirectTo = searchParams.get('redirectTo') || '/admin';
    router.push(redirectTo);
    router.refresh(); // Force server components to re-read the new session
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
          <p className="text-sm text-brand-red font-medium">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-bold text-brand-deep-blue uppercase tracking-widest mb-2">
          Email Address
        </label>
        <input 
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 bg-brand-surface border border-brand-border/60 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
          placeholder="agent@prodeal.com"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-xs font-bold text-brand-deep-blue uppercase tracking-widest mb-2">
          Password
        </label>
        <input 
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 bg-brand-surface border border-brand-border/60 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-3 bg-brand-deep-blue text-white font-heading font-bold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Authenticating...
          </>
        ) : (
          'Sign In'
        )}
      </button>

    </form>
  );
}
