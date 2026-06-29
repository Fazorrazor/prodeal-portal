import { redirect } from 'next/navigation';
import { trackRateLimit } from '../../../lib/ratelimit';
import { headers } from 'next/headers';

export default async function TrackPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  const errorMsg = searchParams?.error === 'ratelimit' 
    ? 'Too many tracking attempts. Please wait a minute.' 
    : null;

  async function searchTracking(formData: FormData) {
    'use server';
    
    // Rate limit check
    try {
      const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';
      const { success } = await trackRateLimit.limit(ip);
      if (!success) {
        redirect('/track?error=ratelimit');
      }
    } catch (e) {
      console.warn('[Rate Limit Warning] Track route rate limit check failed', e);
    }

    const trackingId = formData.get('trackingId');
    if (typeof trackingId === 'string' && trackingId.trim()) {
      redirect(`/track/${trackingId.trim().toLowerCase()}`);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 sm:px-6">
      <div className="w-full max-w-lg mx-auto">
      
        {errorMsg && (
          <div className="mb-8 p-4 border-l-2 border-brand-red bg-brand-red/10 animate-in fade-in">
            <p className="text-brand-red text-xs font-bold font-mono uppercase tracking-widest">{errorMsg}</p>
          </div>
        )}

        {/* Pre-heading micro label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-brand-deep-blue/20" />
          <span className="text-[10px] font-bold font-mono uppercase tracking-[0.25em] text-brand-deep-blue/40">
            Inquiry Status
          </span>
          <div className="h-px w-6 bg-brand-deep-blue/20" />
        </div>

        {/* Heading block */}
        <div className="mb-10 flex gap-5">
          {/* Animated left-rail accent */}
          <div className="w-[3px] bg-brand-blue shrink-0 self-stretch min-h-full" 
            style={{ minHeight: '100%' }}
          />
          <div>
            <h1 className="text-5xl sm:text-6xl font-heading font-bold tracking-tighter leading-[0.9] text-brand-deep-blue mb-4">
              TRACK<br />INQUIRY
            </h1>
            <p className="text-xs font-mono text-brand-deep-blue/50 uppercase tracking-[0.2em] leading-relaxed max-w-xs">
              Enter your 16-character tracking ID to view your inquiry status in real time.
            </p>
          </div>
        </div>

        {/* Form */}
        <form action={searchTracking} className="flex flex-col gap-0">
          {/* Input field zone — tinted band */}
          <div className="bg-black/[0.03] border-t border-brand-border/40 px-4 py-5 flex flex-col gap-1">
            <label
              htmlFor="trackingId"
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-blue mb-1 block"
            >
              Tracking ID
            </label>
            <input
              type="text"
              id="trackingId"
              name="trackingId"
              placeholder="e.g. a1b2c3d4-e5f6-7g8h..."
              required
              autoComplete="off"
              className="w-full bg-transparent border-0 border-b-2 border-brand-border/50 px-0 pb-2 pt-1 text-lg font-mono text-brand-deep-blue placeholder:text-brand-border/60 focus:outline-none focus:border-brand-blue transition-colors rounded-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-[0.2em] text-sm py-5 px-6 hover:bg-brand-blue active:bg-brand-blue transition-colors flex justify-between items-center group"
          >
            <span>Submit</span>
            <span className="text-white/50 group-hover:text-white transition-colors text-xl leading-none">→</span>
          </button>

          {/* Helper text */}
          <p className="mt-4 text-[10px] font-mono text-brand-deep-blue/30 uppercase tracking-widest text-center">
            You received your tracking ID after submitting an inquiry
          </p>
        </form>

      </div>
    </div>
  );
}
