import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, FileText, ChevronRight, MessageSquare, Wrench } from 'lucide-react';
import { SOLUTIONS_DATA, SOLUTIONS_LIST } from '../../../../lib/config/solutions';
import { DivisionFAQ } from '../../../../components/shared/DivisionFAQ';
import { QuickRfqButton } from '../../../../components/shared/QuickRfqButton';

const siteUrl = 'https://www.prodealindustries.com';

export async function generateStaticParams() {
  return SOLUTIONS_LIST.map((sol) => ({
    slug: sol.slug,
  }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const data = SOLUTIONS_DATA[slug];

  if (!data) {
    return {
      title: 'Solution Not Found',
    };
  }

  const pageUrl = `${siteUrl}/solutions/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${data.metaTitle} | Prodeal Industries`,
      description: data.metaDescription,
      url: pageUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.metaTitle} | Prodeal Industries`,
      description: data.metaDescription,
    },
  };
}

export const revalidate = 3600;

export default async function SolutionGuidePage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const guide = SOLUTIONS_DATA[slug];

  if (!guide) {
    notFound();
  }

  const pageUrl = `${siteUrl}/solutions/${guide.slug}`;

  // Multi-schema: FAQPage + HowTo + BreadcrumbList + LocalBusiness
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Solutions',
            item: `${siteUrl}/solutions`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'HowTo',
        name: guide.headline,
        description: guide.blufAnswer,
        step: guide.applicationSteps.map((step) => ({
          '@type': 'HowToStep',
          position: step.step,
          name: step.title,
          text: step.description,
        })),
      },
      {
        '@type': 'LocalBusiness',
        name: 'Prodeal Industries Ltd',
        url: siteUrl,
        telephone: '+233543888800',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Accra',
          addressRegion: 'Greater Accra',
          addressCountry: 'GH',
        },
        areaServed: ['Accra', 'Tema', 'Kumasi', 'Takoradi', 'Ghana', 'West Africa'],
      },
    ],
  };

  const otherGuides = SOLUTIONS_LIST.filter((s) => s.slug !== guide.slug);

  return (
    <div className="bg-brand-surface min-h-screen pb-24">
      {/* Invisible Multi-Schema for AI Engine Grounding */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb & Navigation */}
      <div className="border-b border-brand-border/20 bg-white/50 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-brand-deep-blue/60">
            <Link href="/" className="hover:text-brand-blue transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-deep-blue/30" />
            <Link href="/solutions" className="hover:text-brand-blue transition-colors">
              Solutions
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-deep-blue/30" />
            <span className="text-brand-deep-blue font-semibold truncate max-w-[200px] sm:max-w-none">
              {guide.category}
            </span>
          </nav>

          <Link
            href="/solutions"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-brand-deep-blue/70 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Solutions</span>
          </Link>
        </div>
      </div>

      {/* Main Header / Problem Definition */}
      <header className="pt-10 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-brand-blue uppercase">
              {guide.category} — Ghana Engineering Advisory
            </span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-brand-deep-blue tracking-tight leading-tight mb-6">
            {guide.title}
          </h1>

          <p className="text-lg sm:text-xl text-brand-deep-blue/80 font-normal leading-snug mb-8">
            {guide.headline}
          </p>

          {/* BLUF (Bottom Line Up Front) Box — Structured for AI Snippet Citation */}
          <div className="bg-white border-l-4 border-brand-blue rounded-r-2xl p-6 sm:p-8 shadow-sm mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-blue">
                Bottom Line Up Front (BLUF) Answer
              </span>
            </div>
            <p className="text-sm sm:text-base text-brand-deep-blue font-medium leading-relaxed mb-4">
              {guide.blufAnswer}
            </p>
            <div className="text-xs text-brand-deep-blue/70 font-light bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Key Engineering Takeaway:</strong> {guide.keyTakeaway}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Section: Causes of Failure in Ghana */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border/30 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700">
                Root Cause Analysis
              </p>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-deep-blue">
                Why Standard Methods Fail in Ghana’s Climate
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.causes.map((cause, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <span className="text-xs font-mono font-bold text-amber-600 shrink-0 mt-0.5">
                  0{idx + 1}.
                </span>
                <p className="text-xs sm:text-sm text-brand-deep-blue/80 font-light leading-relaxed">
                  {cause}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Recommended Chemical Formulations & Technical Specs Table */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-blue mb-1">
                Chemical Formulations & Dosage
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-brand-deep-blue">
                Certified Solutions from Prodeal Industries
              </h2>
            </div>
            <Link
              href="/divisions/chemicals"
              className="text-xs font-mono font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
            >
              Browse Full Chemical Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {guide.chemicalSolutions.map((chem, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border/40 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-md">
                      {chem.type}
                    </span>
                    <span className="text-[10px] font-mono text-brand-deep-blue/50 uppercase">
                      Industrial Grade
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-brand-deep-blue mb-2">
                    {chem.name}
                  </h3>

                  <p className="text-xs text-brand-deep-blue/70 font-light leading-relaxed mb-6">
                    {chem.formulation}
                  </p>

                  <div className="space-y-2.5 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-brand-deep-blue/60">Target Surface:</span>
                      <span className="font-semibold text-brand-deep-blue">{chem.surface}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-brand-deep-blue/60">Estimated Coverage:</span>
                      <span className="font-mono font-semibold text-brand-blue">{chem.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-deep-blue/60">Curing / Recoat Time:</span>
                      <span className="font-semibold text-brand-deep-blue">{chem.dryingTime}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-deep-blue/50 block">
                      Key Technical Advantages:
                    </span>
                    {chem.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-xs text-brand-deep-blue/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <QuickRfqButton
                    variant="badge"
                    item={{
                      id: `sol-${guide.slug}-${idx}`,
                      name: chem.name,
                      sku: `SOL-${guide.slug.toUpperCase()}-${idx + 1}`,
                      divisionSlug: 'chemicals',
                      quantity: 1,
                      unit: 'Drum/Jerrycan',
                    }}
                  />
                  <Link
                    href={`https://wa.me/233543888800?text=${encodeURIComponent(`Hello Prodeal Industries, I need an official quote for ${chem.name} for ${guide.title}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Quote</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Step-by-Step Application Procedure */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-border/30 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-blue">
                Applicator Instructions
              </p>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-deep-blue">
                Step-by-Step Professional Application Guide
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guide.applicationSteps.map((step) => (
              <div
                key={step.step}
                className="relative p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-deep-blue text-white text-xs font-mono font-bold mb-3">
                    {step.step}
                  </div>
                  <h3 className="font-display font-bold text-base text-brand-deep-blue mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-deep-blue/70 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Frequently Asked Questions (FAQPage Schema Component) */}
        <section>
          <DivisionFAQ faqs={guide.faqs} />
        </section>

        {/* Section: Related Solutions Navigation */}
        <section className="pt-8 border-t border-brand-border/30">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-deep-blue/50 mb-4">
            Explore Other Technical Solutions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherGuides.map((other) => (
              <Link
                key={other.slug}
                href={`/solutions/${other.slug}`}
                className="p-4 rounded-xl bg-white border border-brand-border/40 hover:border-brand-blue hover:shadow-md transition-all group"
              >
                <span className="text-[9px] font-mono text-brand-deep-blue/40 uppercase block mb-1">
                  {other.category}
                </span>
                <h4 className="font-display font-bold text-xs text-brand-deep-blue group-hover:text-brand-blue transition-colors line-clamp-2">
                  {other.title}
                </h4>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
