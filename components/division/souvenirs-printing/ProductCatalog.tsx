import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ProductImageCarousel } from '../../shared/ProductImageCarousel';
import { QuickRfqButton } from '../../shared/QuickRfqButton';

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
    <div className="flex flex-col gap-24 py-8">

      {/* Souvenirs Section */}
      <section>
        <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[10px] font-medium text-brand-deep-blue/50 tracking-[0.2em] uppercase mb-4">
            Custom Merchandise
          </p>
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-brand-deep-blue leading-tight mb-6 tracking-tight">
            Souvenirs
          </h2>
          <div className="w-12 h-px bg-brand-deep-blue/20 mb-6"></div>
          {souvenirs.length > 0 && (
            <p className="text-sm font-light text-brand-deep-blue/60">
              Curated collection of {souvenirs.length} exclusive items.
            </p>
          )}
        </div>

        {souvenirs.length === 0 ? (
          <div className="py-24 text-center bg-[#fafafa] rounded-3xl mx-4 sm:mx-0">
            <h3 className="font-display font-medium text-2xl text-brand-deep-blue mb-3">
              Curating Collection
            </h3>
            <p className="text-brand-deep-blue/60 font-light text-sm">
              Check back soon for our latest curated merchandise.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
            {souvenirs.map((product, index) => (
              <ProductCard key={product.id} product={product} isPriority={index < 4} from="printing" />
            ))}
          </div>
        )}
      </section>

      {/* Printing Section */}
      <section>
        <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[10px] font-medium text-brand-deep-blue/50 tracking-[0.2em] uppercase mb-4">
            Commercial Print Services
          </p>
          <h2 className="font-display font-medium text-4xl sm:text-5xl text-brand-deep-blue leading-tight mb-6 tracking-tight">
            Printing
          </h2>
          <div className="w-12 h-px bg-brand-deep-blue/20 mb-6"></div>
          {printing.length > 0 && (
            <p className="text-sm font-light text-brand-deep-blue/60">
              Discover our {printing.length} premium printing services.
            </p>
          )}
        </div>

        {printing.length === 0 ? (
          <div className="py-24 text-center bg-[#fafafa] rounded-3xl mx-4 sm:mx-0">
            <h3 className="font-display font-medium text-2xl text-brand-deep-blue mb-3">
              Curating Collection
            </h3>
            <p className="text-brand-deep-blue/60 font-light text-sm">
              Check back soon for our latest printing services.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
            {printing.map((product, index) => (
              <ProductCard key={product.id} product={product} isPriority={index < 4} from="printing" />
            ))}
          </div>
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
  product: { id: string; name: string; sku?: string; description?: string | null; image_path?: string | null; gallery_images?: string[] | null; metadata?: { price_range?: string; moq?: number; } | null; [key: string]: unknown };
  isPriority?: boolean;
  from: string;
}) {
  const priceRange = product.metadata?.price_range || 'Quote Only';
  const moq = product.metadata?.moq || 25;
  const metadataGallery = (product.metadata as any)?.gallery_images || [];
  
  let images = Array.from(new Set([
    product.image_path, 
    ...(product.gallery_images || []), 
    ...metadataGallery
  ].filter(Boolean))) as string[];

  return (
    <div className="group flex flex-col h-full bg-white rounded-2xl p-2 border border-transparent hover:border-brand-border/30 hover:shadow-xl transition-all duration-500">
      <Link href={`/inquiry/${product.id}?from=${from}`} className="flex flex-col flex-1 cursor-pointer outline-none">
        {/* Image Container with subtle elevation on hover */}
        <div className="relative aspect-square w-full bg-[#f5f5f7] rounded-xl overflow-hidden mb-4 transition-all duration-700 ease-out group-hover:-translate-y-1">
          <div className="w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105">
            <ProductImageCarousel 
              images={images} 
              alt={product.name} 
              priority={isPriority} 
            />
          </div>
          {/* Soft, elegant badge */}
          <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md text-brand-deep-blue px-3 py-1 text-[9px] font-medium tracking-wide rounded-full z-20 shadow-xs">
            {priceRange}
          </div>
          {/* Quick RFQ Action */}
          <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <QuickRfqButton
              variant="icon"
              item={{
                id: product.id,
                name: product.name,
                sku: product.sku || product.id.split('-')[0],
                divisionSlug: from,
                quantity: moq,
                unit: `Units (MOQ ${moq})`,
                image_path: images[0],
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-medium text-brand-deep-blue/40 tracking-[0.1em] uppercase">
              MOQ: {moq} units
            </span>
          </div>

          <h3 className="font-display font-medium text-base sm:text-lg text-brand-deep-blue leading-tight mb-1.5 transition-colors group-hover:text-brand-blue">
            {product.name}
          </h3>
          
          <p className="text-xs font-light text-brand-deep-blue/60 leading-relaxed mb-3.5 flex-1 line-clamp-2">
            {product.description || 'Customizable corporate merchandise'}
          </p>
        </div>
      </Link>

      {/* Card Action Footer */}
      <div className="mt-auto px-1 pt-2 border-t border-brand-border/20 flex items-center justify-between gap-2">
        <QuickRfqButton
          variant="badge"
          item={{
            id: product.id,
            name: product.name,
            sku: product.sku || product.id.split('-')[0],
            divisionSlug: from,
            quantity: moq,
            unit: `Units (MOQ ${moq})`,
            image_path: images[0],
          }}
        />
        <Link 
          href={`/inquiry/${product.id}?from=${from}`}
          className="inline-flex items-center text-xs font-medium text-brand-deep-blue hover:text-brand-blue opacity-80 hover:opacity-100 transition-all"
        >
          <span className="pb-0.5">Quote</span>
          <svg className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
