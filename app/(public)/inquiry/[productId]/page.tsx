import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { InquiryPageClient } from './InquiryPageClient';

export const dynamic = 'force-dynamic';

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
