'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

const CATEGORIES = ['All', 'Apparel', 'Drinkware', 'Stationery', 'Awards'];

export function ProductFilters() {
  const [active, setActive] = useState('All');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      // Hide right shadow if we're within 5px of the end
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    };

    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll, { passive: true });
      // Run once on mount to establish initial state
      handleScroll();
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="relative mb-12 -mx-4 sm:mx-0">

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar px-4 sm:px-0 sm:flex-wrap items-center justify-start sm:justify-center gap-3 pb-2 sm:pb-0 snap-x snap-mandatory"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "shrink-0 snap-center px-6 py-3 border-2 text-[10px] uppercase font-bold tracking-widest transition-colors",
              active === cat 
                ? "border-brand-deep-blue bg-brand-deep-blue text-white"
                : "border-brand-border/60 bg-transparent text-brand-deep-blue/60 hover:border-brand-deep-blue hover:text-brand-deep-blue"
            )}
          >
            {cat}
          </button>
        ))}
        {/* Invisible spacer to ensure last pill rests before the screen edge */}
        <div className="w-1 shrink-0 sm:hidden" aria-hidden="true" />
      </div>
    </div>
  );
}
