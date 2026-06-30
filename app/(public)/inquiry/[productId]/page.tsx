import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InquiryPageClient } from './InquiryPageClient';

export const dynamic = 'force-dynamic';

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
    return { title: 'Product Not Found | Prodeal Systems' };
  }

  const division = Array.isArray(product.divisions) ? product.divisions[0] : product.divisions;
  const divisionName = (division as any)?.display_name || 'Industrial Supplies';
  // Ensure description is plain text and truncated for SEO optimally
  const seoDescription = product.description 
    ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...'
    : `Request a B2B quote for ${product.name} from Prodeal Systems Ltd. High-volume industrial supply delivered with precision.`;

  return {
    title: `Buy ${product.name} | ${divisionName} | Prodeal Systems`,
    description: seoDescription,
    openGraph: {
      title: `${product.name} | Prodeal Systems`,
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

  const moq = 1;

  return <InquiryPageClient product={product} moq={moq} />;
}
