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
    <div className="flex flex-col gap-16">

      {/* Souvenirs Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-brand-border/20 pb-5 mb-8">
          <div>
            <p className="text-xs font-medium text-brand-blue mb-1.5">
              Custom Merchandise
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-deep-blue leading-none">
              Souvenirs
            </h2>
          </div>
          {souvenirs.length > 0 && (
            <p className="text-xs font-medium text-brand-deep-blue/60 uppercase tracking-widest">
              {souvenirs.length} product{souvenirs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {souvenirs.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-sm border border-brand-border/10">
            <h3 className="font-heading font-bold text-2xl text-brand-deep-blue mb-2">
              No souvenirs yet.
            </h3>
            <p className="text-brand-deep-blue/70">
              Check back soon — new products are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {souvenirs.map((product, index) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} isPriority={index < 4} from="printing" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Printing Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-brand-border/20 pb-5 mb-8">
          <div>
            <p className="text-xs font-medium text-brand-blue mb-1.5">
              Commercial Print Services
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-deep-blue leading-none">
              Printing
            </h2>
          </div>
          {printing.length > 0 && (
            <p className="text-xs font-medium text-brand-deep-blue/60 uppercase tracking-widest">
              {printing.length} product{printing.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {printing.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-sm border border-brand-border/10">
            <h3 className="font-heading font-bold text-2xl text-brand-deep-blue mb-2">
              No printing products yet.
            </h3>
            <p className="text-brand-deep-blue/70">
              Check back soon — new products are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {printing.map((product, index) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} isPriority={index < 4} from="printing" />
              </div>
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
  const images = [product.image_path, ...(product.gallery_images || [])].filter(Boolean) as string[];

  return (
    <Link href={`/inquiry/${product.id}?from=${from}`} className="group flex flex-col h-full bg-slate-50 border border-brand-border/30 hover:border-brand-blue transition-colors cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[3/2] w-full bg-white border-b border-brand-border/10 overflow-hidden">
        <ProductImageCarousel 
          images={images} 
          alt={product.name} 
          priority={isPriority} 
        />
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-brand-deep-blue text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest z-20">
          {priceRange}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <h3 className="font-heading font-bold text-sm sm:text-base text-brand-deep-blue leading-tight mb-1.5 group-hover:text-brand-blue transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-xs text-brand-deep-blue/70 leading-relaxed mb-3 sm:mb-4 flex-1 line-clamp-3">
          {product.description || 'Customizable corporate merchandise'}
        </p>
        
        <div className="mt-auto pt-2.5 sm:pt-3 border-t border-brand-border/10">
          <span
            className="block w-full text-center px-3 py-2 sm:px-5 sm:py-2.5 bg-brand-deep-blue group-hover:bg-brand-blue text-white text-[10px] sm:text-xs font-bold rounded transition-colors"
          >
            Request Quote
          </span>
        </div>
      </div>
    </Link>
  );
}
