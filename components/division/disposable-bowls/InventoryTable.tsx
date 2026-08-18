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
    <div className="py-8">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
        <p className="text-[10px] font-medium text-brand-deep-blue/50 tracking-[0.2em] uppercase mb-4">
          Wholesale Disposable Solutions
        </p>
        <h2 className="font-display font-medium text-4xl sm:text-5xl text-brand-deep-blue leading-tight mb-6 tracking-tight">
          Catering Bowls
        </h2>
        <div className="w-12 h-px bg-brand-deep-blue/20"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
        {!products || products.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-[#fafafa] rounded-3xl mx-4 sm:mx-0">
            <h3 className="font-display font-medium text-2xl text-brand-deep-blue mb-3">
              Curating Collection
            </h3>
            <p className="text-brand-deep-blue/60 font-light text-sm">
              No inventory data available at the moment.
            </p>
          </div>
        ) : (
          products.map((product, index) => {
            const images = [product.image_path, ...(product.gallery_images as string[] || [])].filter(Boolean);

            return (
              <Link 
                href={`/inquiry/${product.id}?from=bowls`}
                key={product.id} 
                className="group flex flex-col h-full cursor-pointer outline-none"
              >
                {/* Image Section */}
                <div className="relative aspect-square w-full bg-[#f5f5f7] rounded-2xl overflow-hidden mb-6 transition-all duration-700 ease-out group-hover:shadow-2xl group-hover:-translate-y-2">
                  <div className="w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105">
                    <ProductImageCarousel 
                      images={images} 
                      alt={product.name} 
                      priority={index < 4} 
                    />
                  </div>
                  {product.metadata?.size && (
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-brand-deep-blue px-4 py-1.5 text-[10px] font-medium tracking-wide rounded-full z-20">
                      {product.metadata.size}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 px-2">
                  <div className="flex items-center justify-between mb-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                    <span className="text-[10px] font-medium text-brand-deep-blue/40 tracking-[0.1em] uppercase">
                      ID: {product.id.split('-')[0]}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-medium text-lg sm:text-xl text-brand-deep-blue leading-tight mb-2 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm font-light text-brand-deep-blue/60 leading-relaxed mb-6 flex-1 line-clamp-2">
                    {product.description || 'Premium disposable catering bowl.'}
                  </p>

                  <div className="mt-auto flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-0">
                    <span className="text-[11px] font-medium text-brand-deep-blue/50 tracking-wide line-clamp-1">
                      {product.metadata?.material || 'Food-grade Material'}
                    </span>
                    <div className="flex items-center text-sm font-medium text-brand-deep-blue opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="border-b border-transparent group-hover:border-brand-deep-blue/30 pb-0.5 transition-colors">
                        Request Quote
                      </span>
                      <svg className="w-4 h-4 ml-2 transition-transform duration-500 ease-out group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
