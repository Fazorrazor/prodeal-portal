'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
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
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-transparent border-l-2 border-brand-red flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
          <p className="text-sm text-brand-red font-bold font-mono uppercase tracking-widest">{error}</p>
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-8 animate-in fade-in">
        <div>
          <label htmlFor="login-email" className="block text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <input 
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-3 bg-transparent border-b-2 border-brand-border/60 focus:border-brand-blue outline-none transition-colors font-mono text-brand-deep-blue"
            placeholder="admin@prodealindustries.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-2">
            Password
          </label>
          <input 
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-3 bg-transparent border-b-2 border-brand-border/60 focus:border-brand-blue outline-none transition-colors font-mono text-brand-deep-blue"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full p-4 bg-brand-deep-blue text-white font-heading font-bold hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AUTHENTICATING...
            </>
          ) : (
            <>
              SIGN IN <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
