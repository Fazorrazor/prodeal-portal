import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import { GenericInquiryClient } from './GenericInquiryClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description: 'Submit a B2B quote request for industrial chemicals, catering disposables, 3D signages, or corporate printing from Prodeal in Ghana.',
  openGraph: {
    title: 'Request a Quote | Prodeal Industries',
    description: 'Submit a B2B quote request for industrial chemicals, catering disposables, 3D signages, or corporate printing from Prodeal in Ghana.',
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
