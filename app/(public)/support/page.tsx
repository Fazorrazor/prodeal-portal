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
        <div className="w-full max-w-3xl mx-auto border-t border-brand-blue/20 pt-8 pb-10 relative">
          
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/60 hover:text-brand-blue mb-8 transition-colors group">
            <span className="text-base leading-none mb-[2px] group-hover:-translate-x-1 transition-transform">←</span> BACK TO HOME
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight leading-none text-brand-deep-blue mb-4">
            Ticket<br /><span className="text-brand-blue">Sent</span>
          </h1>
          <p className="text-sm md:text-base text-brand-deep-blue/80 leading-relaxed mb-8 max-w-xl">
            We've received your complaint and will follow up shortly.
          </p>
          <Link href="/" className="bg-brand-blue text-white font-medium text-sm py-3 px-6 rounded-md hover:bg-brand-deep-blue transition-colors inline-block shadow-sm">
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
            <div className="w-[2px] bg-brand-blue shrink-0 self-stretch rounded-full" />
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight leading-[1.05] text-brand-deep-blue mb-4">
                Contact<br /><span className="text-brand-blue">Support</span>
              </h1>
              <p className="text-sm text-brand-deep-blue/70 leading-relaxed max-w-sm">
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

          {/* Form container */}
          <form action={handleSubmit} className="flex flex-col bg-white rounded-xl shadow-sm border border-brand-border/20 relative group overflow-hidden">
            
            <div className="p-6 md:p-8 flex flex-col gap-6">
              
              {/* Email Field */}
              <div className="group/field">
                <label htmlFor="email" className="text-xs font-medium text-brand-deep-blue/70 mb-1.5 block group-focus-within/field:text-brand-blue transition-colors">
                  Your Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g. hello@company.com"
                  required
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-brand-border/40 rounded-md px-4 py-3 text-sm text-brand-deep-blue font-medium placeholder:text-brand-deep-blue/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm disabled:opacity-50"
                />
              </div>

              {/* Complaint Field */}
              <div className="group/field">
                <div className="flex justify-between items-end mb-1.5">
                  <label htmlFor="message" className="text-xs font-medium text-brand-deep-blue/70 block group-focus-within/field:text-brand-blue transition-colors">
                    Complaint / Message
                  </label>
                  <span className="text-[10px] text-brand-deep-blue/40 uppercase tracking-widest font-medium">Required</span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Please describe the issue in detail..."
                  required
                  rows={5}
                  disabled={status === 'submitting'}
                  className="w-full bg-white border border-brand-border/40 rounded-md px-4 py-3 text-sm text-brand-deep-blue font-medium placeholder:text-brand-deep-blue/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm resize-none disabled:opacity-50"
                />
              </div>
              
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-brand-blue text-white font-medium text-sm py-4 px-8 hover:bg-brand-deep-blue transition-colors flex justify-between items-center group/btn w-full border-t border-brand-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{status === 'submitting' ? 'Transmitting...' : 'Send Message'}</span>
              <span className="text-white/60 group-hover/btn:text-white transition-colors text-xl leading-none group-hover/btn:translate-x-1">→</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
