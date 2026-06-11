import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { InquiryPageClient } from './InquiryPageClient';

export const dynamic = 'force-dynamic';

export default async function InquiryPage({ params }: { params: { productId: string } }) {
  const supabase = createServerComponentClient({ cookies });

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
