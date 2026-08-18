import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

import { ProductImageCarousel } from '../../shared/ProductImageCarousel';
import { ChemicalVideoModal } from './ChemicalVideoModal';

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
    <div className="py-8">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
        <p className="text-[10px] font-medium text-brand-deep-blue/50 tracking-[0.2em] uppercase mb-4">
          Specialized Formulations
        </p>
        <h2 className="font-display font-medium text-4xl sm:text-5xl text-brand-deep-blue leading-tight mb-6 tracking-tight">
          Industrial Chemicals
        </h2>
        <div className="w-12 h-px bg-brand-deep-blue/20"></div>
      </div>

      {!products || products.length === 0 ? (
        <div className="py-24 text-center bg-[#fafafa] rounded-3xl mx-4 sm:mx-0">
          <h3 className="font-display font-medium text-2xl text-brand-deep-blue mb-3">
            No formulations available.
          </h3>
          <p className="text-brand-deep-blue/60 font-light text-sm">
            Contact us directly for bespoke chemical inquiries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
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
  const grade = product.metadata?.grade || 'Industrial Grade';
  const cas = product.metadata?.cas_number;
  const metadataGallery = (product.metadata as any)?.gallery_images || [];
  const demoVideos = (product.metadata as any)?.demo_videos || [];
  
  let images = Array.from(new Set([
    product.image_path, 
    ...(product.gallery_images || []), 
    ...metadataGallery
  ].filter(Boolean))) as string[];

  return (
    <Link href={`/inquiry/${product.id}?from=chemicals`} className="group flex flex-col h-full cursor-pointer outline-none">
      {/* Image Container with subtle elevation on hover */}
      <div className="relative aspect-square w-full bg-[#f5f5f7] rounded-2xl overflow-hidden mb-6 transition-all duration-700 ease-out group-hover:shadow-2xl group-hover:-translate-y-2">
        <div className="w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105">
          <ProductImageCarousel 
            images={images} 
            alt={product.name} 
            priority={priority} 
          />
        </div>
        {/* Grade badge */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-brand-deep-blue px-4 py-1.5 text-[10px] font-medium tracking-wide rounded-full z-20">
          {grade}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-brand-deep-blue/40 tracking-[0.1em] uppercase">
            {cas ? `CAS: ${cas}` : 'Proprietary Formulation'}
          </span>
        </div>
        
        <h3 className="font-display font-medium text-lg sm:text-xl text-brand-deep-blue leading-tight mb-2 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm font-light text-brand-deep-blue/60 leading-relaxed mb-3.5 flex-1 line-clamp-2">
          {product.description || 'Standard industrial chemical formulation.'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          {demoVideos.length > 0 ? (
            <div onClick={(e) => e.preventDefault()} className="z-30 relative mr-3">
              <ChemicalVideoModal 
                videoUrl={demoVideos[0]} 
                productName={product.name} 
                cas={cas} 
              />
            </div>
          ) : (
            <div></div>
          )}
          
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
}
