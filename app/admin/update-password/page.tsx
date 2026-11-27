'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      let {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        const hashStr = window.location.hash.substring(1);
        const params = new URLSearchParams(hashStr);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          session = data.session;
        }
      }

      if (!session) {
        toast.error('Invite link expired or invalid. Please request a new one.');
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

      toast.success('Password updated successfully');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] p-7 sm:p-8">
          <div className="mb-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#0A1628] text-white flex items-center justify-center text-[11px] font-bold">
                  P
                </span>
                <span className="font-semibold text-sm tracking-tight text-[#0A1628]">
                  Prodeal
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-wider uppercase font-medium bg-slate-100 text-slate-500 border border-slate-200/70 px-2 py-0.5 rounded">
                Account Setup
              </span>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-[#0A1628]">
              Set Your Password
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create a secure password to activate your Prodeal Admin Desk account.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="block text-xs font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-3.5 pr-11 bg-slate-50/80 focus:bg-white border border-slate-200/90 focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/15 rounded-lg outline-none transition-[background-color,border-color,box-shadow] duration-150 text-base sm:text-sm text-[#0A1628] placeholder:text-slate-400"
                  placeholder="Minimum 6 characters"
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
              <p className="text-[11px] text-slate-400">
                Use at least 6 characters with a mix of letters and numbers.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || password.length < 6}
                className="group w-full h-11 px-4 bg-[#0A1628] hover:bg-[#1A56DB] text-white rounded-lg font-medium text-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving password...</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Continue</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Lock className="w-3 h-3" />
          <span>Protected by Prodeal Session Security</span>
        </div>
      </div>
    </main>
  );
}
