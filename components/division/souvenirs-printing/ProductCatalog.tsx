import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { ProductFilters } from './ProductFilters';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';
import { GlobalQuoteCTA } from '../../shared/GlobalQuoteCTA';

export async function ProductCatalog() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch from products table filtered by division_id. 
  // We need to get the division_id for 'printing' first, or join.
  const { data: products, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'printing')
    .order('name')
    .limit(50);

  if (error) {
    throw new Error('Failed to load printing catalog');
  }

  return (
    <div>
      <h2 className="font-heading font-bold text-3xl text-brand-deep-blue mb-8 text-center">Standard Catalog</h2>
      <ProductFilters />
      
      {!products || products.length === 0 ? (
        <div className="text-center py-12 border-y-2 border-brand-border/60">
          <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">All Clear.</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60 mt-2">No products available in the catalog yet.</p>
        </div>
      ) : (
        <>
          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ScrollRevealItem key={product.id}>
                <ProductCard product={product} />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
          <div className="mt-16 text-center">
            <GlobalQuoteCTA slug="printing" label="Request a Quote" />
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  // Try to get an image from metadata if it exists, otherwise use a placeholder
  const imageUrl = product.metadata?.image_url || 'https://via.placeholder.com/400x300?text=No+Image';
  const priceRange = product.metadata?.price_range || 'Quote Only';

  return (
    <div className="flex flex-col border-b-2 border-brand-border/60 pb-6 group hover:border-brand-blue transition-colors">
      <div className="relative w-full aspect-video bg-black/5 overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-0 right-0 bg-brand-deep-blue text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
          {priceRange}
        </div>
      </div>
      <div className="pt-4 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tight mb-2">{product.name}</h3>
        <p className="text-sm text-brand-deep-blue/60 font-body mb-6 leading-relaxed">{product.description || 'Customizable corporate merchandise'}</p>
        <div className="mt-auto flex items-center justify-between border-t border-brand-border/30 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-brand-deep-blue/40 uppercase tracking-widest mb-0.5">Min. Order</span>
            <span className="text-sm font-bold text-brand-red font-mono">{product.minimum_order_quantity} UNITS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
