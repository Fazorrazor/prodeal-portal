import { redirect } from 'next/navigation';

export default function TrackPage() {
  async function searchTracking(formData: FormData) {
    'use server';
    const trackingId = formData.get('trackingId');
    if (typeof trackingId === 'string' && trackingId.trim()) {
      redirect(`/track/${trackingId.trim()}`);
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-lg">
        <div className="border-t-2 border-brand-deep-blue pt-8 pb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-none text-brand-deep-blue mb-4">
            TRACK INQUIRY
          </h1>
          <p className="text-sm font-mono text-brand-deep-blue/70 mb-8">
            ENTER YOUR 16-CHARACTER TRACKING ID TO VIEW STATUS
          </p>

          <form action={searchTracking} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="trackingId" className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-2">
                Tracking ID
              </label>
              <input
                type="text"
                id="trackingId"
                name="trackingId"
                placeholder="e.g. a1b2c3d4e5f6g7h8"
                required
                className="w-full bg-transparent border-b-2 border-brand-border/60 px-0 py-4 text-lg font-mono text-brand-deep-blue placeholder:text-brand-border focus:outline-none focus:border-brand-blue transition-colors rounded-none"
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-sm py-4 px-6 hover:bg-brand-blue transition-colors flex justify-center items-center"
            >
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
