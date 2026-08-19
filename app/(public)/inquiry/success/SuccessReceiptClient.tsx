'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ArrowRight, Check, Copy, ExternalLink, Printer } from 'lucide-react';

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

  const whatsappMessage = encodeURIComponent(
    `Hello Prodeal Sales Desk,\n\nI just submitted an inquiry on the portal.\nTracking ID: ${trackingId}\nDivision: ${divisionSlug || 'Industrial Supplies'}\n\nPlease share the formal quotation.`
  );
  const whatsappUrl = `https://wa.me/233551908713?text=${whatsappMessage}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Messaging & Navigation */}
        <div className="lg:col-span-5 flex flex-col">
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-brand-border/20">
            <Link
              href={divisionSlug && divisionSlug !== 'consolidated' ? `/divisions/${divisionSlug}` : '/'}
              className="group flex items-center gap-2 text-sm font-medium text-brand-deep-blue hover:text-brand-blue transition-colors"
            >
              <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">←</span>
              Return to Catalog
            </Link>
            <p className="text-[10px] font-mono font-bold tracking-widest text-brand-blue hidden sm:block">
              Status // Live Dispatch
            </p>
          </div>

          <h1 className="font-display font-medium text-5xl lg:text-7xl text-brand-deep-blue tracking-tight leading-none mb-6">
            Inquiry<br />Received.
          </h1>
          
          <p className="text-sm font-medium text-brand-deep-blue/80 leading-relaxed max-w-md mb-8">
            Your quotation request has been routed to our <span className="text-brand-blue font-semibold">{divisionSlug || 'procurement'}</span> sales desk. 
            An official proposal will be dispatched to your WhatsApp shortly.
          </p>

          {/* 1-Click WhatsApp Instant Handshake Callout */}
          <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider font-mono">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Priority WhatsApp Response</span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed font-light">
              Connect immediately with our active sales desk to confirm inventory reservation and expedite dispatch.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Live Thread on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
          
        </div>

        {/* RIGHT COLUMN: The Functional Receipt */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Tracking ID Block */}
          <div>
            <div className="bg-brand-surface rounded-2xl border border-brand-border/40 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden shadow-xs">
              <div className="relative z-10 w-full lg:w-auto">
                <h3 className="text-[10px] font-mono font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-2">
                  Official Tracking Reference
                </h3>
                <span className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-deep-blue tracking-wider break-all leading-none">
                  {trackingId}
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex-1 lg:flex-initial text-xs font-medium text-brand-blue bg-white hover:bg-brand-blue/5 transition-colors px-4 py-3 rounded-xl border border-brand-border/40 flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied ✓' : 'Copy ID'}</span>
                </button>

                <Link
                  href={`/track/${trackingId}`}
                  className="flex-1 lg:flex-initial text-xs font-medium text-white bg-brand-deep-blue hover:bg-brand-blue transition-colors px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Live Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <p className="text-[10px] font-mono font-medium text-brand-deep-blue/60 mt-3 ml-2">
              Save this reference ID to track live quotation status anytime without logging in.
            </p>
          </div>

          {/* Next Steps & Support Split */}
          <div className="flex flex-col sm:flex-row gap-10 pt-8 border-t border-brand-border/20">
            
            {/* Next Steps */}
            <div className="space-y-5 order-2 sm:order-1 flex-1 pt-8 sm:pt-0 border-t sm:border-t-0 border-brand-border/20">
              <h3 className="font-display font-medium text-lg text-brand-deep-blue tracking-tight">
                Fulfillment Timeline
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-bold mt-0.5 text-sm">01.</span>
                  <p className="text-xs sm:text-sm text-brand-deep-blue/80 leading-relaxed font-light">
                    Desk engineer reviews product technical requirements and inventory allocation.
                  </p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-bold mt-0.5 text-sm">02.</span>
                  <p className="text-xs sm:text-sm text-brand-deep-blue/80 leading-relaxed font-light">
                    Commercial invoice / proforma quotation is generated with wholesale rate.
                  </p>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="text-brand-blue font-mono font-bold mt-0.5 text-sm">03.</span>
                  <p className="text-xs sm:text-sm text-brand-deep-blue/80 leading-relaxed font-light">
                    Dispatch coordinated via Accra central warehouse or nationwide logistics.
                  </p>
                </li>
              </ul>
            </div>

            {/* Support & Action */}
            <div className="space-y-6 order-1 sm:order-2 flex-1 sm:pl-8 sm:border-l border-brand-border/20 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-display font-medium text-lg text-brand-deep-blue tracking-tight">
                  Direct Inquiries
                </h3>
                <div className="space-y-3">
                  <a href="tel:0551908713" className="block group p-3 bg-brand-surface rounded-xl border border-brand-border/30">
                    <span className="text-[9px] font-mono font-bold text-brand-deep-blue/50 uppercase tracking-widest block mb-0.5">
                      DIRECT DESK //
                    </span>
                    <span className="font-mono text-base font-bold text-brand-blue group-hover:underline">
                      055 190 8713
                    </span>
                  </a>
                  <a href="mailto:prodealsystems@hotmail.com" className="block group p-3 bg-brand-surface rounded-xl border border-brand-border/30">
                    <span className="text-[9px] font-mono font-bold text-brand-deep-blue/50 uppercase tracking-widest block mb-0.5">
                      EMAIL DESK //
                    </span>
                    <span className="text-xs font-semibold text-brand-blue group-hover:underline break-all">
                      prodealsystems@hotmail.com
                    </span>
                  </a>
                </div>
              </div>
              
              <Link
                href="/track"
                className="block w-full px-4 py-2.5 bg-white text-brand-deep-blue border border-brand-border/40 font-medium text-xs hover:bg-brand-surface rounded-xl transition-all text-center"
              >
                Track another quote
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
