import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ProductImageCarousel } from '../../shared/ProductImageCarousel';

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
  product: { id: string; name: string; description?: string | null; image_path?: string | null; gallery_images?: string[] | null; metadata?: { price_range?: string; } | null; [key: string]: unknown };
  isPriority?: boolean;
  from: string;
}) {
  const priceRange = product.metadata?.price_range || 'Quote Only';
  const metadataGallery = (product.metadata as any)?.gallery_images || [];
  
  let images = Array.from(new Set([
    product.image_path, 
    ...(product.gallery_images || []), 
    ...metadataGallery
  ].filter(Boolean))) as string[];

  return (
    <Link href={`/inquiry/${product.id}?from=${from}`} className="group flex flex-col h-full cursor-pointer outline-none">
      {/* Image Container with subtle elevation on hover */}
      <div className="relative aspect-square w-full bg-[#f5f5f7] rounded-2xl overflow-hidden mb-6 transition-all duration-700 ease-out group-hover:shadow-2xl group-hover:-translate-y-2">
        <div className="w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105">
          <ProductImageCarousel 
            images={images} 
            alt={product.name} 
            priority={isPriority} 
          />
        </div>
        {/* Soft, elegant badge */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-brand-deep-blue px-4 py-1.5 text-[10px] font-medium tracking-wide rounded-full z-20 transition-opacity duration-300">
          {priceRange}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-2">
        <h3 className="font-display font-medium text-lg sm:text-xl text-brand-deep-blue leading-tight mb-2 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm font-light text-brand-deep-blue/60 leading-relaxed mb-3.5 flex-1 line-clamp-2">
          {product.description || 'Customizable corporate merchandise'}
        </p>
        
        <div className="mt-auto flex items-center text-sm font-medium text-brand-deep-blue opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          <span className="border-b border-transparent group-hover:border-brand-deep-blue/30 pb-0.5 transition-colors">
            Request Quote
          </span>
          <svg className="w-4 h-4 ml-2 transition-transform duration-500 ease-out group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
