'use client';

import { Package, Layers } from 'lucide-react';

export function InquiryPayloadViewer({ payload }: { payload: { productId?: string; productName?: string; [key: string]: unknown } | null }) {
  if (!payload || Object.keys(payload).length === 0) return null;

  const { productId, productName, items, ...restPayload } = payload;
  const multiItems = Array.isArray(items) ? items : [];

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue">
            <Layers className="w-4 h-4" />
          </span>
          <h3 className="text-base font-semibold text-brand-deep-blue">
            Inquiry Specifications
          </h3>
        </div>
      </div>

      {/* Prominent Product Header if available */}
      {productName && (
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Target Product</span>
          <span 
            className="block text-lg font-display font-bold text-brand-deep-blue cursor-help"
            title={productName}
          >
            {productName}
          </span>
          {productId && (
            <span className="block text-xs font-mono text-slate-400 mt-0.5">
              ID: {productId}
            </span>
          )}
        </div>
      )}

      {/* Multi-Item Tray List if present */}
      {multiItems.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Requested Items ({multiItems.length})
          </span>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
            {multiItems.map((it: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-slate-50/40 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p 
                    className="font-semibold text-brand-deep-blue cursor-help"
                    title={it.name || it.productName}
                  >
                    {it.name || it.productName}
                  </p>
                  <p 
                    className="text-slate-400 text-[11px] cursor-help"
                    title={it.notes || 'Standard Spec'}
                  >
                    {it.notes || 'Standard Spec'}
                  </p>
                </div>
                <span className="font-mono font-bold text-brand-blue px-2.5 py-1 rounded-md bg-brand-blue/5 border border-brand-blue/10">
                  {it.quantity} {it.unit || 'units'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rest of Key-Value Payload */}
      {Object.keys(restPayload).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(restPayload).map(([key, value]) => {
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const stringVal = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
            return (
              <div 
                key={key}
                className={`p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 ${key === 'message' ? 'col-span-full' : ''}`}
                title={`${formattedKey}: ${stringVal}`}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{formattedKey}</span>
                <span className={`block text-xs sm:text-sm font-medium text-brand-deep-blue break-words cursor-help ${key === 'message' ? 'whitespace-pre-wrap' : 'font-mono'}`}>
                  {stringVal}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
