"use client";

export function HeroSkeleton() {
  return (
    <section className="bg-brand-deep-blue pt-14 pb-14 lg:pt-16 lg:pb-16 relative overflow-hidden border-b border-white/10 min-h-[300px]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-12 bg-white/10 animate-pulse" />
          <span className="text-white/20 font-mono text-xs">›</span>
          <div className="h-3 w-24 bg-white/10 animate-pulse" />
        </div>

        <div className="flex gap-5 sm:gap-8">
          {/* Vertical accent line skeleton */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-[3px] bg-white/10 animate-pulse h-full min-h-[80px]" />
          </div>

          {/* Text block skeleton */}
          <div className="flex-1">
            <div className="h-12 sm:h-16 md:h-20 w-3/4 bg-white/10 animate-pulse mb-4" />
            <div className="h-4 w-1/2 bg-white/10 animate-pulse mb-2" />
            <div className="h-4 w-1/3 bg-white/10 animate-pulse" />
          </div>
        </div>

      </div>
    </section>
  );
}
