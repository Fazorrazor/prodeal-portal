'use client';

import { useQuoteStore } from '../../store/quoteStore';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GlobalQuoteCTAProps {
  slug: string;
  label?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export function GlobalQuoteCTA({ slug, label = 'Start an Inquiry', theme = 'dark', className }: GlobalQuoteCTAProps) {
  const openBuilder = useQuoteStore((state) => state.openBuilder);

  return (
    <button 
      onClick={() => openBuilder(slug as any)}
      className={cn(
        "group inline-flex items-center justify-center gap-3 px-8 py-4 border-2 font-heading font-bold uppercase tracking-widest text-xs transition-all duration-300 w-full sm:w-auto",
        theme === 'dark' 
          ? "bg-brand-deep-blue text-brand-surface border-brand-deep-blue hover:bg-transparent hover:text-brand-deep-blue"
          : "bg-brand-blue text-white border-brand-blue hover:bg-white hover:text-brand-deep-blue",
        className
      )}
    >
      {label}
      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
