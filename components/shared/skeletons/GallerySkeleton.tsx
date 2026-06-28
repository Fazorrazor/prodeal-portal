"use client";

import { useScrambleText } from '@/lib/hooks/useScrambleText';

export function GallerySkeleton() {
  const { displayText: loadingText } = useScrambleText('LOADING PORTFOLIO...');

  return (
    <div>
      {/* Section header identical to SignageGallery */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-8">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
            — Project Portfolio
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Recent Installations
          </h2>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
          {loadingText}
        </p>
      </div>
      
      {/* Skeleton Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="break-inside-avoid relative overflow-hidden flex flex-col border-2 border-brand-border/60">
            <div className="relative w-full aspect-[4/3] bg-black/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
