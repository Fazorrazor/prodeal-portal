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
import { ChemicalFilters } from '../../../../components/division/chemicals/ChemicalFilters';
import { SafetyNotice } from '../../../../components/division/chemicals/SafetyNotice';

// Set the baseline revalidation to 300 (5 minutes). 
// This strictly satisfies the workflow requirement for the 'bowls' division's 
// live inventory freshness, while keeping the other routes fast and static.


export const revalidate = 300;

export function generateStaticParams() {
  return [
    { slug: 'signages' },
    { slug: 'printing' },
    { slug: 'bowls' },
    { slug: 'chemicals' },
  ];
}

export default function DivisionPage({ params }: { params: { slug: string } }) {
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
        <div className="flex flex-col">
          <BulkOrderNote />
          <DivisionErrorBoundary>
            <InventoryTable />
          </DivisionErrorBoundary>
        </div>
      )}

      {slug === 'chemicals' && (
        <div className="flex flex-col">
          <SafetyNotice />
          <ChemicalSearchBar />
          <ChemicalFilters />
          <DivisionErrorBoundary>
            <ChemicalCatalog />
          </DivisionErrorBoundary>
        </div>
      )}
    </DivisionLayout>
  );
}
