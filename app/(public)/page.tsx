import { Suspense } from 'react';
import { OrganizationJsonLd } from '../../components/shared/JsonLd';
import { ChemicalCatalog } from '../../components/division/chemicals/ChemicalCatalog';
import { InventoryTable } from '../../components/division/disposable-bowls/InventoryTable';
import { CardSkeleton } from '../../components/shared/skeletons/CardSkeleton';
import { TableSkeleton } from '../../components/shared/skeletons/TableSkeleton';

// Revalidate every 5 minutes to ensure Bowls inventory data remains fresh
export const revalidate = 300;

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';
  
  return (
    <div className="flex flex-col w-full">
      <OrganizationJsonLd siteUrl={siteUrl} />
      
      {/* 
        BRUTALIST ARCHITECTURE
        No cards. No fluff. Direct data access immediately upon landing.
        Extreme typographic hierarchy and strict border demarcation.
      */}



      {/* PAGE TITLE */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 bg-brand-surface">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-brand-deep-blue tracking-tighter uppercase leading-none">
            Available Products
          </h1>
        </div>
      </div>

      {/* CHEMICALS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-16 bg-brand-surface">
        <div className="max-w-7xl mx-auto w-full">
          <Suspense fallback={<CardSkeleton />}>
            <ChemicalCatalog />
          </Suspense>
        </div>
      </section>

      {/* SEPARATOR BORDER */}
      <div className="w-full h-[2px] bg-brand-deep-blue/20" />

      {/* BOWLS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-brand-surface">
        <div className="max-w-7xl mx-auto w-full">
          <Suspense fallback={<TableSkeleton />}>
            <InventoryTable />
          </Suspense>
        </div>
      </section>

    </div>
  );
}
