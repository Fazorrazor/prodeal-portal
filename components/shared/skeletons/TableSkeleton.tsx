"use client";

import { useScrambleText } from '@/lib/hooks/useScrambleText';

export function TableSkeleton() {
  const { displayText: loadingText } = useScrambleText('FETCHING INVENTORY...');

  return (
    <div className="mt-0">
      {/* Section header identical to InventoryTable */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-0">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
            — Live Stock Register
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Inventory
          </h2>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
          {loadingText}
        </p>
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto border-t-2 border-brand-border/60">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b-2 border-brand-border/60">
              <th className="py-4 pr-4 w-14" />
              <th className="py-4 pr-4 font-heading font-bold text-brand-deep-blue/40 text-xs uppercase tracking-widest">
                SKU / Product
              </th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue/40 text-xs uppercase tracking-widest">
                Size
              </th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue/40 text-xs uppercase tracking-widest">
                Material
              </th>
              <th className="py-4 pl-4 w-24" />
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i} className="border-b border-brand-border/30">
                <td className="py-4 pr-4">
                  <div className="w-12 h-12 bg-black/5 animate-pulse" />
                </td>
                <td className="py-4 pr-4">
                  <div className="h-4 w-3/4 bg-black/5 animate-pulse mb-2" />
                  <div className="h-3 w-1/4 bg-black/5 animate-pulse" />
                </td>
                <td className="p-4">
                  <div className="h-4 w-16 bg-black/5 animate-pulse" />
                </td>
                <td className="p-4">
                  <div className="h-4 w-24 bg-black/5 animate-pulse" />
                </td>
                <td className="py-4 pl-4 text-right">
                  <div className="h-8 w-20 bg-black/5 animate-pulse ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List Skeleton */}
      <div className="md:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-brand-border/40 py-5 flex flex-col gap-3">
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 bg-black/5 shrink-0 animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-black/5 animate-pulse mb-2" />
                <div className="h-3 w-1/3 bg-black/5 animate-pulse mb-2" />
                <div className="h-3 w-full bg-black/5 animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-brand-border/20 pt-3">
              <div>
                <div className="h-3 w-8 bg-black/5 animate-pulse mb-1" />
                <div className="h-4 w-16 bg-black/5 animate-pulse" />
              </div>
              <div>
                <div className="h-3 w-12 bg-black/5 animate-pulse mb-1" />
                <div className="h-4 w-24 bg-black/5 animate-pulse" />
              </div>
            </div>
            <div className="h-11 w-full bg-black/5 animate-pulse mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
