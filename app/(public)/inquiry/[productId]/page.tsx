import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { InquiryFormClient } from './InquiryFormClient';

export const dynamic = 'force-dynamic';

export default async function InquiryPage({ params }: { params: { productId: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: product, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug, title)')
    .eq('id', params.productId)
    .single();

  if (error || !product) {
    notFound();
  }

  const moq = (product.metadata as any)?.moq || 100;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-72px)] bg-brand-surface">
      {/* Left Column: Product Context (Sticky on Desktop, Header on Mobile) */}
      <div className="w-full md:w-[400px] lg:w-[500px] border-b-2 md:border-b-0 md:border-r-2 border-brand-border/60 flex flex-col bg-black/5 md:sticky md:top-[72px] md:h-[calc(100vh-72px)]">
        <div className="relative w-full aspect-video md:aspect-[4/3] bg-black/10 overflow-hidden shrink-0">
          {product.image_path ? (
            <Image 
              src={product.image_path}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-brand-deep-blue/40 uppercase tracking-widest text-xs">
              No Image Available
            </div>
          )}
        </div>
        
        <div className="p-6 md:p-12 flex flex-col flex-1">
          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-2 border-b border-brand-border/30 pb-2 inline-block">
            {product.divisions.title}
          </span>
          <h1 className="font-heading font-bold text-3xl md:text-5xl text-brand-deep-blue uppercase tracking-tighter leading-none mb-4">
            {product.name}
          </h1>
          <p className="text-sm font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-8">
            SKU: {product.id.split('-')[0]}
          </p>

          <div className="mt-auto pt-8 border-t-2 border-brand-border/60 flex justify-between items-end">
            <div>
              <span className="block text-[10px] font-bold text-brand-deep-blue/40 uppercase tracking-widest mb-1">
                Minimum Order Qty
              </span>
              <span className="text-2xl font-mono font-bold text-brand-red">
                {moq}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Inquiry Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 md:p-12">
          <div className="mb-12">
            <h2 className="font-heading font-bold text-3xl text-brand-deep-blue uppercase tracking-tight mb-2">
              Inquiry Details
            </h2>
            <p className="text-xs font-bold text-brand-deep-blue/60 uppercase tracking-widest">
              Please provide the specifications below. A representative will contact you via WhatsApp shortly.
            </p>
          </div>

          <InquiryFormClient product={product} divisionSlug={product.divisions.slug} defaultMoq={moq} />
        </div>
      </div>
    </div>
  );
}
