'use client';

import { useState } from 'react';
import Link from 'next/link';
import { submitSupportRequest } from '../../actions/submitSupport';

export default function SupportPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    setStatus('submitting');
    const result = await submitSupportRequest(formData);
    
    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong.');
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-20 bg-brand-surface">
        <div className="w-full max-w-4xl mx-auto border-t-4 border-brand-blue pt-12 pb-16 relative">
          {/* Brutalist accents */}
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-brand-blue" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-brand-blue" />
          
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/60 hover:text-brand-blue mb-12 transition-colors group">
            <span className="text-base leading-none mb-[2px] group-hover:-translate-x-1 transition-transform">←</span> BACK TO HOME
          </Link>
          
          <h1 className="text-6xl md:text-8xl font-heading font-extrabold tracking-tighter leading-none text-brand-deep-blue mb-8 uppercase">
            TICKET<br /><span className="text-brand-blue">SENT</span>
          </h1>
          <p className="text-lg md:text-xl font-mono text-brand-deep-blue/80 uppercase tracking-widest leading-relaxed mb-12 max-w-2xl">
            We've received your complaint and will follow up shortly.
          </p>
          <Link href="/" className="bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-[0.2em] text-sm py-5 px-10 hover:bg-brand-blue transition-colors inline-block border border-transparent hover:border-brand-blue">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-24 bg-brand-surface relative overflow-hidden">
      
      {/* Background structural lines */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-border/20 hidden lg:block" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-brand-border/20 hidden lg:block" />
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10">
      
        {/* Left Column: Typography & Context */}
        <div className="flex flex-col justify-center pt-8 lg:pt-0">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/60 hover:text-brand-blue mb-12 lg:mb-20 transition-colors group w-fit"
          >
            <span className="text-base leading-none mb-[2px] group-hover:-translate-x-1 transition-transform">←</span> 
            BACK TO HOME
          </Link>
          
          <div className="flex items-center gap-3 mb-8 w-fit">
            <span className="text-[10px] font-bold font-mono uppercase tracking-[0.25em] text-brand-deep-blue/40">
              System Support
            </span>
            <div className="h-px w-12 bg-brand-deep-blue/20" />
          </div>

          <div className="flex gap-6 lg:gap-8 relative">
            {/* Animated left-rail accent */}
            <div className="w-[4px] bg-brand-red shrink-0 self-stretch min-h-full" style={{ minHeight: '100%' }} />
            <div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-heading font-extrabold tracking-tighter leading-[0.85] text-brand-deep-blue mb-8">
                CONTACT<br /><span className="text-brand-red">SUPPORT</span>
              </h1>
              <p className="text-sm lg:text-base font-mono text-brand-deep-blue/60 uppercase tracking-[0.15em] leading-relaxed max-w-md">
                File a complaint or request assistance. Our team will investigate and respond to your inquiry shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: The Form */}
        <div className="flex flex-col justify-center">
          {status === 'error' && (
            <div className="mb-8 p-5 bg-brand-red/10 border-l-4 border-brand-red">
              <p className="text-xs font-mono font-bold text-brand-red tracking-widest uppercase">{errorMessage}</p>
            </div>
          )}

          {/* Form container with brutalist borders */}
          <form action={handleSubmit} className="flex flex-col bg-brand-surface relative group">
            {/* Corner accents */}
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-brand-deep-blue" />
            <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-brand-deep-blue" />
            <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-brand-deep-blue" />
            <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-brand-deep-blue" />
            
            <div className="border-2 border-brand-border/40 p-8 md:p-12 flex flex-col gap-10">
              
              {/* Email Field */}
              <div className="group/field">
                <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-3 block group-focus-within/field:text-brand-blue transition-colors">
                  Your Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g. hello@company.com"
                  required
                  disabled={status === 'submitting'}
                  className="w-full bg-transparent border-0 border-b-2 border-brand-border/50 px-0 pb-3 pt-2 text-lg lg:text-xl font-mono text-brand-deep-blue placeholder:text-brand-border/60 focus:outline-none focus:border-brand-blue transition-colors rounded-none disabled:opacity-50"
                />
              </div>

              {/* Complaint Field */}
              <div className="group/field">
                <div className="flex justify-between items-end mb-3">
                  <label htmlFor="message" className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 block group-focus-within/field:text-brand-blue transition-colors">
                    Complaint / Message
                  </label>
                  <span className="text-[9px] font-mono text-brand-deep-blue/40 uppercase tracking-widest">Required</span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Please describe the issue in detail..."
                  required
                  rows={6}
                  disabled={status === 'submitting'}
                  className="w-full bg-black/[0.02] border-2 border-brand-border/40 p-5 text-base font-body text-brand-deep-blue placeholder:text-brand-deep-blue/40 focus:outline-none focus:border-brand-blue focus:bg-transparent transition-all rounded-none resize-y disabled:opacity-50"
                />
              </div>
              
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-[0.2em] text-base py-8 px-10 hover:bg-brand-blue active:bg-brand-blue transition-colors flex justify-between items-center group/btn w-full border-t border-brand-deep-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{status === 'submitting' ? 'TRANSMITTING...' : 'SEND MESSAGE'}</span>
              <span className="text-brand-blue group-hover/btn:text-white transition-colors text-2xl leading-none group-hover/btn:translate-x-2">→</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
