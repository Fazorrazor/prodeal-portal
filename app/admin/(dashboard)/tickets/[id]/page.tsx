import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Clock, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { createServer } from '../../../../../lib/supabase/server';
import { StatusUpdater } from '../../../../../components/admin/StatusUpdater';
import { InquiryPayloadViewer } from '../../../../../components/admin/InquiryPayloadViewer';
import { DivisionErrorBoundary } from '../../../../../components/shared/DivisionErrorBoundary';
import { AnimatedBorder } from '../../../../../components/admin/AnimatedBorder';
import { DeleteInquiryButton } from '../../../../../components/admin/DeleteInquiryButton';

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
        type
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl pt-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 relative">
        <AnimatedBorder direction="bottom" delay={0.1} className="h-[2px] !bg-brand-deep-blue" />
        <div className="flex items-start gap-4">
          <Link 
            href="/admin/tickets"
            className="mt-1 p-1 hover:bg-black/5 transition-colors text-brand-deep-blue/80 hover:text-brand-deep-blue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none">
                {inquiry.tracking_uuid.substring(0, 8).toUpperCase()}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue border border-brand-deep-blue px-2 py-0.5">
                {inquiry.divisions?.display_name || 'Unknown Division'}
              </span>
            </div>
            <p className="text-brand-deep-blue/80 font-mono text-sm">
              Received {format(new Date(inquiry.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
        <StatusUpdater inquiryId={inquiry.id} currentStatus={inquiry.status} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Client Details */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-4 pb-2 relative">
              <AnimatedBorder direction="bottom" delay={0.2} />
              Client Details
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-deep-blue/80 mb-1">Contact Name</p>
                <p className="text-sm font-bold text-brand-deep-blue">{inquiry.contact_name}</p>
              </div>
              {inquiry.company_name && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-deep-blue/80 mb-1">Company</p>
                  <p className="text-sm font-bold text-brand-deep-blue">{inquiry.company_name}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-deep-blue/80 mb-1">Email</p>
                <a href={`mailto:${inquiry.contact_email}`} className="text-sm font-semibold text-brand-blue hover:text-brand-deep-blue transition-colors">
                  {inquiry.contact_email}
                </a>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-deep-blue/80 mb-1">WhatsApp</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-brand-deep-blue font-mono">{inquiry.contact_phone}</p>
                  <a 
                    href={`https://wa.me/${inquiry.contact_phone.replace(/\D/g, '')}?text=Hi ${encodeURIComponent(inquiry.contact_name)}, regarding your Prodeal inquiry (${inquiry.tracking_uuid.substring(0,8)}):`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-black/5 text-brand-deep-blue/80 hover:text-brand-blue transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Payload Viewer */}
          <InquiryPayloadViewer payload={inquiry.inquiry_payload} />

          {/* Attachments */}
          {inquiry.attachments && Array.isArray(inquiry.attachments) && inquiry.attachments.length > 0 && (
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-4 pb-2 flex items-center gap-2 relative">
                <AnimatedBorder direction="bottom" delay={0.3} />
                <Paperclip className="w-3 h-3" /> Attachments
              </h2>
              <div className="flex flex-col gap-2">
                {inquiry.attachments.map((file: any, i: number) => (
                  <a 
                    key={i} 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 border border-brand-border/60 hover:border-brand-deep-blue text-xs font-bold text-brand-deep-blue transition-colors w-fit animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Paperclip className="w-3 h-3 text-brand-deep-blue/80" />
                    {file.name || `Attachment ${i + 1}`}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-12 pt-8 lg:pt-0 lg:pl-12 relative">
          <AnimatedBorder direction="top" className="block lg:hidden" delay={0.4} />
          <AnimatedBorder direction="left" className="hidden lg:block" delay={0.4} />
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-6 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Activity Timeline
            </h2>
            <div className="space-y-6 relative">
              <AnimatedBorder direction="left" className="left-[5px]" delay={0.5} duration={1.2} />
              {events.map((event: any, i: number) => (
                <div 
                  key={event.created_at} 
                  className="relative flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-3 h-3 rounded-none bg-brand-deep-blue shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-brand-deep-blue capitalize leading-none mb-1">
                      {event.event_type === 'status_changed' && event.payload?.new_status
                        ? `Status Changed To ${event.payload.new_status.replace('_', ' ')}`
                        : event.event_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] font-mono text-brand-deep-blue/80">
                      {format(new Date(event.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              <div className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-3 h-3 rounded-none border border-brand-deep-blue bg-transparent shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-bold text-brand-deep-blue/80 leading-none mb-1">Ticket Received</p>
                  <p className="text-[10px] font-mono text-brand-deep-blue/80">
                    {format(new Date(inquiry.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Danger Zone */}
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
