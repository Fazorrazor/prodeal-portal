import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';

export async function ProductCatalog() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch all products for the division
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
        <h2 className="font-heading font-bold text-2xl text-brand-deep-blue mb-8 border-b-2 border-brand-border/60 pb-2 uppercase tracking-tight">Souvenirs</h2>
        {souvenirs.length === 0 ? (
          <div className="py-8">
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60">No souvenirs available yet.</p>
          </div>
        ) : (
          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {souvenirs.map((product) => (
              <ScrollRevealItem key={product.id} className="h-full">
                <ProductCard product={product} />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        )}
      </section>

      {/* Printing Section */}
      <section>
        <h2 className="font-heading font-bold text-2xl text-brand-deep-blue mb-8 border-b-2 border-brand-border/60 pb-2 uppercase tracking-tight">Printing</h2>
        {printing.length === 0 ? (
          <div className="py-8">
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60">No printing products available yet.</p>
          </div>
        ) : (
          <ScrollReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {printing.map((product) => (
              <ScrollRevealItem key={product.id} className="h-full">
                <ProductCard product={product} />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const imageUrl = product.image_path || 'https://via.placeholder.com/400x300?text=No+Image';
  const priceRange = product.metadata?.price_range || 'Quote Only';

  return (
    <div className="flex flex-col h-full border-b-2 border-brand-border/60 pb-6 group hover:border-brand-blue transition-colors">
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
            <span className="text-sm font-bold text-brand-red font-mono">{(product.metadata as any)?.moq || 100} UNITS</span>
          </div>
          <Link 
            href={`/inquiry/${product.id}`}
            className="px-4 py-2 bg-brand-deep-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors"
          >
            Inquire
          </Link>
        </div>
      </div>
    </div>
  );
}
