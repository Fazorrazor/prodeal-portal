'use client';

import { useState } from 'react';
import { MessageCircle, Copy, Check, ExternalLink, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppCommandCenterProps {
  inquiry: {
    tracking_uuid: string;
    contact_name: string;
    company_name?: string | null;
    phone?: string | null;
    divisions?: { display_name: string } | null;
  };
  latestQuotation?: any;
}

export function WhatsAppCommandCenter({ inquiry, latestQuotation }: WhatsAppCommandCenterProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Clean and format phone for WhatsApp international format (e.g. 0244... -> 233244...)
  const rawPhone = (inquiry.phone || '').replace(/[^0-9+]/g, '');
  let waPhone = rawPhone.replace('+', '');
  if (waPhone.startsWith('0')) {
    waPhone = '233' + waPhone.substring(1);
  }

  const trackingCode = inquiry.tracking_uuid.substring(0, 8).toUpperCase();
  const trackingUrl = `https://www.prodealindustries.com/track/${inquiry.tracking_uuid}`;
  const division = inquiry.divisions?.display_name || 'Industrial Supplies';
  const companyGreeting = inquiry.company_name ? ` (${inquiry.company_name})` : '';

  const quotePayload = latestQuotation?.payload || {};
  const quoteTotalStr = quotePayload.totalAmount 
    ? `₵${Number(quotePayload.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} GHS`
    : 'as attached';

  const TEMPLATES = [
    {
      key: 'quote_ready',
      title: '📋 Official Pro-Forma Quote Ready',
      desc: 'Send itemized price breakdown and tracking link',
      badge: 'Sales Priority',
      badgeColor: 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
      message: `Hello ${inquiry.contact_name}${companyGreeting},\n\nThank you for reaching out to Prodeal Industries Ltd (${division}).\n\nYour official B2B Pro-Forma Quotation [${quotePayload.quoteNumber || trackingCode}] is ready for your review:\n👉 Total: ${quoteTotalStr}\n👉 Live Spec Sheet: ${trackingUrl}\n\nPlease review and let us know if you would like us to reserve the stock or issue an official tax invoice for payment.\n\nBest regards,\nProdeal Industries Sales Desk\nTema Heavy Industrial Area`
    },
    {
      key: 'production',
      title: '🏭 Order Confirmed / In Production',
      desc: 'Confirm payment receipt and dispatch timeline',
      badge: 'Operations',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
      message: `Hello ${inquiry.contact_name},\n\nWe have received your order confirmation for RFQ #${trackingCode} (${division}).\n\nOur Tema facility has queued your consignment for batching and quality inspection.\nTrack live milestones here: ${trackingUrl}\n\nWe will notify you once loading and waybill generation commence.\n\nProdeal Operations Team`
    },
    {
      key: 'dispatched',
      title: '🚚 Consignment Dispatched / Ready',
      desc: 'Send waybill and gate pickup notice',
      badge: 'Logistics',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
      message: `Hello ${inquiry.contact_name},\n\nYour consignment for RFQ #${trackingCode} is now loaded and ready for haulage/pickup at our Tema warehouse.\n\n👉 Tracking & Waybill Ref: ${trackingUrl}\n\nOur logistics coordinator is on standby for gate clearance.\n\nProdeal Logistics Desk`
    },
    {
      key: 'clarification',
      title: '🧪 Request Technical Clarification',
      desc: 'Inquire about exact specs, dimensions, or volumes',
      badge: 'Technical',
      badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
      message: `Hello ${inquiry.contact_name},\n\nRegarding your inquiry #${trackingCode} for Prodeal ${division}:\n\nCould you kindly confirm your preferred specifications (e.g. required surface area/volume, chemical grade, or artwork specs) so our engineers can finalize the exact quotation?\n\nBest regards,\nProdeal Technical Engineering Desk`
    }
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('WhatsApp message copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSend = (text: string) => {
    if (!waPhone) {
      toast.error('No phone number provided for this client.');
      return;
    }
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-white border-2 border-brand-deep-blue p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between pb-4 border-b-2 border-brand-border/60 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#25D366]/10 text-[#25D366]">
            <MessageCircle className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-heading font-bold text-brand-deep-blue tracking-tight uppercase">
            WhatsApp Command Center
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-brand-deep-blue/70">
          Target: {inquiry.phone || 'No phone'}
        </span>
      </div>

      <div className="space-y-3">
        {TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.key}
            className="p-3.5 border border-brand-border/60 hover:border-brand-deep-blue transition-all bg-brand-surface/40 flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold font-heading text-brand-deep-blue">{tmpl.title}</span>
                  <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border ${tmpl.badgeColor}`}>
                    {tmpl.badge}
                  </span>
                </div>
                <p className="text-[11px] font-body text-brand-deep-blue/70 leading-snug">{tmpl.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border/30">
              <button
                type="button"
                onClick={() => handleCopy(tmpl.message, tmpl.key)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase border border-brand-border/80 text-brand-deep-blue/80 hover:text-brand-deep-blue hover:bg-black/5 transition-colors"
              >
                {copiedKey === tmpl.key ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSend(tmpl.message)}
                disabled={!waPhone}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors shadow-[1px_1px_0px_rgba(0,0,0,0.1)] disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Dispatch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
