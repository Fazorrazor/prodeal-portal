import { createServer } from '../../../../lib/supabase/server';
import { TrackingTimeline } from '../../../../components/track/TrackingTimeline';
import Link from 'next/link';
import { headers } from 'next/headers';
import { trackRateLimit } from '../../../../lib/ratelimit';
import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';

export const revalidate = 0; // cache = 'no-store' equivalent for this segment

export default async function TrackDetail(props: { params: Promise<{ trackingId: string }> }) {
  const params = await props.params;
  const trackingId = params.trackingId;
  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';

  try {
    const { success } = await trackRateLimit.limit(ip);
    if (!success) {
      return (
        <div className="w-full max-w-3xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col justify-center">
          <div className="border-t-2 border-brand-red pt-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-none text-brand-red mb-6 uppercase">
              Too Many Requests.
            </h1>
            <p className="text-lg font-mono text-brand-deep-blue/70 max-w-md">
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
  const supabase = createServer();

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('id, status, division_id, created_at, updated_at')
    .eq('tracking_uuid', trackingId)
    .single();

  if (error || !inquiry) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-20 min-h-[60vh] flex flex-col justify-center">
        <div className="border-t-2 border-brand-deep-blue pt-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-none text-brand-deep-blue mb-6 uppercase">
            Not Found.
          </h1>
          <p className="text-lg font-mono text-brand-deep-blue/70 mb-8 max-w-md">
            THE TRACKING ID [{trackingId}] DOES NOT MATCH ANY ACTIVE INQUIRIES IN OUR SYSTEM.
          </p>
          <Link 
            href="/track"
            className="inline-block bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-sm py-4 px-8 hover:bg-brand-blue transition-colors"
          >
            TRY ANOTHER ID
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TrackingTimeline 
      trackingId={trackingId}
      status={(inquiry as any).status as any}
      createdAt={(inquiry as any).created_at}
      updatedAt={(inquiry as any).updated_at}
    />
  );
}
