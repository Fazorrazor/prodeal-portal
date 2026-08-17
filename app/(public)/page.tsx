import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { OrganizationJsonLd } from '../../components/shared/JsonLd';
import { ChemicalCatalog } from '../../components/division/chemicals/ChemicalCatalog';
import { InventoryTable } from '../../components/division/disposable-bowls/InventoryTable';
import { CardSkeleton } from '../../components/shared/skeletons/CardSkeleton';
import { HeroVideoBackground } from '../../components/shared/HeroVideoBackground';

// Revalidate every 5 minutes to ensure Bowls inventory data remains fresh
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Industrial Chemical Suppliers & Wholesale Disposables in Ghana | Prodeal',
  description: 'Prodeal Industries Ltd is a leading industrial chemical supplier and wholesale distributor of catering disposables, 3D signages, and corporate souvenirs in Ghana.',
  alternates: {
    canonical: 'https://www.prodealindustries.com',
  },
};

export default function HomePage() {
  const siteUrl = 'https://www.prodealindustries.com';
  
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC]">
      <OrganizationJsonLd siteUrl={siteUrl} />

      {/* AUTHORITATIVE INDUSTRIAL HERO */}
      <section className="relative w-full text-white border-b-4 border-brand-blue min-h-[60vh] flex items-center">
        <HeroVideoBackground />
        
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col items-start">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Industrial Chemical Suppliers & Wholesale B2B Disposables
          </h1>
          <p className="text-lg text-white/90 max-w-2xl font-body leading-relaxed mb-10">
            Direct access to commercial-grade chemicals, catering disposables, merchandising, and structural signage. Built for scale, priced for wholesale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/divisions/chemicals" className="px-8 py-3.5 bg-brand-blue text-white font-bold text-center hover:bg-brand-deep-blue transition-colors rounded-none">
              Browse Chemicals
            </Link>
            <Link href="/divisions/bowls" className="px-8 py-3.5 bg-transparent border-2 border-white text-white font-bold text-center hover:bg-white hover:text-brand-deep-blue transition-colors rounded-none">
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
