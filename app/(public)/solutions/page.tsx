import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Droplets, Building2, Paintbrush, Hammer, CheckCircle2 } from 'lucide-react';
import { SOLUTIONS_LIST } from '../../../lib/config/solutions';

const siteUrl = 'https://www.prodealindustries.com';

export const metadata: Metadata = {
  title: 'Waterproofing & Construction Chemicals in Ghana',
  description:
    'Problem-based chemical and waterproofing solutions for roofs, damp walls, concrete structures, and architectural coatings across Accra and Ghana.',
  alternates: {
    canonical: `${siteUrl}/solutions`,
  },
  openGraph: {
    title: 'Waterproofing & Construction Chemical Solutions in Ghana | Prodeal Industries',
    description:
      'Industrial-grade problem-solving chemical formulations for roofs, damp walls, concrete protection, and exterior coatings.',
    url: `${siteUrl}/solutions`,
    type: 'website',
  },
};

export const revalidate = 3600;

export default function SolutionsIndexPage() {
  const iconMap: Record<string, typeof Droplets> = {
    'roof-waterproofing-ghana': Droplets,
    'damp-wall-water-seepage-repair': ShieldCheck,
    'concrete-waterproofing-admixtures': Building2,
    'waterproof-exterior-wall-coatings': Paintbrush,
    'construction-chemicals-contractors-ghana': Hammer,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Industrial & Construction Chemical Solutions in Ghana',
    description:
      'Engineered problem-solving formulations for roof leaks, rising damp, concrete waterproofing, and architectural wall coatings in Ghana.',
    url: `${siteUrl}/solutions`,
    provider: {
      '@type': 'Organization',
      name: 'Prodeal Industries Ltd',
      url: siteUrl,
    },
    hasPart: SOLUTIONS_LIST.map((sol) => ({
      '@type': 'WebPage',
      name: sol.title,
      url: `${siteUrl}/solutions/${sol.slug}`,
      description: sol.metaDescription,
    })),
  };

  return (
    <div className="bg-brand-surface min-h-screen">
      {/* Invisible Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-brand-border/30">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-brand-blue uppercase">
              Engineered Problem-to-Solution Guides
            </span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-brand-deep-blue tracking-tight leading-tight mb-6">
            Waterproofing & Construction Chemical Solutions
          </h1>

          <p className="text-base sm:text-lg text-brand-deep-blue/70 font-light leading-relaxed mb-8">
            Engineered formulations for Ghana’s tropical climate. Resolve roof leaks, rising damp, porous masonry, and structural water damage with certified B2B industrial chemicals.
          </p>

          <div className="flex flex-wrap gap-4 items-center text-xs font-mono text-brand-deep-blue/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> EPA-Compliant Formulations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rapid Nationwide Dispatch
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Certified Safety & Data Sheets
            </span>
          </div>
        </div>
      </section>

      {/* Solution Guides Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SOLUTIONS_LIST.map((sol) => {
            const Icon = iconMap[sol.slug] || Droplets;
            return (
              <div
                key={sol.slug}
                className="group flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-8 border border-brand-border/40 hover:border-brand-blue/40 shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-deep-blue/40">
                      {sol.category}
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-deep-blue leading-snug mb-3 group-hover:text-brand-blue transition-colors">
                    {sol.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-brand-deep-blue/70 font-light leading-relaxed mb-6">
                    {sol.blufAnswer}
                  </p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-deep-blue/50 block">
                      Common Search Questions Solved:
                    </span>
                    <ul className="text-xs text-brand-deep-blue/80 space-y-1">
                      {sol.targetQueries.slice(0, 3).map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-brand-blue text-xs leading-none mt-0.5">•</span>
                          <span className="italic">&ldquo;{q}&rdquo;</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/20 flex items-center justify-between">
                  <Link
                    href={`/solutions/${sol.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider hover:gap-3 transition-all"
                  >
                    <span>Read Technical Solution Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Catalog CTA Banner */}
      <section className="py-16 bg-brand-deep-blue text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-blue mb-2">
              B2B Wholesale & Custom Formulation
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-tight mb-3">
              Need Bulk Supply or Specific Formulations?
            </h2>
            <p className="text-sm text-white/70 font-light max-w-xl leading-relaxed">
              Contact our technical formulation desk in Accra for bespoke batch specifications, site coverage assessments, and commercial contractor rates.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0">
            <Link
              href="/divisions/chemicals"
              className="px-6 py-3 bg-white text-brand-deep-blue rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all shadow-md"
            >
              View Chemical Catalog
            </Link>
            <Link
              href="/support"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-white/20 transition-all"
            >
              Contact Technical Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
