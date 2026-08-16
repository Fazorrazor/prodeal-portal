import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

import { ProductImageCarousel } from '../../shared/ProductImageCarousel';

export async function ChemicalCatalog() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: products, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'chemicals')
    .order('name')
    .limit(50);

  if (error) {
    throw new Error('Failed to load chemical catalog');
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-brand-border/20 pb-5 mb-8">
        <div>
          <p className="text-xs font-medium text-brand-blue mb-1.5">
            Specialized Formulations
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-deep-blue leading-none">
            Industrial Chemicals
          </h2>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="col-span-full py-16 text-center border-t border-brand-border/20">
          <h3 className="font-heading font-bold text-2xl text-brand-deep-blue mb-2">
            No products registered.
          </h3>
          <p className="text-brand-deep-blue/70 font-mono text-sm uppercase tracking-widest">
            Contact us directly for chemical inquiries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-10">
          {products.map((product, index) => (
            <ChemicalCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChemicalCard({ product, priority = false }: {
  product: {
    id: string;
    name: string;
    description?: string | null;
    image_path?: string | null;
    gallery_images?: string[] | null;
    metadata?: { cas_number?: string; grade?: string; } | null;
    [key: string]: unknown;
  };
  priority?: boolean;
}) {
  const grade = product.metadata?.grade || 'Industrial';
  const cas = product.metadata?.cas_number;
  const metadataGallery = (product.metadata as any)?.gallery_images || [];
  
  // Use Set to remove duplicate image paths
  const images = Array.from(new Set([product.image_path, ...metadataGallery].filter(Boolean))) as string[];

  return (
    <Link href={`/inquiry/${product.id}?from=chemicals`} className="group flex flex-col bg-slate-50 border border-brand-border/30 hover:border-brand-blue transition-colors cursor-pointer">
      <div className="relative aspect-[3/2] w-full bg-white border-b border-brand-border/10 overflow-hidden">
        <ProductImageCarousel 
          images={images} 
          alt={product.name} 
          priority={priority} 
        />
        <div className="absolute top-3 right-3 bg-brand-deep-blue text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest z-20">
          {grade}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] sm:text-[10px] font-mono font-medium text-brand-deep-blue/50 uppercase tracking-widest">
            {cas ? `CAS: ${cas}` : 'No CAS'}
          </span>
        </div>
        
        <h3 className="font-heading font-bold text-sm sm:text-base text-brand-deep-blue leading-tight mb-1.5 group-hover:text-brand-blue transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-xs text-brand-deep-blue/70 leading-relaxed mb-3 sm:mb-4 flex-1 line-clamp-3">
          {product.description || 'Standard industrial chemical formulation.'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2.5 sm:pt-3 border-t border-brand-border/10">
          <span
            className="w-full text-center px-3 py-2 sm:px-5 sm:py-2.5 bg-brand-deep-blue group-hover:bg-brand-blue text-white text-[10px] sm:text-xs font-bold transition-colors"
          >
            Request Quote
          </span>
        </div>
      </div>
    </Link>
  );
}
