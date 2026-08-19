import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Clock, Paperclip, Building2, User, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { createServer } from '../../../../../lib/supabase/server';
import { StatusUpdater } from '../../../../../components/admin/StatusUpdater';
import { InquiryPayloadViewer } from '../../../../../components/admin/InquiryPayloadViewer';
import { DivisionErrorBoundary } from '../../../../../components/shared/DivisionErrorBoundary';
import { DeleteInquiryButton } from '../../../../../components/admin/DeleteInquiryButton';
import { QuotationBuilder } from '../../../../../components/admin/QuotationBuilder';
import { WhatsAppCommandCenter } from '../../../../../components/admin/WhatsAppCommandCenter';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function TicketDetail({ id }: { id: string }) {
  const supabase = await createServer() as any;

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      divisions (
        display_name,
        type,
        slug
      ),
      inquiry_events (
        event_type,
        payload,
        created_at
      )
    `)
    .eq('id', id)
    .single();

  if (error || !inquiry) {
    if (error?.code === 'PGRST116') return notFound();
    throw new Error(`Supabase Error: ${error?.message}`);
  }

  const events = inquiry.inquiry_events?.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || [];

  const latestQuotation = events.find((e: any) => e.event_type === 'quotation_generated');

  return (
    <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl pt-2 pb-24">
      
      {/* ── Top Header & Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/tickets"
            className="p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors text-slate-500 hover:text-brand-deep-blue shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-deep-blue tracking-tight leading-none">
                {inquiry.tracking_uuid.substring(0, 8).toUpperCase()}
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                {inquiry.divisions?.display_name || 'Industrial'}
              </span>
            </div>
            <p className="text-slate-400 font-mono text-xs">
              Logged {format(new Date(inquiry.created_at), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <StatusUpdater inquiryId={inquiry.id} currentStatus={inquiry.status} />
        </div>
      </div>

      {/* ── Section 1: Context & Operations Grid (Client Specs + WhatsApp + Timeline) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        
        {/* Left 2 Columns: Client Profile & Inquiry Specifications */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Client Details Card */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Client & Enterprise Profile
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200/60 text-slate-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Contact Person</span>
                  <p className="text-sm font-semibold text-brand-deep-blue">{inquiry.contact_name}</p>
                </div>
              </div>

              {inquiry.company_name ? (
                <div className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 text-slate-400 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Company Account</span>
                    <p className="text-sm font-semibold text-brand-deep-blue cursor-help" title={inquiry.company_name}>
                      {inquiry.company_name}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200/60 text-slate-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Email Address</span>
                  <a 
                    href={`mailto:${inquiry.contact_email}`} 
                    className="text-xs sm:text-sm font-semibold text-brand-blue hover:underline truncate block cursor-help"
                    title={inquiry.contact_email || 'Not provided'}
                  >
                    {inquiry.contact_email || 'Not provided'}
                  </a>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-100/80 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 text-slate-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">WhatsApp / Phone</span>
                    <p className="text-sm font-semibold text-brand-deep-blue font-mono">{inquiry.contact_phone || 'N/A'}</p>
                  </div>
                </div>
                {inquiry.contact_phone && (
                  <a 
                    href={`https://wa.me/${inquiry.contact_phone?.replace(/\D/g, '')}?text=Hi ${encodeURIComponent(inquiry.contact_name)}, regarding your Prodeal inquiry (${inquiry.tracking_uuid.substring(0,8)}):`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Payload Viewer */}
          <InquiryPayloadViewer payload={inquiry.inquiry_payload} />

          {/* Attachments (if any) */}
          {inquiry.attachments && Array.isArray(inquiry.attachments) && inquiry.attachments.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5" /> Client Attachments
              </h2>
              <div className="flex flex-wrap gap-3">
                {inquiry.attachments.map((file: any, i: number) => (
                  <a 
                    key={i} 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-semibold text-brand-deep-blue transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    {file.name || `Document #${i + 1}`}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right 1 Column: WhatsApp Command Center & Timeline */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* WhatsApp Command Center (Automated Hand-in-Hand with Status) */}
          <WhatsAppCommandCenter
            inquiry={{
              id: inquiry.id,
              tracking_uuid: inquiry.tracking_uuid,
              contact_name: inquiry.contact_name,
              company_name: inquiry.company_name,
              phone: inquiry.contact_phone,
              divisions: inquiry.divisions,
              status: inquiry.status
            }}
            latestQuotation={latestQuotation}
          />

          {/* Activity Timeline Card */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Audit Activity Timeline
            </h2>
            
            <div className="space-y-5 relative pl-3">
              <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-slate-100" />

              {events.map((event: any, i: number) => (
                <div 
                  key={event.created_at} 
                  className="relative flex items-start gap-4"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-brand-blue border-2 border-white shadow-2xs shrink-0 mt-0.5 z-10" />
                  <div>
                    <p className="text-xs font-semibold text-brand-deep-blue capitalize leading-snug">
                      {event.event_type === 'status_changed' && event.payload?.new_status
                        ? `Status Changed To ${event.payload.new_status.replace('_', ' ')}`
                        : event.event_type === 'quotation_generated'
                        ? `Quote Issued (${event.payload?.quoteNumber || '₵' + event.payload?.totalAmount})`
                        : event.event_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {format(new Date(event.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}

              <div className="relative flex items-start gap-4">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-300 border-2 border-white shrink-0 mt-0.5 z-10" />
                <div>
                  <p className="text-xs font-semibold text-slate-600 leading-snug">Inquiry Submitted</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {format(new Date(inquiry.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ── Section 2: Full-Width B2B Pro-Forma Quotation Builder (Fills the entire space across both columns) ── */}
      <div className="w-full">
        <QuotationBuilder
          inquiry={{
            id: inquiry.id,
            tracking_uuid: inquiry.tracking_uuid,
            contact_name: inquiry.contact_name,
            company_name: inquiry.company_name,
            phone: inquiry.contact_phone,
            email: inquiry.contact_email,
            inquiry_payload: inquiry.inquiry_payload,
            divisions: inquiry.divisions,
            created_at: inquiry.created_at
          }}
          existingQuotation={latestQuotation}
        />
      </div>

      {/* ── Section 3: Bottom-Bottom Danger Zone ── */}
      <div className="pt-8 border-t border-slate-100 flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Danger Zone
        </span>
        <div className="w-full max-w-sm">
          <DeleteInquiryButton inquiryId={inquiry.id} />
        </div>
      </div>

    </div>
  );
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <DivisionErrorBoundary>
      <TicketDetail id={params.id} />
    </DivisionErrorBoundary>
  );
}
