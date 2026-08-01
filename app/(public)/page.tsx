import { Suspense } from 'react';
import Link from 'next/link';
import { OrganizationJsonLd } from '../../components/shared/JsonLd';
import { ChemicalCatalog } from '../../components/division/chemicals/ChemicalCatalog';
import { InventoryTable } from '../../components/division/disposable-bowls/InventoryTable';
import { CardSkeleton } from '../../components/shared/skeletons/CardSkeleton';

// Revalidate every 5 minutes to ensure Bowls inventory data remains fresh
export const revalidate = 300;

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';
  
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC]">
      <OrganizationJsonLd siteUrl={siteUrl} />

      {/* AUTHORITATIVE INDUSTRIAL HERO */}
      <section className="w-full bg-brand-deep-blue text-white border-b-4 border-brand-blue">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-start">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Wholesale Industrial Supplies & Custom Fabrication
          </h1>
          <p className="text-lg text-white/70 max-w-2xl font-body leading-relaxed mb-10">
            Direct access to commercial-grade chemicals, catering disposables, merchandising, and structural signage. Built for scale, priced for wholesale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="#chemicals" className="px-8 py-3.5 bg-brand-blue text-white font-bold rounded text-center hover:bg-blue-600 transition-colors shadow-sm">
              Browse Chemicals
            </Link>
            <Link href="#bowls" className="px-8 py-3.5 bg-transparent border border-white/20 text-white font-bold rounded text-center hover:bg-white/5 transition-colors">
              View Disposables
            </Link>
          </div>
        </div>
      </section>

      {/* CHEMICALS SECTION */}
      <section id="chemicals" className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto w-full">
          <Suspense fallback={<CardSkeleton />}>
            <ChemicalCatalog />
          </Suspense>
        </div>
      </section>

      {/* BOWLS SECTION */}
      <section id="bowls" className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white border-t border-brand-border/10 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto w-full">
          <Suspense fallback={<CardSkeleton />}>
            <InventoryTable />
          </Suspense>
        </div>
      </section>

    </div>
  );
}
