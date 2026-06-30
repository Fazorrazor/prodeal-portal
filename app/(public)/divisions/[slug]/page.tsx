import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
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

// Skeletons
import { GallerySkeleton } from '../../../../components/shared/skeletons/GallerySkeleton';
import { TableSkeleton } from '../../../../components/shared/skeletons/TableSkeleton';
import { CardSkeleton } from '../../../../components/shared/skeletons/CardSkeleton';

// --- SEO: Per-division metadata ---
// generateMetadata is called by Next.js at request time for each slug.
// It MUST be a separate export from the page component — do not merge them.
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const data = DIVISION_DATA[slug as keyof typeof DIVISION_DATA];

  // If the slug is invalid, notFound() handles the 404 inside the page.
  // Here we just return a minimal fallback so Next.js doesn't crash.
  if (!data) {
    return {
      title: 'Division Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';
  const pageUrl = `${siteUrl}${data.href}`;

  return {
    title: data.title,
    description: data.tagline,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${data.title} | Prodeal Systems Ltd.`,
      description: data.tagline,
      url: pageUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.title} | Prodeal Systems Ltd.`,
      description: data.tagline,
    },
  };
}

// Set the baseline revalidation to 300 (5 minutes).
// This strictly satisfies the workflow requirement for the 'bowls' division's
// live inventory freshness, while keeping the other routes fast and static.
export const revalidate = 300;

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
            <Suspense fallback={<GallerySkeleton />}>
              <SignageGallery />
            </Suspense>
          </DivisionErrorBoundary>
          <ProjectFAQ />
        </div>
      )}

      {slug === 'printing' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <Suspense fallback={<CardSkeleton />}>
              <ProductCatalog />
            </Suspense>
          </DivisionErrorBoundary>
        </div>
      )}

      {slug === 'bowls' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <Suspense fallback={<TableSkeleton />}>
              <InventoryTable />
            </Suspense>
          </DivisionErrorBoundary>
          <BulkOrderNote />
        </div>
      )}

      {slug === 'chemicals' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <Suspense fallback={<CardSkeleton />}>
              <ChemicalCatalog />
            </Suspense>
          </DivisionErrorBoundary>
        </div>
      )}
    </DivisionLayout>
  );
}
