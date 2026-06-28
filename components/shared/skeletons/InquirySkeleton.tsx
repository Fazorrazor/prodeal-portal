'use client';

import { ArrowLeft } from 'lucide-react';
import { useScrambleText } from '../../../lib/hooks/useScrambleText';

export function InquirySkeleton() {
  const { displayText: scrambleText } = useScrambleText('INITIALIZING SECURE INQUIRY...');

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-brand-surface relative">
      
      {/* Animated vertical divider — desktop only */}
      <div className="hidden md:block absolute left-[420px] lg:left-[520px] top-0 bottom-0 w-[2px] bg-brand-border/60 z-10" />

      {/* ── LEFT PANEL: Product Context ── */}
      <div className="w-full md:w-[420px] lg:w-[520px] flex flex-col bg-brand-surface md:bg-black/[0.03] md:sticky md:top-[64px] md:max-h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide z-0 border-b-2 md:border-b-0 border-brand-border/60">
        
        {/* Top bar */}
        <div className="px-5 py-3.5 border-b border-brand-border/40 flex justify-between items-center shrink-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-deep-blue/40 uppercase tracking-[0.2em]">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </div>
          <span className="text-[9px] font-mono font-bold text-brand-blue/60 uppercase tracking-[0.2em]">
            {scrambleText}
          </span>
        </div>

        {/* ── MOBILE: compact strip ── */}
        <div className="md:hidden flex gap-4 items-center px-5 py-4 border-b border-brand-border/40 shrink-0">
          <div className="w-16 h-16 shrink-0 bg-brand-deep-blue/5 animate-pulse" />
          <div className="min-w-0 flex-1">
            <div className="h-5 bg-brand-deep-blue/10 animate-pulse w-3/4 mb-2" />
            <div className="h-3 bg-brand-deep-blue/10 animate-pulse w-1/3" />
          </div>
        </div>

        {/* ── DESKTOP: full product image ── */}
        <div className="hidden md:block relative w-full aspect-[4/3] bg-brand-deep-blue/5 animate-pulse shrink-0" />

        {/* Product name + SKU — desktop */}
        <div className="hidden md:block px-6 pt-5 pb-4 border-b border-brand-border/40 shrink-0">
          <div className="h-8 bg-brand-deep-blue/10 animate-pulse w-4/5 mb-3" />
          <div className="flex items-center gap-4">
            <div>
              <div className="h-2 bg-brand-deep-blue/10 animate-pulse w-16 mb-1.5" />
              <div className="h-4 bg-brand-deep-blue/10 animate-pulse w-24" />
            </div>
          </div>
        </div>

        {/* ── What happens next ── */}
        <div className="hidden md:flex flex-col flex-1 px-6 pt-6 pb-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-brand-border/30">
            <span className="text-brand-red/40 text-base font-mono font-bold leading-none">→</span>
            <div className="h-3 bg-brand-deep-blue/10 animate-pulse w-2/3" />
          </div>

          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-brand-deep-blue/40 mb-4">
            — What happens next
          </p>

          <div className="flex flex-col gap-0">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex gap-4 py-4 border-b border-brand-border/20 last:border-b-0">
                <div className="h-3 w-4 bg-brand-deep-blue/10 animate-pulse mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-brand-deep-blue/10 animate-pulse w-1/2 mb-1.5" />
                  <div className="h-3 bg-brand-deep-blue/10 animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 md:px-10 md:py-10">
          
          <div className="mb-8">
            <div className="h-8 bg-brand-deep-blue/10 animate-pulse w-1/2 mb-2" />
            <div className="h-4 bg-brand-deep-blue/10 animate-pulse w-3/4" />
          </div>

          <div className="space-y-6">
            {/* Form Fields Skeletons */}
            {[1, 2, 3, 4, 5].map((field) => (
              <div key={field}>
                <div className="h-3 bg-brand-deep-blue/10 animate-pulse w-24 mb-2" />
                <div className="h-12 bg-brand-deep-blue/5 animate-pulse border-b-2 border-brand-border/30 w-full" />
              </div>
            ))}
            
            <div className="pt-6">
              <div className="h-14 bg-brand-deep-blue/10 animate-pulse w-full" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
