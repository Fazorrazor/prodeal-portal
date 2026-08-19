import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

import { ProductImageCarousel } from '../../shared/ProductImageCarousel';
import { QuickRfqButton } from '../../shared/QuickRfqButton';
import { BowlsCartonCalculator } from './BowlsCartonCalculator';

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
        <div className="w-12 h-px bg-brand-deep-blue/20 mb-6"></div>
        <div className="flex items-center gap-3">
          <BowlsCartonCalculator />
        </div>
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
            const moq = product.metadata?.moq || 100;
            const size = product.metadata?.size;

            return (
              <div
                key={product.id}
                className="group flex flex-col h-full bg-white rounded-2xl p-2 border border-transparent hover:border-brand-border/30 hover:shadow-xl transition-all duration-500"
              >
                <Link 
                  href={`/inquiry/${product.id}?from=bowls`}
                  className="flex flex-col flex-1 cursor-pointer outline-none"
                >
                  {/* Image Section */}
                  <div className="relative aspect-square w-full bg-[#f5f5f7] rounded-xl overflow-hidden mb-4 transition-all duration-700 ease-out group-hover:-translate-y-1">
                    <div className="w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105">
                      <ProductImageCarousel 
                        images={images} 
                        alt={product.name} 
                        priority={index < 4} 
                      />
                    </div>
                    {size && (
                      <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-md text-brand-deep-blue px-3 py-1 text-[9px] font-medium tracking-wide rounded-full z-20 shadow-xs">
                        {size}
                      </div>
                    )}
                    {/* Quick RFQ Action */}
                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <QuickRfqButton
                        variant="icon"
                        item={{
                          id: product.id,
                          name: product.name,
                          sku: product.sku || product.id.split('-')[0],
                          divisionSlug: 'bowls',
                          quantity: 5,
                          unit: `Cartons (${5 * moq} pcs)`,
                          image_path: images[0],
                        }}
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col flex-1 px-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono font-medium text-brand-deep-blue/40 tracking-[0.1em] uppercase">
                        MOQ: {moq} pcs
                      </span>
                    </div>
                    
                    <h3 className="font-display font-medium text-base sm:text-lg text-brand-deep-blue leading-tight mb-1.5 transition-colors group-hover:text-brand-blue">
                      {product.name}
                    </h3>
                    
                    <p className="text-xs font-light text-brand-deep-blue/60 leading-relaxed mb-3.5 flex-1 line-clamp-2">
                      {product.description || 'Premium disposable catering bowl.'}
                    </p>
                  </div>
                </Link>

                {/* Footer Controls */}
                <div className="mt-auto px-1 pt-2 border-t border-brand-border/20 flex items-center justify-between gap-2">
                  <QuickRfqButton
                    variant="badge"
                    item={{
                      id: product.id,
                      name: product.name,
                      sku: product.sku || product.id.split('-')[0],
                      divisionSlug: 'bowls',
                      quantity: 5,
                      unit: `Cartons (${5 * moq} pcs)`,
                      image_path: images[0],
                    }}
                  />
                  <Link 
                    href={`/inquiry/${product.id}?from=bowls`}
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
          })
        )}
      </div>
    </div>
  );
}
