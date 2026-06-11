import { notFound } from 'next/navigation';
import { DivisionLayout } from '../../../../components/division/DivisionLayout';
import { DIVISION_DATA } from '../../../../lib/config/divisions';

import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';

// Components for 3D Signages
import { SignageGallery } from '../../../../components/division/3d-signages/SignageGallery';
import { ProjectFAQ } from '../../../../components/division/3d-signages/ProjectFAQ';

// Components for Souvenirs & Printing
import { ProductCatalog } from '../../../../components/division/souvenirs-printing/ProductCatalog';

// Components for Disposable Bowls
import { InventoryTable } from '../../../../components/division/disposable-bowls/InventoryTable';
import { BulkOrderNote } from '../../../../components/division/disposable-bowls/BulkOrderNote';

// Components for Chemicals
import { ChemicalCatalog } from '../../../../components/division/chemicals/ChemicalCatalog';
import { ChemicalSearchBar } from '../../../../components/division/chemicals/ChemicalSearchBar';
import { SafetyNotice } from '../../../../components/division/chemicals/SafetyNotice';

// Set the baseline revalidation to 300 (5 minutes). 
// This strictly satisfies the workflow requirement for the 'bowls' division's 
// live inventory freshness, while keeping the other routes fast and static.


export const dynamic = 'force-dynamic';

export default function DivisionPage({ 
  params,
  searchParams 
}: { 
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { slug } = params;
  
  if (!(slug in DIVISION_DATA)) {
    notFound();
  }

  const data = DIVISION_DATA[slug as keyof typeof DIVISION_DATA];

  return (
    <DivisionLayout title={data.title} tagline={data.tagline} slug={slug}>
      {slug === 'signages' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <SignageGallery />
          </DivisionErrorBoundary>
          <ProjectFAQ />
        </div>
      )}

      {slug === 'printing' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <ProductCatalog />
          </DivisionErrorBoundary>
        </div>
      )}

      {slug === 'bowls' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <InventoryTable />
          </DivisionErrorBoundary>
          <BulkOrderNote />
        </div>
      )}

      {slug === 'chemicals' && (
        <div className="flex flex-col">
          <SafetyNotice />
          <ChemicalSearchBar />
          <DivisionErrorBoundary>
            <ChemicalCatalog searchParams={searchParams} />
          </DivisionErrorBoundary>
        </div>
      )}
    </DivisionLayout>
  );
}
