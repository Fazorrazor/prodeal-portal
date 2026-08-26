import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { InquiryPageClient } from './InquiryPageClient';

// Enable Incremental Static Regeneration (5 minutes) for sub-50ms Edge TTFB
export const revalidate = 300;

const stripHtml = (html: string) => {
  let text = '';
  let inside = false;
  for (let i = 0; i < html.length; i++) {
    if (html[i] === '<') inside = true;
    else if (html[i] === '>') inside = false;
    else if (!inside) text += html[i];
  }
  return text.trim().replace(/\s+/g, ' ');
};

// Deduplicated cached data fetcher shared across metadata and page render
const getProductData = cache(async (productId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: product, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug, display_name)')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return { product: null, similarProducts: [] };
  }

  // Fetch similar products (same division, excluding current)
  const { data: similarProducts } = await supabase
    .from('products')
    .select('id, name, image_path, description')
    .eq('division_id', product.division_id)
    .neq('id', product.id)
    .limit(4);

  return { product, similarProducts: similarProducts || [] };
});

function getCleanProductTitle(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 45) return trimmed;

  // Remove parenthetical details if too long: e.g. "1000ml Single Compartment Bowl (Clear Lid / Black Base)" -> "1000ml Single Compartment Bowl"
  const withoutParens = trimmed.replace(/\s*\([^)]*\)/g, '').trim();
  if (withoutParens.length >= 5 && withoutParens.length <= 45) {
    return withoutParens;
  }

  return trimmed.slice(0, 42).trim() + '...';
}

export async function generateMetadata(
  props: { params: Promise<{ productId: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const { product } = await getProductData(params.productId);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const cleanTitle = getCleanProductTitle(product.name);
  const pageUrl = `https://www.prodealindustries.com/inquiry/${product.id}`;
  
  const seoDescription = product.description 
    ? stripHtml(product.description).substring(0, 155) + '...'
    : `Request a wholesale quote for ${product.name} from Prodeal Industries Ltd. High-volume industrial supply delivered with precision.`;

  return {
    title: cleanTitle,
    description: seoDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${cleanTitle} | Prodeal Industries`,
      description: seoDescription,
      url: pageUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanTitle} | Prodeal Industries`,
      description: seoDescription,
    },
  };
}

export default async function InquiryPage(props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const { product, similarProducts } = await getProductData(params.productId);

  if (!product) {
    notFound();
  }

  const moq = 1;

  return <InquiryPageClient product={product} moq={moq} similarProducts={similarProducts} />;
}
