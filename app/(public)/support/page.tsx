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
      <div className="min-h-[80vh] flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12 bg-brand-surface">
        <div className="w-full max-w-3xl mx-auto border-t-2 border-brand-blue pt-8 pb-10 relative">
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-brand-blue" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-brand-blue" />
          
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/60 hover:text-brand-blue mb-8 transition-colors group">
            <span className="text-base leading-none mb-[2px] group-hover:-translate-x-1 transition-transform">←</span> BACK TO HOME
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tighter leading-none text-brand-deep-blue mb-4 uppercase">
            TICKET<br /><span className="text-brand-blue">SENT</span>
          </h1>
          <p className="text-sm md:text-base font-mono text-brand-deep-blue/80 uppercase tracking-widest leading-relaxed mb-8 max-w-xl">
            We've received your complaint and will follow up shortly.
          </p>
          <Link href="/" className="bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-[0.2em] text-xs py-4 px-8 hover:bg-brand-blue transition-colors inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Reduced top padding so content sits higher in the viewport immediately
    <div className="min-h-[80vh] flex flex-col justify-start px-4 sm:px-6 lg:px-12 pt-6 pb-12 bg-brand-surface relative overflow-hidden">
      
      {/* Background structural lines */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-border/20 hidden lg:block" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-brand-border/20 hidden lg:block" />
      
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10 items-start">
      
        {/* Left Column: Typography & Context — now items-start so it top-aligns with the form */}
        <div className="flex flex-col justify-start pt-2 lg:pt-0">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/60 hover:text-brand-blue mb-6 transition-colors group w-fit"
          >
            <span className="text-base leading-none mb-[2px] group-hover:-translate-x-1 transition-transform">←</span> 
            BACK TO HOME
          </Link>
          
          <div className="flex items-center gap-3 mb-4 w-fit">
            <span className="text-[10px] font-bold font-mono uppercase tracking-[0.25em] text-brand-deep-blue/40">
              System Support
            </span>
            <div className="h-px w-10 bg-brand-deep-blue/20" />
          </div>

          <div className="flex gap-4 relative">
            {/* Left-rail accent */}
            <div className="w-[3px] bg-brand-red shrink-0 self-stretch" />
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tighter leading-[0.88] text-brand-deep-blue mb-4">
                CONTACT<br /><span className="text-brand-red">SUPPORT</span>
              </h1>
              <p className="text-xs lg:text-sm font-mono text-brand-deep-blue/60 uppercase tracking-[0.12em] leading-relaxed max-w-sm">
                File a complaint or request assistance. Our team will investigate and respond shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: The Form — top-aligned with the left column */}
        <div className="flex flex-col justify-start">
          {status === 'error' && (
            <div className="mb-5 p-4 bg-brand-red/10 border-l-4 border-brand-red">
              <p className="text-xs font-mono font-bold text-brand-red tracking-widest uppercase">{errorMessage}</p>
            </div>
          )}

          {/* Form container with brutalist corner accents */}
          <form action={handleSubmit} className="flex flex-col bg-brand-surface relative group">
            <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-brand-deep-blue" />
            <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-brand-deep-blue" />
            <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-brand-deep-blue" />
            <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-brand-deep-blue" />
            
            <div className="border-2 border-brand-border/40 p-6 md:p-8 flex flex-col gap-6">
              
              {/* Email Field */}
              <div className="group/field">
                <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-2 block group-focus-within/field:text-brand-blue transition-colors">
                  Your Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g. hello@company.com"
                  required
                  disabled={status === 'submitting'}
                  className="w-full bg-transparent border-0 border-b-2 border-brand-border/50 px-0 pb-2 pt-1 text-base font-mono text-brand-deep-blue placeholder:text-brand-border/60 focus:outline-none focus:border-brand-blue transition-colors rounded-none disabled:opacity-50"
                />
              </div>

              {/* Complaint Field */}
              <div className="group/field">
                <div className="flex justify-between items-end mb-2">
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
                  rows={5}
                  disabled={status === 'submitting'}
                  className="w-full bg-black/[0.02] border-2 border-brand-border/40 p-4 text-sm font-body text-brand-deep-blue placeholder:text-brand-deep-blue/40 focus:outline-none focus:border-brand-blue focus:bg-transparent transition-all rounded-none resize-y disabled:opacity-50"
                />
              </div>
              
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-[0.2em] text-sm py-5 px-8 hover:bg-brand-blue active:bg-brand-blue transition-colors flex justify-between items-center group/btn w-full border-t border-brand-deep-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{status === 'submitting' ? 'TRANSMITTING...' : 'SEND MESSAGE'}</span>
              <span className="text-brand-blue group-hover/btn:text-white transition-colors text-xl leading-none group-hover/btn:translate-x-1">→</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
