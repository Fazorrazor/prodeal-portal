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

      {/* MODERN E-COMMERCE HERO */}
      <section className="relative w-full bg-brand-deep-blue text-white overflow-hidden">
        {/* Background Decorative Graphic */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-blue to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-start">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-widest text-brand-blue mb-6">
            Pro Deal Industries Ltd
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6 max-w-3xl">
            Premium Industrial <br className="hidden md:block"/> & Commercial Supplies
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl font-body leading-relaxed mb-10">
            Your trusted B2B partner for industrial chemicals, catering disposables, custom merchandise, and large-scale signage. Wholesale pricing with uncompromising quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="#chemicals" className="px-8 py-4 bg-brand-blue text-white font-bold rounded-full text-center hover:bg-white hover:text-brand-deep-blue transition-all shadow-lg active:scale-95">
              Browse Chemicals
            </Link>
            <Link href="#bowls" className="px-8 py-4 bg-white/10 backdrop-blur border border-white/30 text-white font-bold rounded-full text-center hover:bg-white/20 transition-all active:scale-95">
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
