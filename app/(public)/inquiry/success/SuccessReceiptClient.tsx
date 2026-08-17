'use client';
// Force Turbopack rebuild: Brutalist UI Applied
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessReceiptClient() {
  const searchParams = useSearchParams();
  const trackingId = searchParams.get('trackingId') || '';
  const divisionSlug = searchParams.get('divisionSlug') || '';
  
  const [copied, setCopied] = useState(false);

  if (!trackingId) {
    return (
      <div className="text-center pt-20">
        <h2 className="font-heading font-bold text-3xl text-brand-deep-blue uppercase tracking-tight mb-4">No Tracking ID Found</h2>
        <Link href="/" className="px-8 py-4 bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-xs hover:bg-brand-blue transition-colors">Return to Home</Link>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Messaging & Navigation */}
        <div className="lg:col-span-5 flex flex-col">
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-brand-deep-blue">
            <Link
              href={divisionSlug ? `/divisions/${divisionSlug}` : '/'}
              className="group flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-widest text-brand-deep-blue hover:text-brand-blue transition-colors"
            >
              <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">←</span>
              Return to Catalog
            </Link>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-brand-blue hidden sm:block">
              Status // Incoming
            </p>
          </div>

          <h1 className="font-display font-black text-5xl lg:text-7xl text-brand-deep-blue uppercase tracking-tighter leading-none mb-4">
            Inquiry<br />Received.
          </h1>
          
          <p className="text-xs md:text-sm font-mono font-bold text-brand-deep-blue uppercase tracking-widest leading-relaxed max-w-md">
            Your request has been routed to the <span className="text-brand-blue">{divisionSlug || 'appropriate'}</span> division. 
            A dedicated sales representative will contact you via WhatsApp within the next 2 hours.
          </p>
          
        </div>

        {/* RIGHT COLUMN: The Functional Receipt */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Tracking ID Block */}
          <div>
            <div className="bg-brand-deep-blue p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 w-full lg:w-auto">
                <h3 className="font-heading font-bold text-[10px] text-white uppercase tracking-[0.2em] mb-2">
                  Your Reference Tracking ID
                </h3>
                <span className="font-mono text-3xl lg:text-3xl xl:text-4xl font-bold text-white tracking-wider break-all leading-none">
                  {trackingId}
                </span>
              </div>
              
              <button
                onClick={handleCopy}
                className="relative z-10 w-full lg:w-auto shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue bg-white hover:bg-brand-surface transition-colors px-6 py-4 border-2 border-white"
              >
                {copied ? 'Copied ✓' : 'Copy ID'}
              </button>
            </div>
            <p className="text-[10px] font-mono font-bold text-brand-deep-blue uppercase tracking-[0.2em] mt-3">
              Save this code to check your inquiry status online without an account.
            </p>
          </div>

          {/* Next Steps & Support Split */}
          <div className="flex flex-col sm:flex-row gap-10 pt-8 border-t-2 border-brand-deep-blue">
            
            {/* Next Steps (Deferred on mobile) */}
            <div className="space-y-5 order-2 sm:order-1 flex-1 pt-8 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
              <h3 className="font-heading font-bold text-xs text-brand-deep-blue uppercase tracking-widest">
                Next Steps
              </h3>
              <ul className="space-y-5">
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-bold mt-0.5 text-sm">01.</span>
                  <p className="text-xs font-mono font-bold text-brand-deep-blue uppercase tracking-[0.1em] leading-relaxed">
                    Our team reviews your requirements and checks inventory.
                  </p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-bold mt-0.5 text-sm">02.</span>
                  <p className="text-xs font-mono font-bold text-brand-deep-blue uppercase tracking-[0.1em] leading-relaxed">
                    We prepare a formal quotation based on your request.
                  </p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-bold mt-0.5 text-sm">03.</span>
                  <p className="text-xs font-mono font-bold text-brand-deep-blue uppercase tracking-[0.1em] leading-relaxed">
                    You receive the quote directly on WhatsApp to proceed.
                  </p>
                </li>
              </ul>
            </div>

            {/* Support & Action (Prioritized on mobile) */}
            <div className="space-y-8 order-1 sm:order-2 flex-1 sm:pl-8 sm:border-l-2 border-brand-deep-blue flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="font-heading font-bold text-xs text-brand-deep-blue uppercase tracking-widest">
                  Need immediate assistance?
                </h3>
                <div className="space-y-5">
                  <a href="tel:0551908713" className="block group">
                    <span className="font-mono text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest block mb-1">
                      TEL //
                    </span>
                    <span className="font-mono text-2xl lg:text-3xl font-bold text-brand-blue group-hover:underline transition-all">
                      055 190 8713
                    </span>
                  </a>
                  <a href="mailto:prodealsystems@hotmail.com" className="block group">
                    <span className="font-mono text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest block mb-1">
                      EMAIL //
                    </span>
                    <span className="font-mono text-sm lg:text-base font-bold text-brand-blue group-hover:underline transition-all break-all">
                      prodealsystems@hotmail.com
                    </span>
                  </a>
                </div>
              </div>
              
              <Link
                href="/track"
                className="block w-full px-6 py-4 bg-transparent text-brand-deep-blue border-2 border-brand-deep-blue font-heading font-bold uppercase tracking-widest text-xs hover:bg-brand-deep-blue hover:text-white transition-all text-center"
              >
                Track another inquiry
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
