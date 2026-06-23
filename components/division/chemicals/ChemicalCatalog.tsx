import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';
import { ProductImageFallback } from '../../shared/ProductImageFallback';
import { ImageLightbox } from '../../shared/ImageLightbox';

export async function ChemicalCatalog() {
  const supabase = createServerComponentClient({ cookies });

  const { data: products, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'chemicals')
    .order('name')
    .limit(50);

  if (error) {
    throw new Error('Failed to load chemical catalog');
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-8">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/40 mb-1.5">
            — Product Register
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Available Products
          </h2>
        </div>
        {products && products.length > 0 && (
          <p className="text-[10px] font-mono text-brand-deep-blue/40 uppercase tracking-widest">
            {products.length} compound{products.length !== 1 ? 's' : ''} listed
          </p>
        )}
      </div>

      {!products || products.length === 0 ? (
        <div className="border-t border-brand-border/30 pt-8">
          <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tighter">
            No products registered.
          </h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/40 mt-1">
            Contact us directly for chemical inquiries.
          </p>
        </div>
      ) : (
        <ScrollReveal className="flex flex-col">
          {products.map((product) => (
            <ScrollRevealItem key={product.id}>
              <ChemicalRow product={product} />
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      )}
    </div>
  );
}

function ChemicalRow({ product }: {
  product: {
    id: string;
    name: string;
    description?: string | null;
    image_path?: string | null;
    metadata?: { cas_number?: string; grade?: string } | null;
    [key: string]: unknown;
  }
}) {
  const grade = product.metadata?.grade || 'Industrial';
  const cas = product.metadata?.cas_number;

  return (
    <div className="border-b border-brand-border/40 py-6 flex flex-col sm:flex-row gap-5 group active:bg-black/5 transition-colors">

      {/* Image thumbnail */}
      <ImageLightbox
        src={product.image_path || ''}
        alt={product.name}
        className="block w-full sm:w-28 sm:h-28 aspect-video sm:aspect-square bg-black/5 overflow-hidden shrink-0 active:opacity-80 transition-opacity"
      >
        {product.image_path ? (
          <Image
            src={product.image_path}
            alt={product.name}
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        ) : (
          <ProductImageFallback />
        )}
      </ImageLightbox>

      {/* Data block */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-brand-deep-blue uppercase tracking-tight leading-snug">
              {product.name}
            </h3>
            {cas && (
              <div className="text-[10px] font-mono font-bold text-brand-deep-blue/40 mt-0.5 uppercase tracking-widest">
                CAS: {cas}
              </div>
            )}
          </div>
          {/* Grade badge — bordered outline */}
          <span className="shrink-0 px-3 py-1.5 border border-brand-deep-blue text-brand-deep-blue text-[9px] font-mono font-bold uppercase tracking-widest">
            {grade}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-brand-deep-blue/60 font-body leading-relaxed mb-4 flex-1">
          {product.description || 'Standard industrial chemical formulation.'}
        </p>

        <Link
          href={`/inquiry/${product.id}?from=chemicals`}
          className="inline-flex items-center justify-center w-full sm:w-auto sm:self-end px-6 py-3.5 bg-brand-deep-blue text-white text-[10px] font-bold uppercase tracking-widest active:bg-brand-blue transition-colors min-h-[44px]"
        >
          Inquire About This
        </Link>
      </div>
    </div>
  );
}
