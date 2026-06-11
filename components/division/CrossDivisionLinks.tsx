import Link from 'next/link';
import { PUBLIC_NAV_LINKS } from '../../lib/config/navigation';
import { ArrowRight } from 'lucide-react';

export function CrossDivisionLinks({ currentSlug }: { currentSlug: string }) {
  const otherDivisions = PUBLIC_NAV_LINKS.filter(
    link => !link.href.includes(`/divisions/${currentSlug}`)
  );

  return (
    <div className="mt-24 pt-12 border-t-2 border-brand-border/60">
      <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter mb-8">Explore Other Divisions</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        {otherDivisions.map((division) => (
          <Link
            key={division.href}
            href={division.href}
            className="group flex-1 flex items-center justify-between px-6 py-6 border-2 border-brand-border/60 text-brand-deep-blue font-heading font-bold uppercase tracking-widest text-sm md:hover:border-brand-blue md:hover:text-brand-blue active:bg-black/5 transition-colors"
          >
            <span>{division.name}</span>
            <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
