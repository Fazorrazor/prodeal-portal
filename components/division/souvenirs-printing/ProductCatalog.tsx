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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
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
  product: { id: string; name: string; description?: string | null; image_path?: string | null; metadata?: { price_range?: string } | null; [key: string]: unknown };
  isPriority?: boolean;
  from: string;
}) {
  const priceRange = product.metadata?.price_range || 'Quote Only';
  const images = [product.image_path, ...(product.metadata?.gallery_images || [])].filter(Boolean) as string[];

  return (
    <Link href={`/inquiry/${product.id}?from=${from}`} className="group flex flex-col h-full bg-white border border-brand-border/20 hover:border-brand-blue transition-colors cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-brand-surface border-b border-brand-border/10 overflow-hidden">
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
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-heading font-bold text-lg text-brand-deep-blue leading-tight mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-brand-deep-blue/70 leading-relaxed mb-6 flex-1 line-clamp-3">
          {product.description || 'Customizable corporate merchandise'}
        </p>
        
        <div className="mt-auto pt-4 border-t border-brand-border/10">
          <span
            className="block w-full text-center px-5 py-2.5 bg-brand-deep-blue group-hover:bg-brand-blue text-white text-xs font-bold rounded transition-colors"
          >
            Request Quote
          </span>
        </div>
      </div>
    </Link>
  );
}
