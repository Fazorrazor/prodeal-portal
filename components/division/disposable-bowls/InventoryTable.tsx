import { createClient } from '@supabase/supabase-js';

import Link from 'next/link';

import { ProductImageCarousel } from '../../shared/ProductImageCarousel';

export async function InventoryTable() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: products, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'bowls')
    .limit(50)
    .order('name');

  if (error) {
    throw new Error('Failed to load inventory data');
  }

  return (
    <div className="mt-0">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-brand-border/20 pb-5 mb-8">
        <div>
          <p className="text-xs font-medium text-brand-blue mb-1.5">
            Wholesale Disposable Solutions
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-deep-blue leading-none">
            Catering Bowls
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {!products || products.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-sm border border-brand-border/10">
            <h3 className="font-heading font-bold text-2xl text-brand-deep-blue mb-2">
              All Clear.
            </h3>
            <p className="text-brand-deep-blue/70">
              No inventory data available at the moment.
            </p>
          </div>
        ) : (
          products.map((product, index) => {
            // For demo purposes of the carousel, we simulate multiple images by appending the same image,
            // or placeholder, unless the database actually returns an array.
            const images = product.image_path 
              ? [product.image_path, product.image_path] 
              : [];

            return (
              <div 
                key={product.id} 
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-brand-border/10"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full bg-brand-surface overflow-hidden">
                  <ProductImageCarousel 
                    images={images} 
                    alt={product.name} 
                    priority={index < 4} 
                  />
                  {product.metadata?.size && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-brand-deep-blue px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-20">
                      {product.metadata.size}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-medium text-brand-deep-blue/50 uppercase tracking-widest">
                      {product.id.split('-')[0]}
                    </span>
                  </div>
                  
                  <h3 className="font-heading font-bold text-lg text-brand-deep-blue leading-tight mb-2 group-hover:text-brand-blue transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-brand-deep-blue/70 leading-relaxed mb-6 flex-1">
                    {product.description || 'Premium disposable catering bowl.'}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-border/10">
                    <span className="text-xs font-medium text-brand-deep-blue/60">
                      {product.metadata?.material || 'Food-grade Plastic'}
                    </span>
                    <Link
                      href={`/inquiry/${product.id}?from=bowls`}
                      className="px-5 py-2.5 bg-brand-deep-blue hover:bg-brand-blue text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-sm"
                    >
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

