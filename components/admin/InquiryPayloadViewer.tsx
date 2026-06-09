import { AnimatedBorder } from './AnimatedBorder';

export function InquiryPayloadViewer({ payload }: { payload: any }) {
  if (!payload || Object.keys(payload).length === 0) return null;

  return (
    <section>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-4 pb-2 relative">
        <AnimatedBorder direction="bottom" delay={0.4} />
        Request Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
        {Object.entries(payload).map(([key, value], i) => {
          // Format keys cleanly (e.g., 'delivery_address' -> 'Delivery Address')
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return (
            <div 
              key={key}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="block text-[10px] uppercase tracking-widest text-brand-deep-blue/60 mb-1">{formattedKey}</span>
              <span className="block text-sm font-bold text-brand-deep-blue break-words font-mono">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
