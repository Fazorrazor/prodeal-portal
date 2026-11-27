'use client';

import { Layers } from 'lucide-react';

export function InquiryPayloadViewer({
  payload,
}: {
  payload: { productId?: string; productName?: string; [key: string]: unknown } | null;
}) {
  if (!payload || Object.keys(payload).length === 0) return null;

  const { productId, productName, items, ...restPayload } = payload;
  const multiItems = Array.isArray(items) ? items : [];

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-slate-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Inquiry Specifications
        </h2>
      </div>

      <div className="p-5 space-y-5">
        {productName && (
          <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-200/60">
            <span className="block text-[11px] font-medium text-slate-400 mb-1">
              Target Product
            </span>
            <span
              className="block text-base font-semibold text-[#0A1628] cursor-help"
              title={productName}
            >
              {productName}
            </span>
            {productId && (
              <span className="block text-[11px] font-mono text-slate-400 mt-1">
                ID: {productId}
              </span>
            )}
          </div>
        )}

        {multiItems.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
              Requested Items ({multiItems.length})
            </span>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/70 overflow-hidden">
              {multiItems.map((it: any, idx: number) => (
                <div
                  key={idx}
                  className="px-4 py-3 bg-slate-50/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p
                      className="font-semibold text-[#0A1628] truncate cursor-help"
                      title={it.name || it.productName}
                    >
                      {it.name || it.productName}
                    </p>
                    <p
                      className="text-slate-500 text-[11px] truncate cursor-help mt-0.5"
                      title={it.notes || 'Standard specification'}
                    >
                      {it.notes || 'Standard specification'}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-[#0A1628] px-2 py-0.5 rounded bg-white border border-slate-200/80 whitespace-nowrap tabular-nums shrink-0">
                    {it.quantity} {it.unit || 'units'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(restPayload).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(restPayload).map(([key, value]) => {
              const formattedKey = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
              const stringVal =
                typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
              return (
                <div
                  key={key}
                  className={`p-3.5 bg-slate-50/60 rounded-lg border border-slate-200/60 ${
                    key === 'message' ? 'col-span-full' : ''
                  }`}
                  title={`${formattedKey}: ${stringVal}`}
                >
                  <span className="block text-[11px] font-medium text-slate-400 mb-1">
                    {formattedKey}
                  </span>
                  <span
                    className={`block text-xs sm:text-sm text-[#0A1628] break-words cursor-help ${
                      key === 'message'
                        ? 'whitespace-pre-wrap leading-relaxed font-normal'
                        : 'font-mono font-medium'
                    }`}
                  >
                    {stringVal}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
