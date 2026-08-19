'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Copy, Check, Send, FileText, Factory, Truck, HelpCircle, Wrench, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppCommandCenterProps {
  inquiry: {
    id: string;
    tracking_uuid: string;
    contact_name: string;
    company_name?: string | null;
    phone?: string | null;
    divisions?: { display_name: string } | null;
    status?: string;
  };
  latestQuotation?: any;
}

export function WhatsAppCommandCenter({ inquiry, latestQuotation }: WhatsAppCommandCenterProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const currentStatus = inquiry.status || 'new';

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
      title: 'Pro-Forma Quotation Ready',
      desc: 'Send itemized price breakdown & live spec link',
      badge: 'Sales Priority',
      badgeClass: 'bg-blue-50 text-brand-blue border-blue-100',
      icon: FileText,
      iconColor: 'text-brand-blue bg-blue-50/80',
      targetStatus: 'quoted',
      targetStatusLabel: 'Quoted',
      message: `Hello ${inquiry.contact_name}${companyGreeting},\n\nThank you for reaching out to Prodeal Industries Ltd (${division}).\n\nYour official B2B Pro-Forma Quotation [${quotePayload.quoteNumber || trackingCode}] is ready for your review:\n👉 Total: ${quoteTotalStr}\n👉 Live Spec Sheet: ${trackingUrl}\n\nPlease review and let us know if you would like us to reserve the stock or issue an official tax invoice for payment.\n\nBest regards,\nProdeal Industries Sales Desk\nTema Heavy Industrial Area`
    },
    {
      key: 'site_survey',
      title: 'Site Technical Survey Scheduled',
      desc: 'Notify client of certified engineer inspection date',
      badge: 'Field QA',
      badgeClass: 'bg-teal-50 text-teal-700 border-teal-100',
      icon: Wrench,
      iconColor: 'text-teal-600 bg-teal-50/80',
      targetStatus: 'in_progress',
      targetStatusLabel: 'In Progress',
      message: `Hello ${inquiry.contact_name},\n\nOur technical field engineers have scheduled your on-site surface inspection for RFQ #${trackingCode} (${division}).\n\n👉 Tracking Ref: ${trackingUrl}\n\nOur certified application specialist will arrive to assess substrate moisture, surface preparation, and coating thickness requirements.\n\nProdeal Field Engineering Desk`
    },
    {
      key: 'production',
      title: 'Order in Production',
      desc: 'Confirm payment receipt & facility batching timeline',
      badge: 'Operations',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
      icon: Factory,
      iconColor: 'text-amber-600 bg-amber-50/80',
      targetStatus: 'in_progress',
      targetStatusLabel: 'In Progress',
      message: `Hello ${inquiry.contact_name},\n\nWe have received your order confirmation for RFQ #${trackingCode} (${division}).\n\nOur Tema facility has queued your consignment for batching and quality inspection.\nTrack live milestones here: ${trackingUrl}\n\nWe will notify you once loading and waybill generation commence.\n\nProdeal Operations Team`
    },
    {
      key: 'dispatched',
      title: 'Consignment Dispatched',
      desc: 'Send waybill & Tema warehouse gate pickup notice',
      badge: 'Logistics',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      icon: Truck,
      iconColor: 'text-emerald-600 bg-emerald-50/80',
      targetStatus: 'closed',
      targetStatusLabel: 'Closed',
      message: `Hello ${inquiry.contact_name},\n\nYour consignment for RFQ #${trackingCode} is now loaded and ready for haulage/pickup at our Tema warehouse.\n\n👉 Tracking & Waybill Ref: ${trackingUrl}\n\nOur logistics coordinator is on standby for gate clearance.\n\nProdeal Logistics Desk`
    },
    {
      key: 'clarification',
      title: 'Technical Clarification',
      desc: 'Confirm exact chemical grades, specs, or dimensions',
      badge: 'Technical',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-100',
      icon: HelpCircle,
      iconColor: 'text-purple-600 bg-purple-50/80',
      targetStatus: 'in_progress',
      targetStatusLabel: 'In Progress',
      message: `Hello ${inquiry.contact_name},\n\nRegarding your inquiry #${trackingCode} for Prodeal ${division}:\n\nCould you kindly confirm your preferred specifications (e.g. required surface area/volume, chemical grade, or artwork specs) so our engineers can finalize the exact quotation?\n\nBest regards,\nProdeal Technical Engineering Desk`
    }
  ];

  // Smart Contextual Priority based on active Inquiry Status
  const RECOMMENDED_ORDER_BY_STATUS: Record<string, string[]> = {
    new: ['quote_ready', 'clarification', 'site_survey', 'production', 'dispatched'],
    in_progress: ['site_survey', 'production', 'quote_ready', 'dispatched', 'clarification'],
    quoted: ['quote_ready', 'production', 'site_survey', 'dispatched', 'clarification'],
    closed: ['dispatched', 'production', 'quote_ready', 'site_survey', 'clarification']
  };

  const templateOrder = RECOMMENDED_ORDER_BY_STATUS[currentStatus] || RECOMMENDED_ORDER_BY_STATUS.new;
  const sortedTemplates = [...TEMPLATES].sort((a, b) => {
    return templateOrder.indexOf(a.key) - templateOrder.indexOf(b.key);
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('WhatsApp message copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSend = async (tmpl: typeof TEMPLATES[0]) => {
    if (!waPhone) {
      toast.error('No phone number provided for this client.');
      return;
    }
    const encoded = encodeURIComponent(tmpl.message);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');

    // Automatically sync status hand-in-hand if applicable
    if (tmpl.targetStatus && tmpl.targetStatus !== currentStatus && inquiry.id) {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: tmpl.targetStatus })
        });
        if (res.ok) {
          toast.success(`WhatsApp dispatched • Inquiry updated to ${tmpl.targetStatusLabel}`);
          router.refresh();
        }
      } catch (err) {
        console.error('Failed to update status on dispatch', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all flex flex-col space-y-4">
      {/* ── Luxury Minimalist Header (Clutter Free) ── */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-brand-deep-blue tracking-tight leading-tight">
              WhatsApp Desk
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {inquiry.phone || 'No phone recorded'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable Action Cards List (Clean Luxury Hierarchy) ── */}
      <div className="max-h-[340px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
        {sortedTemplates.map((tmpl, idx) => {
          const Icon = tmpl.icon;
          const isTopRecommended = idx === 0;

          return (
            <div
              key={tmpl.key}
              className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 ${
                isTopRecommended
                  ? 'border-brand-blue/30 bg-blue-50/20 shadow-2xs'
                  : 'border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200/80'
              }`}
            >
              {/* Card Header: Icon + Title + Status Pill */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${tmpl.iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 
                        className="text-xs font-bold text-brand-deep-blue leading-snug truncate cursor-help"
                        title={tmpl.title}
                      >
                        {tmpl.title}
                      </h4>
                      {isTopRecommended && (
                        <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-brand-blue text-white shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5" /> Recommended
                        </span>
                      )}
                    </div>
                    <p 
                      className="text-xs text-slate-500 mt-0.5 line-clamp-1 cursor-help hover:text-slate-700 transition-colors"
                      title={`${tmpl.desc}\n\n[Full Dispatch Preview]:\n${tmpl.message}`}
                    >
                      {tmpl.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Clean and uncrowded */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/70">
                <button
                  type="button"
                  onClick={() => handleCopy(tmpl.message, tmpl.key)}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-xl border border-slate-200/80 text-slate-600 hover:text-brand-deep-blue hover:bg-slate-50 active:scale-[0.97] transition-all whitespace-nowrap"
                >
                  {copiedKey === tmpl.key ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSend(tmpl)}
                  disabled={!waPhone || isSyncing}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white transition-all shadow-xs disabled:opacity-40 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
