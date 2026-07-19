import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InquiryPageClient } from './InquiryPageClient';

export const dynamic = 'force-dynamic';

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

export async function generateMetadata(
  props: { params: Promise<{ productId: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: product } = await supabase
    .from('products')
    .select('name, description, divisions(display_name)')
    .eq('id', params.productId)
    .single();

  if (!product) {
    return { title: 'Product Not Found | Prodeal Industries Ltd' };
  }

  const division = Array.isArray(product.divisions) ? product.divisions[0] : product.divisions;
  const divisionName = (division as any)?.display_name || 'Industrial Supplies';
  
  // Ensure description is plain text and truncated for SEO optimally
  // We use a manual parser instead of regex to satisfy CodeQL's strict multi-character sanitization rules
  const seoDescription = product.description 
    ? stripHtml(product.description).substring(0, 155) + '...'
    : `Request a B2B quote for ${product.name} from Prodeal Industries Ltd High-volume industrial supply delivered with precision.`;

  return {
    title: `Buy ${product.name} | ${divisionName} | Prodeal Industries Ltd`,
    description: seoDescription,
    openGraph: {
      title: `${product.name} | Prodeal Industries Ltd`,
      description: seoDescription,
    }
  };
}

export default async function InquiryPage(props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: product, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug, display_name)')
    .eq('id', params.productId)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch similar products (same division, excluding current)
  const { data: similarProducts } = await supabase
    .from('products')
    .select('id, name, image_path, description')
    .eq('division_id', product.division_id)
    .neq('id', product.id)
    .limit(4);

  const moq = 1;

  return <InquiryPageClient product={product} moq={moq} similarProducts={similarProducts || []} />;
}
