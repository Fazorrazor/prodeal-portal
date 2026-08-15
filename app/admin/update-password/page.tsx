'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Create browser client using auth-helpers-nextjs
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Supabase automatically extracts the hash and creates a session.
    // If the user arrived here without a hash and is not logged in, they shouldn't be here.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !window.location.hash.includes('access_token')) {
        router.push('/admin/login');
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      toast.success('Password updated successfully!');
      router.push('/admin'); // Redirect to dashboard
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-surface p-4">
      <div className="w-full max-w-md border-t-4 border-brand-deep-blue pt-12">
        
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl tracking-tighter uppercase text-brand-deep-blue">
            Setup <span className="text-brand-blue">Password</span>
          </h1>
          <p className="text-brand-deep-blue/80 text-[10px] uppercase font-bold tracking-widest mt-4">
            Welcome to the Prodeal Admin Portal
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label htmlFor="new-password" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-2">
              New Password
            </label>
            <input 
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue py-2 outline-none transition-colors text-sm font-bold text-brand-deep-blue placeholder:font-normal placeholder:text-brand-deep-blue/80"
              placeholder="Enter a secure password"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || password.length < 6}
            className="w-full bg-brand-blue text-white py-4 text-sm font-semibold rounded hover:bg-brand-deep-blue transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Password & Enter Portal'}
          </button>
        </form>

      </div>
    </main>
  );
}
