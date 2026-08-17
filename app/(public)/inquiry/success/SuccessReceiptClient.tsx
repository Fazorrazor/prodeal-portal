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
        <h2 className="font-display font-medium text-3xl text-brand-deep-blue tracking-tight mb-4">No Tracking ID Found</h2>
        <Link href="/" className="px-6 py-3 bg-brand-blue text-white font-medium text-sm rounded-md hover:bg-brand-deep-blue transition-colors shadow-sm">Return to Home</Link>
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
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-border/20">
            <Link
              href={divisionSlug ? `/divisions/${divisionSlug}` : '/'}
              className="group flex items-center gap-2 text-sm font-medium text-brand-deep-blue hover:text-brand-blue transition-colors"
            >
              <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">←</span>
              Return to Catalog
            </Link>
            <p className="text-[10px] font-mono font-medium tracking-widest text-brand-blue hidden sm:block">
              Status // Incoming
            </p>
          </div>

          <h1 className="font-display font-medium text-5xl lg:text-7xl text-brand-deep-blue tracking-tight leading-none mb-6">
            Inquiry<br />Received.
          </h1>
          
          <p className="text-sm font-medium text-brand-deep-blue/80 leading-relaxed max-w-md">
            Your request has been routed to the <span className="text-brand-blue">{divisionSlug || 'appropriate'}</span> division. 
            A dedicated sales representative will contact you via WhatsApp within the next 2 hours.
          </p>
          
        </div>

        {/* RIGHT COLUMN: The Functional Receipt */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Tracking ID Block */}
          <div>
            <div className="bg-brand-surface rounded-xl border border-brand-border/40 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 w-full lg:w-auto">
                <h3 className="text-[10px] font-mono font-medium text-brand-deep-blue/60 uppercase tracking-widest mb-2">
                  Your Reference Tracking ID
                </h3>
                <span className="font-mono text-3xl lg:text-3xl xl:text-4xl font-medium text-brand-deep-blue tracking-wider break-all leading-none">
                  {trackingId}
                </span>
              </div>
              
              <button
                onClick={handleCopy}
                className="relative z-10 w-full lg:w-auto shrink-0 text-xs font-medium text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors px-5 py-3 rounded-md border border-brand-blue/20"
              >
                {copied ? 'Copied ✓' : 'Copy ID'}
              </button>
            </div>
            <p className="text-[10px] font-mono font-medium text-brand-deep-blue/60 mt-3 ml-2">
              Save this code to check your inquiry status online without an account.
            </p>
          </div>

          {/* Next Steps & Support Split */}
          <div className="flex flex-col sm:flex-row gap-10 pt-8 border-t border-brand-border/20">
            
            {/* Next Steps (Deferred on mobile) */}
            <div className="space-y-5 order-2 sm:order-1 flex-1 pt-8 sm:pt-0 border-t sm:border-t-0 border-brand-border/20">
              <h3 className="font-display font-medium text-lg text-brand-deep-blue tracking-tight">
                Next Steps
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-medium mt-0.5 text-sm">01.</span>
                  <p className="text-sm text-brand-deep-blue/80 leading-relaxed">
                    Our team reviews your requirements and checks inventory.
                  </p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-medium mt-0.5 text-sm">02.</span>
                  <p className="text-sm text-brand-deep-blue/80 leading-relaxed">
                    We prepare a formal quotation based on your request.
                  </p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-medium mt-0.5 text-sm">03.</span>
                  <p className="text-sm text-brand-deep-blue/80 leading-relaxed">
                    You receive the quote directly on WhatsApp to proceed.
                  </p>
                </li>
              </ul>
            </div>

            {/* Support & Action (Prioritized on mobile) */}
            <div className="space-y-8 order-1 sm:order-2 flex-1 sm:pl-8 sm:border-l border-brand-border/20 flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="font-display font-medium text-lg text-brand-deep-blue tracking-tight">
                  Need immediate assistance?
                </h3>
                <div className="space-y-5">
                  <a href="tel:0551908713" className="block group">
                    <span className="text-[10px] font-mono font-medium text-brand-deep-blue/60 uppercase tracking-widest block mb-1">
                      TEL //
                    </span>
                    <span className="font-mono text-xl lg:text-2xl font-medium text-brand-blue group-hover:underline transition-all">
                      055 190 8713
                    </span>
                  </a>
                  <a href="mailto:prodealsystems@hotmail.com" className="block group">
                    <span className="text-[10px] font-mono font-medium text-brand-deep-blue/60 uppercase tracking-widest block mb-1">
                      EMAIL //
                    </span>
                    <span className="text-sm lg:text-base font-medium text-brand-blue group-hover:underline transition-all break-all">
                      prodealsystems@hotmail.com
                    </span>
                  </a>
                </div>
              </div>
              
              <Link
                href="/track"
                className="block w-full px-5 py-3 bg-white text-brand-deep-blue border border-brand-border/40 font-medium text-sm hover:bg-brand-surface rounded-md transition-all text-center shadow-sm"
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
