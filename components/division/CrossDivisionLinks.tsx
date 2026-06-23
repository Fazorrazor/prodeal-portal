import Link from 'next/link';
import { PUBLIC_NAV_LINKS } from '../../lib/config/navigation';
import { ArrowRight } from 'lucide-react';

export function CrossDivisionLinks({ currentSlug }: { currentSlug: string }) {
  const otherDivisions = PUBLIC_NAV_LINKS.filter(
    link => !link.href.includes(`/divisions/${currentSlug}`)
  );

  return (
    <div className="mt-20 lg:mt-28 border-t-2 border-brand-deep-blue pt-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-0">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
            — Other Divisions
          </p>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Explore Other Services
          </h3>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
          {otherDivisions.length} available
        </p>
      </div>

      <div className="flex flex-col mt-0">
        {otherDivisions.map((division, i) => (
          <Link
            key={division.href}
            href={division.href}
            className="group flex items-center justify-between py-5 border-b border-brand-border/40 gap-4 active:bg-black/5 transition-colors"
          >
            <div className="flex items-center gap-5 sm:gap-8">
              <span className="text-[10px] font-mono font-bold text-brand-deep-blue/25 tracking-widest shrink-0 hidden sm:block">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-heading font-bold text-lg sm:text-xl text-brand-deep-blue uppercase tracking-tight group-active:text-brand-blue transition-colors">
                {division.name}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-deep-blue/25 shrink-0 transition-transform duration-200 group-active:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
