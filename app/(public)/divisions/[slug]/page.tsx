import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DivisionLayout } from '../../../../components/division/DivisionLayout';
import { DIVISION_DATA } from '../../../../lib/config/divisions';

import { DivisionErrorBoundary } from '../../../../components/shared/DivisionErrorBoundary';
import { Suspense } from 'react';

// Shared FAQ Component
import { DivisionFAQ, type FAQ } from '../../../../components/shared/DivisionFAQ';

// Components for 3D Signages
import { SignageGallery } from '../../../../components/division/3d-signages/SignageGallery';

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
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const data = DIVISION_DATA[slug as keyof typeof DIVISION_DATA];

  if (!data || !data.isActive) {
    return {
      title: 'Division Not Found',
    };
  }

  const siteUrl = 'https://www.prodealindustries.com';
  const pageUrl = `${siteUrl}${data.href}`;

  // Tailored SEO Configuration based on keyword research
  const seoConfig: Record<string, { title: string; description: string }> = {
    bowls: {
      title: 'Wholesale Disposable Bowls in Ghana',
      description: 'Looking for wholesale disposable bowls in Ghana? We supply bulk premium catering disposables, plastic bowls with lids, and eco-friendly food packaging at wholesale prices.',
    },
    signages: {
      title: '3D Signage Makers & Custom Signs in Ghana',
      description: 'Top 3D signage makers in Ghana. Custom fabricated illuminated signs, outdoor corporate signage, and LED channel letters for maximum corporate visibility.',
    },
    printing: {
      title: 'Corporate Souvenirs & Bulk Printing in Ghana',
      description: 'Wholesale corporate souvenirs, promotional items, branded apparel, and commercial bulk printing services in Ghana.',
    },
    chemicals: {
      title: 'Industrial Chemicals Supplier in Ghana',
      description: 'Bulk industrial chemicals supplier in Ghana. Industrial-grade waterproofing, architectural paints, sealants, and structural coatings for construction and housing.',
    }
  };

  const seoData = seoConfig[slug] || { title: data.title, description: data.tagline };

  return {
    title: seoData.title,
    description: seoData.description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${seoData.title} | Prodeal Industries Ltd`,
      description: seoData.description,
      url: pageUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seoData.title} | Prodeal Industries Ltd`,
      description: seoData.description,
    },
  };
}

export const revalidate = 300;

// FAQ Data for AI Generation and Display
const DIVISION_FAQS: Record<string, FAQ[]> = {
  signages: [
    {
      question: 'What materials are best for outdoor 3D signages in Ghana?',
      answer: 'We highly recommend industrial-grade acrylic, aluminum composite panels (ACP), and stainless steel. These materials are UV-resistant and withstand Ghanaian weather conditions without fading or rusting.',
    },
    {
      question: 'Do you handle the municipal permitting and installation of the signs?',
      answer: 'Yes. Our full-suite service includes site surveying, assistance with local municipal permitting if required, and professional mounting/installation by our certified technicians.',
    },
    {
      question: 'What is the standard turnaround time for 3D channel letters?',
      answer: 'For standard illuminated signs, our typical turnaround is 7–10 business days after artwork approval. Large-scale structural installations may require 14–21 days.',
    },
  ],
  bowls: [
    {
      question: 'What is the minimum order quantity for bulk disposable bowls?',
      answer: 'Our wholesale minimum order quantity (MOQ) depends on the exact SKUs but generally starts at carton-level quantities to ensure you receive the most competitive B2B pricing.',
    },
    {
      question: 'Do you provide eco-friendly or biodegradable food packaging?',
      answer: 'Yes, we supply premium eco-friendly catering disposables, including bagasse (sugarcane fiber) and kraft paper options, which are highly demanded by sustainable restaurants.',
    },
    {
      question: 'How fast is your wholesale delivery within Ghana?',
      answer: 'We maintain a live inventory system. In-stock items ordered before 12 PM typically ship out within 24-48 hours. Nationwide delivery is available for all catering supplies.',
    },
  ],
  chemicals: [
    {
      question: 'Are your industrial chemicals EPA compliant?',
      answer: 'Absolutely. Pro Deal Industries strictly adheres to all regulatory frameworks. Our chemicals meet Environmental Protection Agency (EPA) standards and industrial compliance protocols for construction and manufacturing materials.',
    },
    {
      question: 'Do you provide Safety Data Sheets (SDS) and technical support?',
      answer: 'Yes. Every chemical batch is supplied with an official Safety Data Sheet (SDS), and our team provides technical guidance on safe storage, handling, and application.',
    },
    {
      question: 'Can I order bulk chemicals for housing and construction materials?',
      answer: 'Yes, we supply industrial-grade bulk chemicals specifically formulated for construction, housing materials, and heavy manufacturing.',
    },
  ],
  printing: [
    {
      question: 'What is the minimum order quantity for branded corporate souvenirs?',
      answer: 'Our MOQ is flexible depending on the item, but typical corporate branding (like customized pens, notebooks, and apparel) starts at bulk quantities of 50 to 100 units.',
    },
    {
      question: 'How durable is the branding on your promotional items?',
      answer: 'We utilize industrial screen printing, laser engraving, and high-quality embroidery to ensure your brand logo outlasts the item itself without fading or peeling.',
    },
    {
      question: 'Do you offer fast turnaround for corporate annual reports and brochures?',
      answer: 'Yes, our high-capacity offset and digital printing presses allow us to handle large-scale corporate printing projects with strict deadlines and guaranteed quality consistency.',
    },
  ],
};

export default async function DivisionPage(
  props: { 
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const params = await props.params;
  const { slug } = params;

  const data = DIVISION_DATA[slug as keyof typeof DIVISION_DATA];

  if (!data || !data.isActive) {
    notFound();
  }

  const currentFaqs = DIVISION_FAQS[slug] || [];

  return (
    <DivisionLayout title={data.title} tagline={data.tagline} slug={slug}>
      {slug === 'signages' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <Suspense fallback={<GallerySkeleton />}>
              <SignageGallery />
            </Suspense>
          </DivisionErrorBoundary>
          <DivisionFAQ faqs={currentFaqs} />
        </div>
      )}

      {slug === 'printing' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <Suspense fallback={<CardSkeleton />}>
              <ProductCatalog />
            </Suspense>
          </DivisionErrorBoundary>
          <DivisionFAQ faqs={currentFaqs} />
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
          <DivisionFAQ faqs={currentFaqs} />
        </div>
      )}

      {slug === 'chemicals' && (
        <div className="flex flex-col gap-8">
          <DivisionErrorBoundary>
            <Suspense fallback={<CardSkeleton />}>
              <ChemicalCatalog />
            </Suspense>
          </DivisionErrorBoundary>
          <DivisionFAQ faqs={currentFaqs} />
        </div>
      )}
    </DivisionLayout>
  );
}
