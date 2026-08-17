import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

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
    <div className="py-8">
      {/* Section header */}
      <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
        <p className="text-[10px] font-medium text-brand-deep-blue/50 tracking-[0.2em] uppercase mb-4">
          Project Portfolio
        </p>
        <h2 className="font-display font-medium text-4xl sm:text-5xl text-brand-deep-blue leading-tight mb-6 tracking-tight">
          Recent Installations
        </h2>
        <div className="w-12 h-px bg-brand-deep-blue/20"></div>
      </div>
      
      {!products || products.length === 0 ? (
        <div className="py-24 text-center bg-[#fafafa] rounded-3xl mx-4 sm:mx-0">
          <h3 className="font-display font-medium text-2xl text-brand-deep-blue mb-3">
            Portfolio Curation
          </h3>
          <p className="text-brand-deep-blue/60 font-light text-sm">
            Check back soon as we curate our latest installation gallery.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {products.map((product, index) => (
            <div key={product.id}>
              {product.image_path ? (
                <GalleryImage product={product} priority={index < 4} />
              ) : (
                <div className="w-full aspect-[4/3] bg-[#fafafa] rounded-2xl flex items-center justify-center text-brand-deep-blue/40 font-light text-sm">Image Unavailable</div>
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
    <Link href={`/inquiry/${product.id}?from=signages`} className="break-inside-avoid relative group flex flex-col cursor-pointer outline-none mb-2">
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#f5f5f7] mb-4 transition-all duration-700 ease-out group-hover:shadow-2xl group-hover:-translate-y-2">
        <img 
          src={product.image_path}
          alt={product.name}
          width={600}
          height={800}
          className="w-full h-auto object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Subtle gradient overlay for desktop hover text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep-blue/80 via-brand-deep-blue/20 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 hidden md:block"></div>
        
        {/* Hover overlay for desktop */}
        <div className="hidden md:flex absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex-col items-center justify-end p-8 text-center translate-y-4 group-hover:translate-y-0">
          <h3 className="text-white font-display font-medium text-2xl leading-tight mb-2">{product.name}</h3>
          <p className="text-white/80 font-light text-sm mb-6 px-4 line-clamp-3 leading-relaxed">
            {product.description || 'Custom fabricated 3D signage solution.'}
          </p>
          <div className="flex items-center text-white/90">
            <span className="text-[11px] font-medium uppercase tracking-widest border-b border-transparent group-hover:border-white/50 pb-0.5 transition-colors">
              Request Quote
            </span>
            <svg className="w-4 h-4 ml-2 transition-transform duration-500 ease-out group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Mobile visible text block */}
      <div className="flex md:hidden flex-col px-2">
        <h3 className="text-brand-deep-blue font-display font-medium text-lg leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-brand-deep-blue/60 font-light mb-4 leading-relaxed line-clamp-2">
          {product.description || 'Custom fabricated 3D signage solution.'}
        </p>
        <div className="flex items-center text-brand-deep-blue opacity-80">
          <span className="text-[10px] font-medium uppercase tracking-widest border-b border-brand-deep-blue/30 pb-0.5">
            Request Quote
          </span>
          <svg className="w-3 h-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
