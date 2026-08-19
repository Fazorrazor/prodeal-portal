'use client';

import { useState, useEffect } from 'react';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Printer, MessageSquare, ExternalLink, PackageCheck, FileText, CheckCircle2, ShieldCheck, Wrench } from 'lucide-react';

type TrackingStatus = 'new' | 'in_progress' | 'quoted' | 'closed' | 'cancelled';

interface InquiryMeta {
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  companyName?: string | null;
  divisionName?: string;
  divisionSlug?: string;
  payload?: any;
  quotationData?: any;
}

interface TrackingTimelineProps {
  trackingId: string;
  status: TrackingStatus;
  createdAt: string;
  updatedAt: string;
  inquiryData?: InquiryMeta;
}

const STEPS: { id: TrackingStatus; label: string; desc: string }[] = [
  { id: 'new', label: 'RECEIVED', desc: 'Inquiry registered & logged' },
  { id: 'in_progress', label: 'UNDER REVIEW', desc: 'Assigned agent verifying inventory & rates' },
  { id: 'quoted', label: 'QUOTE DISPATCHED', desc: 'Official quotation prepared' },
  { id: 'closed', label: 'FINALIZED', desc: 'Fulfillment & dispatch confirmed' },
];

export function TrackingTimeline({ 
  trackingId, 
  status: initialStatus, 
  updatedAt: initialUpdatedAt,
  createdAt,
  inquiryData 
}: TrackingTimelineProps) {
  const [currentStatus, setCurrentStatus] = useState<TrackingStatus>(initialStatus);
  const [currentUpdatedAt, setCurrentUpdatedAt] = useState<string>(initialUpdatedAt);
  const supabase = createClientComponentClient();
  
  const { displayText } = useScrambleText(trackingId, 200, 1000);
  
  useEffect(() => {
    const channel = supabase
      .channel(`public:inquiries:${trackingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inquiries',
          filter: `tracking_uuid=eq.${trackingId}`,
        },
        (payload) => {
          if (payload.new) {
            setCurrentStatus(payload.new.status as TrackingStatus);
            if (payload.new.updated_at) {
              setCurrentUpdatedAt(payload.new.updated_at);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, trackingId]);

  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = STEPS.findIndex(s => s.id === currentStatus);

  const whatsappMessage = encodeURIComponent(
    `Hello Prodeal Sales Desk,\n\nFollowing up on my active quote.\nTracking ID: ${trackingId}\nCurrent Status: ${currentStatus.toUpperCase()}\n\nPlease provide an update on availability and delivery timeline.`
  );
  const whatsappUrl = `https://wa.me/233551908713?text=${whatsappMessage}`;

  const payload = inquiryData?.payload || {};
  const items: any[] = Array.isArray(payload.items) ? payload.items : [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-4 pb-12">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border/20 print:hidden">
        <Link 
          href="/track" 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-deep-blue/60 hover:text-brand-blue transition-colors group"
        >
          <span className="text-base leading-none mb-[2px] group-hover:-translate-x-1 transition-transform">←</span> 
          BACK TO SEARCH
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-border/40 text-brand-deep-blue hover:bg-brand-surface rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-brand-blue" />
          <span>Print Spec Sheet (PDF)</span>
        </button>
      </div>

      {/* Main Reference Card */}
      <div className="bg-white rounded-2xl border border-brand-border/30 p-6 md:p-8 shadow-xs mb-8">
        
        {/* Printable Official Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-brand-border/20">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-blue block mb-1">
              PRODEAL INDUSTRIES LTD // B2B PROCUREMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-brand-deep-blue">
              Quotation Specification Sheet
            </h1>
            <p className="text-xs text-brand-deep-blue/60 mt-1 font-light">
              Service: <span className="font-semibold text-brand-deep-blue">{inquiryData?.divisionName || 'Industrial Division'}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/50 block mb-1">
              Tracking UUID
            </span>
            <p className="font-mono text-xl sm:text-2xl font-bold text-brand-deep-blue tracking-wider">
              {displayText}
            </p>
            <span className="text-[10px] text-brand-deep-blue/60 font-mono block mt-1">
              Logged: {format(new Date(createdAt), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
        </div>

        {/* Client & Organization Context */}
        {inquiryData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-brand-border/20 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-brand-deep-blue/50 block mb-0.5">Procurement Contact</span>
              <p className="font-semibold text-brand-deep-blue">{inquiryData.contactName || 'Valued Client'}</p>
              {inquiryData.companyName && (
                <p className="text-brand-deep-blue/70 font-light">{inquiryData.companyName}</p>
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-brand-deep-blue/50 block mb-0.5">Contact Channel</span>
              <p className="font-mono text-brand-deep-blue">{inquiryData.contactPhone || '-'}</p>
              <p className="text-brand-deep-blue/70 font-light truncate">{inquiryData.contactEmail || '-'}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-brand-deep-blue/50 block mb-0.5">Current Phase</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                {currentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Itemized Specification Table */}
        {items.length > 0 ? (
          <div className="py-5 border-b border-brand-border/20">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-deep-blue/70 mb-3">
              Requested Product Specifications ({items.length} Item{items.length > 1 ? 's' : ''})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/30 bg-brand-surface text-brand-deep-blue/70">
                    <th className="py-2.5 px-3 font-semibold">SKU / Item</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Quantity</th>
                    <th className="py-2.5 px-3 font-semibold">Packaging / Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-brand-surface/50">
                      <td className="py-2.5 px-3 font-medium text-brand-deep-blue">{it.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-brand-blue">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-brand-deep-blue/70 font-light">
                        {it.unit || 'Standard'} {it.notes ? `— ${it.notes}` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : payload.productName ? (
          <div className="py-5 border-b border-brand-border/20">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-deep-blue/70 mb-2">
              Requested Formulation / Service
            </h3>
            <p className="text-sm font-semibold text-brand-deep-blue">{payload.productName}</p>
            {payload.message && (
              <p className="text-xs text-brand-deep-blue/70 mt-1 whitespace-pre-wrap font-light">{payload.message}</p>
            )}
          </div>
        ) : null}

        {/* Official Pro-Forma Invoice (If Issued) */}
        {inquiryData?.quotationData && (
          <div className="py-6 border-b-2 border-brand-deep-blue my-2 bg-brand-surface/60 p-5 -mx-6 md:-mx-8 border-x-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-brand-border/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-brand-blue text-white px-2 py-0.5">
                    Official Pro-Forma Invoice
                  </span>
                  <span className="text-xs font-mono font-bold text-brand-deep-blue">
                    #{inquiryData.quotationData.quoteNumber}
                  </span>
                </div>
                <p className="text-[11px] font-body text-brand-deep-blue/70 mt-1">
                  Issued by Prodeal Industries Ltd • Valid for {inquiryData.quotationData.validityDays || 14} days
                </p>
              </div>
              <button
                onClick={() => window.print()}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-deep-blue/40 text-[10px] font-mono font-bold uppercase text-brand-deep-blue hover:bg-black/5 transition-colors print:hidden shadow-xs"
              >
                <Printer className="w-3 h-3" />
                Print Pro-Forma
              </button>
            </div>

            {/* Price Breakdown Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-brand-border/60 text-[10px] uppercase tracking-wider text-brand-deep-blue/70">
                    <th className="py-2 px-2">Item</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                    <th className="py-2 px-2 text-right">Total (GHS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {(inquiryData.quotationData.items || []).map((it: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 font-medium text-brand-deep-blue">{it.description}</td>
                      <td className="py-2 px-2 text-center text-brand-blue font-bold">{it.quantity} {it.unit || ''}</td>
                      <td className="py-2 px-2 text-right text-brand-deep-blue/80">₵{Number(it.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-right font-bold text-brand-deep-blue">₵{Number(it.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotals & Grand Total */}
            <div className="flex flex-col items-end gap-1 font-mono text-xs pt-3 border-t border-brand-border/40">
              <div className="flex justify-between w-64 text-brand-deep-blue/70">
                <span>Subtotal:</span>
                <span>₵{Number(inquiryData.quotationData.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {Number(inquiryData.quotationData.discountAmount || 0) > 0 && (
                <div className="flex justify-between w-64 text-brand-red">
                  <span>Discount:</span>
                  <span>-₵{Number(inquiryData.quotationData.discountAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {Number(inquiryData.quotationData.taxAmount || 0) > 0 && (
                <div className="flex justify-between w-64 text-brand-deep-blue/70 text-[11px]">
                  <span>VAT & Statutory Levies:</span>
                  <span>₵{Number(inquiryData.quotationData.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {Number(inquiryData.quotationData.freightAmount || 0) > 0 && (
                <div className="flex justify-between w-64 text-brand-deep-blue/70 text-[11px]">
                  <span>Haulage / Logistics:</span>
                  <span>₵{Number(inquiryData.quotationData.freightAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between w-64 pt-2 border-t-2 border-brand-deep-blue text-sm font-bold text-brand-deep-blue">
                <span>Grand Total:</span>
                <span className="text-brand-blue">₵{Number(inquiryData.quotationData.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} GHS</span>
              </div>
            </div>

            {/* Official Settlement Channels */}
            <div className="mt-5 p-3.5 bg-white border border-brand-border/60 text-[10px] font-mono grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-brand-deep-blue uppercase tracking-widest block mb-0.5">Bank Wire Details</span>
                <p className="text-brand-deep-blue/80">Ecobank Ghana: <strong className="text-brand-deep-blue">1441002938192</strong></p>
                <p className="text-brand-deep-blue/80">Stanbic Bank: <strong className="text-brand-deep-blue">9040003920194</strong></p>
              </div>
              <div>
                <span className="font-bold text-brand-deep-blue uppercase tracking-widest block mb-0.5">Mobile Money Settlement</span>
                <p className="text-brand-deep-blue/80">MTN MoMo Merchant: <strong className="text-brand-deep-blue">639201</strong></p>
                <p className="text-brand-deep-blue/60">Account Name: Prodeal Industries Ltd</p>
              </div>
            </div>
          </div>
        )}

        {/* Turnkey Installation & Warranty Guarantee Banner (If Included) */}
        {(JSON.stringify(payload).toLowerCase().includes('installation') ||
          JSON.stringify(inquiryData?.quotationData || {}).toLowerCase().includes('application') ||
          JSON.stringify(inquiryData?.quotationData || {}).toLowerCase().includes('labor')) && (
          <div className="my-6 p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-emerald-950">
                  Certified Prodeal Turnkey Installation & Workmanship Warranty
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                  5-Year Guaranteed
                </span>
              </div>
              <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                This project includes certified on-site surface preparation, precision chemical application, and comprehensive post-curing moisture/leak inspection by Prodeal factory engineers.
              </p>
            </div>
          </div>
        )}

        {/* Live Timeline Component */}
        <div className="pt-6">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-deep-blue/70 mb-6">
            Live Processing Pipeline
          </h3>

          {isCancelled ? (
            <div className="border-l-[3px] border-red-500 pl-6 py-4 bg-red-50/50 rounded-r-md">
              <h2 className="text-lg font-display font-medium text-red-600 tracking-tight mb-1">
                Inquiry Cancelled
              </h2>
              <p className="text-xs text-brand-deep-blue/80 font-light">
                This inquiry has been closed. Contact support if you need to reactivate this request.
              </p>
            </div>
          ) : (
            <div className="relative pl-2">
              <div className="absolute left-[17px] top-4 bottom-8 w-0.5 bg-brand-border/40 z-0 hidden md:block" />

              <div className="flex flex-col gap-6 relative z-10">
                {STEPS.map((step, index) => {
                  const isActive = index === currentIndex;
                  const isPast = index < currentIndex;
                  
                  return (
                    <div key={step.id} className="flex gap-4 md:gap-6 items-start">
                      <div className="flex flex-col items-center mt-0.5">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full border transition-all 
                            ${isActive ? 'border-brand-blue bg-brand-blue text-white shadow-sm' : 
                              isPast ? 'border-emerald-600 bg-emerald-600 text-white' : 
                              'border-brand-border/60 bg-white text-brand-deep-blue/30'}`}
                        >
                          {isPast ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isActive ? (
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          ) : (
                            <span className="text-[10px] font-mono">{index + 1}</span>
                          )}
                        </motion.div>
                      </div>
                      
                      <div className="flex-1 pb-4 border-b border-brand-border/20 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-semibold tracking-tight ${
                            isActive ? 'text-brand-blue' : isPast ? 'text-brand-deep-blue' : 'text-brand-deep-blue/50'
                          }`}>
                            {step.label}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-mono text-brand-blue font-bold tracking-widest uppercase">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-deep-blue/70 font-light mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Direct WhatsApp Follow-up Bar (Hidden during print) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden shadow-xs">
        <div>
          <h4 className="font-display font-medium text-base text-emerald-950 mb-0.5">
            Need urgent quote confirmation?
          </h4>
          <p className="text-xs text-emerald-900/80 font-light">
            Connect directly with our desk agent handling tracking ref <code className="font-bold">{trackingId}</code>.
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] whitespace-nowrap"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message Desk on WhatsApp</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

    </div>
  );
}
