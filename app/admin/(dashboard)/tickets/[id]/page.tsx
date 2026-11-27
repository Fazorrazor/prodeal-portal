import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  Clock,
  Paperclip,
  Building2,
  User,
  Mail,
  Phone,
} from 'lucide-react';
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
  const supabase = (await createServer()) as any;

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select(
      `
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
    `
    )
    .eq('id', id)
    .single();

  if (error || !inquiry) {
    if (error?.code === 'PGRST116') return notFound();
    throw new Error(`Supabase Error: ${error?.message}`);
  }

  const events =
    inquiry.inquiry_events?.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [];

  const latestQuotation = events.find((e: any) => e.event_type === 'quotation_generated');
  const shortRef = inquiry.tracking_uuid.substring(0, 8).toUpperCase();

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="pb-6 border-b border-slate-200/70 space-y-4">
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#0A1628] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inquiries</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-2xl font-mono font-semibold text-[#0A1628] tracking-tight tabular-nums cursor-help"
                title={inquiry.tracking_uuid}
              >
                #{shortRef}
              </h1>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                {inquiry.divisions?.display_name || 'Industrial'}
              </span>
            </div>
            <p className="text-xs text-slate-500 tabular-nums">
              Logged {format(new Date(inquiry.created_at), 'MMM d, yyyy · h:mm a')}
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <StatusUpdater inquiryId={inquiry.id} currentStatus={inquiry.status} />
          </div>
        </div>
      </div>

      {/* Upper 2-Column Context Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Client Profile, Specs, Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Profile Card */}
          <section className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Client Profile
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Contact Person
                  </span>
                  <p className="text-sm font-semibold text-[#0A1628] mt-0.5 break-words">
                    {inquiry.contact_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Company
                  </span>
                  <p
                    className="text-sm font-semibold text-[#0A1628] mt-0.5 truncate cursor-help"
                    title={inquiry.company_name || 'Individual / Not specified'}
                  >
                    {inquiry.company_name || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Email Address
                  </span>
                  {inquiry.contact_email ? (
                    <a
                      href={`mailto:${inquiry.contact_email}`}
                      className="text-sm font-medium text-[#1A56DB] hover:underline truncate block mt-0.5 cursor-help"
                      title={inquiry.contact_email}
                    >
                      {inquiry.contact_email}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 mt-0.5">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/60">
                <div className="flex items-start gap-3 min-w-0">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      WhatsApp / Phone
                    </span>
                    <p className="text-sm font-mono font-medium text-[#0A1628] mt-0.5 tabular-nums">
                      {inquiry.contact_phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                {inquiry.contact_phone && (
                  <a
                    href={`https://wa.me/${inquiry.contact_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hello ${inquiry.contact_name}, regarding your Prodeal inquiry (#${shortRef}):`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open WhatsApp chat"
                    title="Open direct WhatsApp chat"
                    className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 flex items-center justify-center transition-colors shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Inquiry Specifications */}
          <InquiryPayloadViewer payload={inquiry.inquiry_payload} />

          {/* Attachments */}
          {inquiry.attachments &&
            Array.isArray(inquiry.attachments) &&
            inquiry.attachments.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Client Attachments
                  </h2>
                </div>
                <div className="p-5 flex flex-wrap gap-2.5">
                  {inquiry.attachments.map((file: any, i: number) => (
                    <a
                      key={i}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-[#0A1628] transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span>{file.name || `Document #${i + 1}`}</span>
                    </a>
                  ))}
                </div>
              </section>
            )}
        </div>

        {/* Right 1 Column: WhatsApp Desk & Audit Timeline */}
        <div className="space-y-6">
          <WhatsAppCommandCenter
            inquiry={{
              id: inquiry.id,
              tracking_uuid: inquiry.tracking_uuid,
              contact_name: inquiry.contact_name,
              company_name: inquiry.company_name,
              phone: inquiry.contact_phone,
              divisions: inquiry.divisions,
              status: inquiry.status,
            }}
            latestQuotation={latestQuotation}
          />

          {/* Activity Timeline */}
          <section className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Activity Timeline
              </h2>
            </div>

            <div className="p-5">
              <div className="space-y-4 relative pl-4">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-200" />

                {events.map((event: any, idx: number) => (
                  <div key={`${event.created_at}-${idx}`} className="relative flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A56DB] ring-4 ring-white shrink-0 mt-1 -ml-[16px] z-10" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#0A1628] capitalize leading-snug">
                        {event.event_type === 'status_changed' && event.payload?.new_status
                          ? `Status changed to ${event.payload.new_status.replace('_', ' ')}`
                          : event.event_type === 'quotation_generated'
                          ? `Quotation issued (${event.payload?.quoteNumber || '₵' + event.payload?.totalAmount})`
                          : event.event_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                        {format(new Date(event.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="relative flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white shrink-0 mt-1 -ml-[16px] z-10" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-600 leading-snug">
                      Inquiry submitted
                    </p>
                    <p className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                      {format(new Date(inquiry.created_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Full-Width Pro-Forma Quotation Builder */}
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
            created_at: inquiry.created_at,
          }}
          existingQuotation={latestQuotation}
        />
      </div>

      {/* Single Understated Danger Zone */}
      <DeleteInquiryButton inquiryId={inquiry.id} />
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
