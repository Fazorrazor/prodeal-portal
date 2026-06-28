"use client";

import { useScrambleText } from '@/lib/hooks/useScrambleText';

export function CardSkeleton() {
  const { displayText: loadingText } = useScrambleText('RETRIEVING DATA...');

  return (
    <div>
      {/* Section header identical to ChemicalCatalog & ProductCatalog */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-8">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
            — Product Register
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Available Products
          </h2>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
          {loadingText}
        </p>
      </div>

      <div className="flex flex-col">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b border-brand-border/40 py-6 flex flex-col sm:flex-row gap-5 group">
            {/* Image thumbnail skeleton */}
            <div className="w-full sm:w-28 sm:h-28 aspect-video sm:aspect-square bg-black/5 shrink-0 animate-pulse" />

            {/* Data block skeleton */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="w-1/2">
                  <div className="h-6 w-3/4 bg-black/5 animate-pulse mb-2" />
                  <div className="h-3 w-1/3 bg-black/5 animate-pulse" />
                </div>
                {/* Grade badge skeleton */}
                <div className="h-6 w-20 bg-black/5 animate-pulse shrink-0" />
              </div>

              <div className="flex-1 space-y-2 mb-4">
                <div className="h-3 w-full bg-black/5 animate-pulse" />
                <div className="h-3 w-5/6 bg-black/5 animate-pulse" />
              </div>

              <div className="w-full sm:w-32 h-11 bg-black/5 animate-pulse sm:self-end mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
