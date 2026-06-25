'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export function AdminLoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Format phone if needed (Supabase expects E.164 like +233...)
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setStep('otp');
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
          <p className="text-sm text-brand-red font-medium">{error}</p>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-6 animate-in fade-in">
          <div>
            <label htmlFor="login-phone" className="block text-xs font-bold text-brand-deep-blue uppercase tracking-widest mb-2">
              Mobile Phone Number
            </label>
            <input 
              id="login-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
              required
              className="w-full p-3 bg-brand-surface border border-brand-border/60 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all font-mono"
              placeholder="+233..."
            />
            <p className="text-[10px] text-brand-deep-blue/60 uppercase tracking-widest mt-2">
              Include country code (e.g., +233)
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.length < 8}
            className="w-full p-3 bg-brand-deep-blue text-white font-heading font-bold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Send Secure Code <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 font-medium leading-relaxed">
              We sent a 6-digit code to <span className="font-mono font-bold whitespace-nowrap">{phone}</span>. It may take a few seconds to arrive.
            </p>
          </div>

          <div>
            <label htmlFor="login-otp" className="block text-xs font-bold text-brand-deep-blue uppercase tracking-widest mb-2 text-center">
              One-Time Password
            </label>
            <input 
              id="login-otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              required
              className="w-full p-3 bg-brand-surface border border-brand-border/60 rounded-lg focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all font-mono text-center text-3xl tracking-[0.5em] font-bold"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full p-3 bg-brand-deep-blue text-white font-heading font-bold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Sign In'
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep('phone')}
            className="w-full text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest hover:text-brand-blue transition-colors pt-2"
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
}
