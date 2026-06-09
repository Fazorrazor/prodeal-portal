import { createServer } from '../../../../lib/supabase/server';
import { StatusTimeline } from '../../../../components/track/StatusTimeline';
import { FileText, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { TrackAnimationWrapper } from '../../../../components/track/TrackAnimationWrapper';

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TrackingPortalPage({ params }: { params: { trackingId: string } }) {
  const supabase = createServer() as any;
  
  // Safe fetch using inner joins for strongly typed relations if possible, or simple selects
  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      divisions ( display_name ),
      staff_members ( full_name, whatsapp_phone )
    `)
    .eq('tracking_uuid', params.trackingId)
    .single();

  if (error || !inquiry) {
    return (
      <div className="min-h-[70vh] bg-brand-surface py-20 px-4 flex items-center justify-center">
        <TrackAnimationWrapper>
          <div className="max-w-xl w-full border-t-4 border-brand-red py-12 text-center">
            <div className="w-16 h-16 border-2 border-brand-red flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-brand-red" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-brand-deep-blue mb-2 uppercase tracking-tighter">Inquiry Not Found</h1>
            <p className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-8">
              We couldn't find an inquiry matching that tracking code. Please verify the code and try again.
            </p>
            <Link href="/track" className="inline-flex px-8 py-4 bg-brand-deep-blue text-white font-bold text-[10px] uppercase tracking-widest hover:bg-brand-blue transition-colors">
              Search Again
            </Link>
          </div>
        </TrackAnimationWrapper>
      </div>
    );
  }

  // Safe casting since we know the shape from our select query
  const division = inquiry.divisions as unknown as { display_name: string } | null;
  const staff = inquiry.staff_members as unknown as { full_name: string; whatsapp_phone: string } | null;

  return (
    <div className="min-h-screen bg-brand-surface py-12 px-4">
      <TrackAnimationWrapper>
        
        {/* Header */}
        <div className="border-b-2 border-brand-border/60 pb-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-heading font-bold text-4xl text-brand-deep-blue mb-2 uppercase tracking-tighter">Inquiry Status</h1>
            <p className="text-brand-deep-blue/60 font-mono font-bold tracking-widest text-[10px] uppercase">
              ID: {inquiry.tracking_uuid}
            </p>
          </div>
          {division && (
            <div className="border-2 border-brand-border/60 px-6 py-3">
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block mb-1">Division</span>
              <span className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tight">{division.display_name}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="border-b-2 border-brand-border/60 pb-12 mb-12 overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-0">
            <StatusTimeline currentStatus={inquiry.status} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="border-t-2 border-brand-border/60 pt-8">
            <h3 className="font-heading font-bold text-2xl text-brand-deep-blue mb-8 uppercase tracking-tighter">Client Details</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <User className="w-5 h-5 text-brand-blue" />
                <div>
                  <p className="text-[10px] text-brand-deep-blue/50 font-bold uppercase tracking-widest mb-0.5">Contact</p>
                  <p className="font-bold text-brand-deep-blue text-lg uppercase tracking-tight">{inquiry.contact_name}</p>
                </div>
              </li>
              {inquiry.company_name && (
                <li className="flex items-center gap-4">
                  <Building2 className="w-5 h-5 text-brand-blue" />
                  <div>
                    <p className="text-[10px] text-brand-deep-blue/50 font-bold uppercase tracking-widest mb-0.5">Company</p>
                    <p className="font-bold text-brand-deep-blue text-lg uppercase tracking-tight">{inquiry.company_name}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div className="border-t-2 border-brand-border/60 pt-8">
             <h3 className="font-heading font-bold text-2xl text-brand-deep-blue mb-8 uppercase tracking-tighter">Assigned Agent</h3>
             {staff ? (
               <ul className="space-y-6">
                  <li className="flex items-center gap-4">
                    <User className="w-5 h-5 text-brand-red" />
                    <div>
                      <p className="text-[10px] text-brand-deep-blue/50 font-bold uppercase tracking-widest mb-0.5">Agent Name</p>
                      <p className="font-bold text-brand-deep-blue text-lg uppercase tracking-tight">{staff.full_name}</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center bg-green-500 text-white text-[10px] font-bold tracking-widest">WA</div>
                    <div>
                      <p className="text-[10px] text-brand-deep-blue/50 font-bold uppercase tracking-widest mb-0.5">Direct WhatsApp</p>
                      <p className="font-mono font-bold text-brand-deep-blue text-lg">{staff.whatsapp_phone}</p>
                    </div>
                  </li>
               </ul>
             ) : (
               <div className="h-full flex flex-col justify-center opacity-60">
                  <p className="text-xl font-heading font-bold uppercase tracking-tight text-brand-deep-blue mb-1">Pending Assignment</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">An agent will be assigned shortly.</p>
               </div>
             )}
          </div>

        </div>
      </TrackAnimationWrapper>
    </div>
  );
}
