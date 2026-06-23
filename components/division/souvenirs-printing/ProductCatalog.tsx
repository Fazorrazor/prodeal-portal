import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';
import { ProductImageFallback } from '../../shared/ProductImageFallback';
import { ImageLightbox } from '../../shared/ImageLightbox';

export async function ProductCatalog() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: products, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'printing')
    .order('name')
    .limit(100);

  if (error) {
    throw new Error('Failed to load catalog');
  }

  const souvenirs = products?.filter(p => p.category === 'Souvenirs') || [];
  const printing = products?.filter(p => p.category === 'Printing') || [];

  return (
    <div className="flex flex-col gap-16">

      {/* Souvenirs Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-8">
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
              — Custom Merchandise
            </p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
              Souvenirs
            </h2>
          </div>
          {souvenirs.length > 0 && (
            <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
              {souvenirs.length} product{souvenirs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {souvenirs.length === 0 ? (
          <div className="border-t border-brand-border/30 pt-8">
            <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tighter">
              No souvenirs yet.
            </h3>
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/80 mt-1">
              Check back soon — new products are added regularly.
            </p>
          </div>
        ) : (
          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {souvenirs.map((product, index) => (
              <ScrollRevealItem key={product.id} className="h-full">
                <ProductCard product={product} isPriority={index < 4} from="printing" />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        )}
      </section>

      {/* Printing Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-8">
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
              — Commercial Print Services
            </p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
              Printing
            </h2>
          </div>
          {printing.length > 0 && (
            <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
              {printing.length} product{printing.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {printing.length === 0 ? (
          <div className="border-t border-brand-border/30 pt-8">
            <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tighter">
              No printing products yet.
            </h3>
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/80 mt-1">
              Check back soon — new products are added regularly.
            </p>
          </div>
        ) : (
          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {printing.map((product, index) => (
              <ScrollRevealItem key={product.id} className="h-full">
                <ProductCard product={product} isPriority={index < 4} from="printing" />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}

function ProductCard({
  product,
  isPriority = false,
  from,
}: {
  product: { id: string; name: string; description?: string | null; image_path?: string | null; metadata?: { price_range?: string } | null; [key: string]: unknown };
  isPriority?: boolean;
  from: string;
}) {
  const priceRange = product.metadata?.price_range || 'Quote Only';

  return (
    <div className="flex flex-col h-full group border-b-2 border-brand-border/40 pb-5 active:border-brand-blue transition-colors">
      {/* Image */}
      <ImageLightbox
        src={product.image_path || ''}
        alt={product.name}
        className="relative w-full aspect-[4/3] bg-black/5 overflow-hidden block active:opacity-80 transition-opacity mb-4"
      >
        {product.image_path ? (
          <Image
            src={product.image_path}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-full object-cover"
            priority={isPriority}
          />
        ) : (
          <ProductImageFallback />
        )}
        {/* Price badge */}
        <div className="absolute top-0 right-0 bg-brand-deep-blue text-white px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest">
          {priceRange}
        </div>
      </ImageLightbox>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="font-heading font-bold text-base sm:text-lg text-brand-deep-blue uppercase tracking-tight leading-snug mb-1.5">
          {product.name}
        </h3>
        <p className="text-xs text-brand-deep-blue/80 font-body leading-relaxed mb-4 flex-1">
          {product.description || 'Customizable corporate merchandise'}
        </p>
        <Link
          href={`/inquiry/${product.id}?from=${from}`}
          className="block w-full sm:w-auto sm:self-end px-6 py-3.5 bg-brand-deep-blue text-white text-[10px] font-bold uppercase tracking-widest text-center active:bg-brand-blue transition-colors min-h-[44px] flex items-center justify-center"
        >
          Inquire About This
        </Link>
      </div>
    </div>
  );
}
