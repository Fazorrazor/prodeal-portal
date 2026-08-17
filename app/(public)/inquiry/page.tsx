import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { GenericInquiryClient } from './GenericInquiryClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Request a Quote | Prodeal Industries Ltd',
  description: 'Submit an inquiry for industrial chemicals, wholesale catering disposables, corporate printing, or 3D signages from Prodeal Industries Ltd.',
  openGraph: {
    title: 'Request a Quote | Prodeal Industries Ltd',
    description: 'Submit an inquiry for industrial chemicals, wholesale catering disposables, corporate printing, or 3D signages from Prodeal Industries Ltd.',
  }
};

export default async function GenericInquiryPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
  });

  const { data: products } = await supabase
    .from('products')
    .select('id, name, divisions!inner(slug)')
    .eq('is_active', true);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <GenericInquiryClient products={products || []} />
    </div>
  );
}
