'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  Copy,
  Check,
  Send,
  FileText,
  Factory,
  Truck,
  HelpCircle,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeWhatsAppText } from '../../lib/security';

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

export function WhatsAppCommandCenter({
  inquiry,
  latestQuotation,
}: WhatsAppCommandCenterProps) {
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
  const division = sanitizeWhatsAppText(
    inquiry.divisions?.display_name || 'Industrial Supplies',
    80
  );
  const safeContactName = sanitizeWhatsAppText(inquiry.contact_name, 100) || 'Valued Client';
  const safeCompany = inquiry.company_name
    ? sanitizeWhatsAppText(inquiry.company_name, 120)
    : '';
  const companyGreeting = safeCompany ? ` (${safeCompany})` : '';

  const quotePayload = latestQuotation?.payload || {};
  const quoteTotalStr = quotePayload.totalAmount
    ? `₵${Number(quotePayload.totalAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
      })} GHS`
    : 'as attached';

  const TEMPLATES = [
    {
      key: 'quote_ready',
      title: 'Pro-Forma Quotation Ready',
      desc: 'Send itemized price breakdown and quotation summary',
      icon: FileText,
      targetStatus: 'quoted',
      targetStatusLabel: 'Quoted',
      message: `Hello ${safeContactName}${companyGreeting},\n\nThank you for reaching out to Prodeal Industries Ltd (${division}).\n\nYour official Pro-Forma Quotation [${quotePayload.quoteNumber || trackingCode}] is ready for your review:\n- Total: ${quoteTotalStr}\n- Reference ID: #${trackingCode}\n\nPlease review and let us know if you would like us to reserve the stock or issue an official tax invoice for payment.\n\nBest regards,\nProdeal Industries Sales Desk\nTema Heavy Industrial Area`,
    },
    {
      key: 'site_survey',
      title: 'Site Technical Survey Scheduled',
      desc: 'Notify client of certified engineer inspection date',
      icon: Wrench,
      targetStatus: 'in_progress',
      targetStatusLabel: 'In Progress',
      message: `Hello ${safeContactName},\n\nOur technical field engineers have scheduled your on-site surface inspection for Inquiry #${trackingCode} (${division}).\n\nOur certified application specialist will arrive to assess substrate moisture, surface preparation, and coating thickness requirements.\n\nProdeal Field Engineering Desk`,
    },
    {
      key: 'production',
      title: 'Order in Production',
      desc: 'Confirm payment receipt and facility batching timeline',
      icon: Factory,
      targetStatus: 'in_progress',
      targetStatusLabel: 'In Progress',
      message: `Hello ${safeContactName},\n\nWe have received your order confirmation for Inquiry #${trackingCode} (${division}).\n\nOur Tema facility has queued your consignment for batching and quality inspection.\n\nWe will notify you once loading and waybill generation commence.\n\nProdeal Operations Team`,
    },
    {
      key: 'dispatched',
      title: 'Consignment Dispatched',
      desc: 'Send waybill and Tema warehouse pickup notice',
      icon: Truck,
      targetStatus: 'closed',
      targetStatusLabel: 'Closed',
      message: `Hello ${safeContactName},\n\nYour consignment for Inquiry #${trackingCode} is now loaded and ready for haulage/pickup at our Tema warehouse.\n\n- Dispatch Ref: #${trackingCode}\n\nOur logistics coordinator is on standby for gate clearance.\n\nProdeal Logistics Desk`,
    },
    {
      key: 'clarification',
      title: 'Technical Clarification',
      desc: 'Confirm chemical grades, quantities, or specs',
      icon: HelpCircle,
      targetStatus: 'in_progress',
      targetStatusLabel: 'In Progress',
      message: `Hello ${safeContactName},\n\nRegarding your inquiry #${trackingCode} for Prodeal ${division}:\n\nCould you kindly confirm your preferred specifications (e.g. required surface area/volume, chemical grade, or artwork specs) so our engineers can finalize the exact quotation?\n\nBest regards,\nProdeal Technical Engineering Desk`,
    },
  ];

  const RECOMMENDED_ORDER_BY_STATUS: Record<string, string[]> = {
    new: ['quote_ready', 'clarification', 'site_survey', 'production', 'dispatched'],
    in_progress: ['site_survey', 'production', 'quote_ready', 'dispatched', 'clarification'],
    quoted: ['quote_ready', 'production', 'site_survey', 'dispatched', 'clarification'],
    closed: ['dispatched', 'production', 'quote_ready', 'site_survey', 'clarification'],
  };

  const templateOrder =
    RECOMMENDED_ORDER_BY_STATUS[currentStatus] || RECOMMENDED_ORDER_BY_STATUS.new;
  const sortedTemplates = [...TEMPLATES].sort(
    (a, b) => templateOrder.indexOf(a.key) - templateOrder.indexOf(b.key)
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('WhatsApp message copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSend = async (tmpl: (typeof TEMPLATES)[0]) => {
    if (!waPhone) {
      toast.error('No phone number provided for this client.');
      return;
    }
    const encoded = encodeURIComponent(tmpl.message);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');

    if (tmpl.targetStatus && tmpl.targetStatus !== currentStatus && inquiry.id) {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: tmpl.targetStatus }),
        });
        if (res.ok) {
          toast.success(`WhatsApp opened · Status updated to ${tmpl.targetStatusLabel}`);
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
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            WhatsApp Desk
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400 truncate">
          {inquiry.phone || 'No phone'}
        </span>
      </div>

      <div className="p-4 max-h-[360px] overflow-y-auto space-y-2.5">
        {sortedTemplates.map((tmpl, idx) => {
          const Icon = tmpl.icon;
          const isSuggested = idx === 0;

          return (
            <div
              key={tmpl.key}
              className={`p-3.5 rounded-lg border transition-colors duration-150 space-y-3 ${
                isSuggested
                  ? 'border-[#1A56DB]/25 bg-slate-50/70'
                  : 'border-slate-200/70 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className="text-xs font-semibold text-[#0A1628] truncate cursor-help"
                      title={tmpl.title}
                    >
                      {tmpl.title}
                    </h3>
                    {isSuggested && (
                      <span className="text-[10px] font-medium text-[#1A56DB] shrink-0">
                        Next step
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs text-slate-500 mt-0.5 line-clamp-1 cursor-help"
                    title={`${tmpl.desc}\n\n[Preview]\n${tmpl.message}`}
                  >
                    {tmpl.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopy(tmpl.message, tmpl.key)}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 text-xs font-medium rounded-lg border border-slate-200/90 bg-white text-slate-600 hover:text-[#0A1628] hover:bg-slate-50 transition-[background-color,color,transform] duration-150 active:scale-[0.98] whitespace-nowrap cursor-pointer"
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
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-40 whitespace-nowrap cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Dispatch</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
