import { notFound } from 'next/navigation';
import { DivisionLayout } from '../../../../components/division/DivisionLayout';
import { DIVISION_DATA } from '../../../../lib/config/divisions';

import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';
import { Suspense } from 'react';

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

// Set the baseline revalidation to 1800 (30 minutes). 
// The bowls division has its own route to satisfy the 300s freshness requirement.
export const revalidate = 1800;

export default async function DivisionPage(
  props: { 
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  // We DO NOT await searchParams here at the top level! 
  // If we await it here, the ENTIRE page will suspend and unmount whenever the URL changes, 
  // which destroys the search bar's DOM node and instantly loses focus.
  const params = await props.params;
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
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <ChemicalCatalog />
          </DivisionErrorBoundary>
        </div>
      )}
    </DivisionLayout>
  );
}
