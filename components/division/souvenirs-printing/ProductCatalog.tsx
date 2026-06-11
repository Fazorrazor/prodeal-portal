import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';
import { ProductImageFallback } from '../../shared/ProductImageFallback';

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
            {souvenirs.map((product, index) => (
              <ScrollRevealItem key={product.id} className="h-full">
                <ProductCard product={product} isPriority={index < 4} />
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
            {printing.map((product, index) => (
              <ScrollRevealItem key={product.id} className="h-full">
                <ProductCard product={product} isPriority={index < 4} />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}

function ProductCard({ product, isPriority = false }: { product: any, isPriority?: boolean }) {
  const priceRange = product.metadata?.price_range || 'Quote Only';

  return (
    <div className="flex flex-col h-full border-b-2 border-brand-border/60 pb-6 group md:hover:border-brand-blue transition-colors">
      <Link href={`/inquiry/${product.id}?from=printing`} className="relative w-full aspect-video bg-black/5 overflow-hidden block group/image active:opacity-80 transition-opacity">
        {product.image_path ? (
          <Image 
            src={product.image_path} 
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-700 md:group-hover/image:scale-105 md:group-hover:scale-105"
            priority={isPriority}
          />
        ) : (
          <ProductImageFallback className="transition-transform duration-700 md:group-hover/image:scale-105 md:group-hover:scale-105" />
        )}
        <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm text-brand-deep-blue px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border-l border-b border-brand-border/30">
          {priceRange}
        </div>
      </Link>
      <div className="pt-4 flex flex-col flex-1">
        <Link href={`/inquiry/${product.id}?from=printing`} className="block w-fit">
          <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tight mb-2 md:hover:text-brand-blue transition-colors">{product.name}</h3>
        </Link>
        <p className="text-sm text-brand-deep-blue/60 font-body mb-6 leading-relaxed">{product.description || 'Customizable corporate merchandise'}</p>
        <div className="mt-auto flex flex-col border-t border-brand-border/30 pt-4">

          <Link 
            href={`/inquiry/${product.id}?from=printing`}
            className="w-full py-3 bg-brand-deep-blue text-white text-[10px] font-bold uppercase tracking-widest text-center md:hover:bg-brand-blue active:bg-brand-blue active:scale-[0.98] transition-all"
          >
            Inquire About This
          </Link>
        </div>
      </div>
    </div>
  );
}
