import { createServiceRoleClient } from '../../../../lib/supabase/server';
import { TrackingTimeline } from '../../../../components/track/TrackingTimeline';
import Link from 'next/link';
import { headers } from 'next/headers';
import { trackRateLimit } from '../../../../lib/ratelimit';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';
import { logError } from '../../../../lib/logger';

export const revalidate = 0; // cache = 'no-store' equivalent for this segment

export default async function TrackDetail(props: { params: Promise<{ trackingId: string }> }) {
  const params = await props.params;
  const trackingId = params.trackingId;
  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

  try {
    const { success } = await trackRateLimit.limit(ip);
    if (!success) {
      await logError('Tracking Rate Limit Exceeded', new Error('User hit rate limit on tracking page'), { 
        ip, 
        trackingId 
      });
      return (
        <div className="w-full max-w-3xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col justify-center">
          <div className="border-t-2 border-brand-red pt-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-none text-brand-red mb-6 uppercase">
              Too Many Requests.
            </h1>
            <p className="text-lg font-mono text-brand-deep-blue/80 max-w-md">
              RATE LIMIT EXCEEDED. PLEASE WAIT A MINUTE BEFORE TRYING AGAIN.
            </p>
          </div>
        </div>
      );
    }
  } catch (e) {
    console.warn('[Rate Limit Warning] Tracking page rate limit check failed', e);
  }

  return (
    <DivisionErrorBoundary>
      <TrackingDataLoader trackingId={trackingId} />
    </DivisionErrorBoundary>
  );
}

async function TrackingDataLoader({ trackingId }: { trackingId: string }) {
  const supabase = createServiceRoleClient();
  const cleanTrackingId = trackingId.trim().toLowerCase();

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('id, status, division_id, tracking_uuid, created_at, updated_at, contact_name, contact_email, contact_phone, company_name, inquiry_payload, divisions(display_name, slug)')
    .eq('tracking_uuid', cleanTrackingId)
    .single();

  if (error || !inquiry) {
    await logError('Tracking Lookup Failed', new Error('Inquiry not found'), { 
      providedId: trackingId, 
      cleanId: cleanTrackingId, 
      dbError: error 
    });

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col justify-center">
        <div className="border-t-2 border-brand-deep-blue pt-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-none text-brand-deep-blue mb-6 uppercase">
            Not Found.
          </h1>
          <p className="text-lg font-mono text-brand-deep-blue/80 mb-8 max-w-md">
            THE TRACKING ID [{trackingId}] DOES NOT MATCH ANY ACTIVE INQUIRIES IN OUR SYSTEM.
          </p>
          <Link 
            href="/track"
            className="inline-block bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-sm py-4 px-8 hover:bg-brand-blue transition-colors rounded-xl shadow-xs"
          >
            TRY ANOTHER ID
          </Link>
        </div>
      </div>
    );
  }

  const { data: quoteEvent } = await supabase
    .from('inquiry_events')
    .select('payload, created_at')
    .eq('inquiry_id', inquiry.id)
    .eq('event_type', 'quotation_generated')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const divisionName = Array.isArray(inquiry.divisions)
    ? inquiry.divisions[0]?.display_name
    : (inquiry.divisions as any)?.display_name || 'Industrial Supplies';

  const divisionSlug = Array.isArray(inquiry.divisions)
    ? inquiry.divisions[0]?.slug
    : (inquiry.divisions as any)?.slug || 'chemicals';

  return (
    <TrackingTimeline 
      trackingId={cleanTrackingId}
      status={(inquiry as any).status as any}
      createdAt={(inquiry as any).created_at}
      updatedAt={(inquiry as any).updated_at}
      inquiryData={{
        contactName: inquiry.contact_name,
        contactEmail: inquiry.contact_email,
        contactPhone: inquiry.contact_phone,
        companyName: inquiry.company_name,
        divisionName,
        divisionSlug,
        payload: inquiry.inquiry_payload,
        quotationData: quoteEvent?.payload
      }}
    />
  );
}
