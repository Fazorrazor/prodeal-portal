import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ImageLightbox } from '../../shared/ImageLightbox';

export async function SignageGallery() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'signages')
    .order('name');

  if (error) {
    throw new Error('Failed to load gallery images');
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-brand-border/20 pb-5 mb-8">
        <div>
          <p className="text-xs font-medium text-brand-blue mb-1.5">
            Project Portfolio
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-deep-blue leading-none">
            Recent Installations
          </h2>
        </div>
        <p className="text-xs font-medium text-brand-deep-blue/60 uppercase tracking-widest hidden sm:block">
          Tap image to expand
        </p>
      </div>
      
      {!products || products.length === 0 ? (
        <div className="col-span-full py-16 text-center bg-white rounded-2xl shadow-sm border border-brand-border/10">
          <h3 className="font-heading font-bold text-2xl text-brand-deep-blue mb-2">All Clear.</h3>
          <p className="text-brand-deep-blue/70">No gallery images uploaded yet.</p>
        </div>
      ) : (
        <div className="columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {products.map((product, index) => (
            <div key={product.id}>
              {product.image_path ? (
                <GalleryImage product={product} priority={index < 4} />
              ) : (
                <div className="w-full aspect-[4/3] bg-brand-surface rounded-2xl flex items-center justify-center font-medium text-brand-deep-blue/60 uppercase text-xs">No Image Available</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryImage({ product, priority = false }: { product: { id: string; name: string; description?: string | null; image_path: string }, priority?: boolean }) {
  return (
    <Link href={`/inquiry/${product.id}?from=signages`} className="break-inside-avoid relative overflow-hidden group bg-white border border-brand-border/20 hover:border-brand-blue transition-colors flex flex-col cursor-pointer">
      <div className="relative group/image overflow-hidden border-b border-brand-border/10">
        <img 
          src={product.image_path}
          alt={product.name}
          width={600}
          height={800}
          className="w-full object-cover transition-transform duration-700 md:group-hover/image:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Hover overlay for desktop */}
        <div className="hidden md:flex absolute inset-0 bg-brand-deep-blue/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col items-center justify-center p-6 text-center">
          <h3 className="text-white font-heading font-bold text-2xl leading-tight mb-3">{product.name}</h3>
          <p className="text-white/90 text-sm mb-6 px-4 line-clamp-3 leading-relaxed">
            {product.description || 'Custom fabricated 3D signage solution.'}
          </p>
          <span 
            className="pointer-events-auto px-8 py-3 bg-white text-brand-deep-blue font-bold rounded text-sm hover:bg-brand-blue hover:text-white transition-colors"
          >
            Request Quote
          </span>
        </div>
      </div>
      
      {/* Mobile visible text block */}
      <div className="flex md:hidden flex-col items-center justify-center p-3 sm:p-6 bg-white">
        <h3 className="text-brand-deep-blue font-heading font-bold text-base sm:text-xl leading-tight text-center mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-xs sm:text-sm text-brand-deep-blue/70 mb-3 sm:mb-5 text-center leading-relaxed line-clamp-3">
          {product.description || 'Custom fabricated 3D signage solution.'}
        </p>
        <span 
          className="w-full text-center px-3 py-2 sm:px-6 sm:py-3.5 bg-brand-deep-blue text-white font-bold rounded text-[10px] sm:text-sm hover:bg-brand-blue transition-colors"
        >
          Request Quote
        </span>
      </div>
    </Link>
  );
}
