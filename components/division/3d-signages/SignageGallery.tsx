import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-8">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
            — Project Portfolio
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Recent Installations
          </h2>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
          Tap image to expand
        </p>
      </div>
      
      {!products || products.length === 0 ? (
        <div className="text-center py-12 border-y-2 border-brand-border/60">
          <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">All Clear.</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/80 mt-2">No gallery images uploaded yet.</p>
        </div>
      ) : (
        <>
          <ScrollReveal className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {products.map((product) => (
                <ScrollRevealItem key={product.id}>
                  {product.image_path ? (
                    <GalleryImage product={product} />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-black/5 flex items-center justify-center font-bold text-brand-deep-blue/80 uppercase text-xs">No Image Available</div>
                  )}
                </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </>
      )}
    </div>
  );
}

function GalleryImage({ product }: { product: { id: string; name: string; description?: string | null; image_path: string } }) {
  return (
    <div className="break-inside-avoid relative overflow-hidden group border-2 border-brand-border/60 md:hover:border-brand-blue transition-colors flex flex-col">
      <div className="relative group/image">
        <ImageLightbox src={product.image_path} alt={product.name} className="block active:opacity-80 transition-opacity">
          <Image 
            src={product.image_path}
            alt={product.name}
            width={600}
            height={800}
            className="w-full object-cover grayscale-0 opacity-100 md:grayscale md:opacity-80 md:group-hover/image:grayscale-0 md:group-hover/image:opacity-100 md:group-hover:grayscale-0 md:group-hover:opacity-100 transition-all duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </ImageLightbox>
        <div className="hidden md:flex absolute inset-0 bg-brand-deep-blue/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col items-center justify-center p-4 pointer-events-none text-center">
          <Link href={`/inquiry/${product.id}?from=signages`} className="pointer-events-auto mb-2 block">
            <h3 className="text-white font-heading font-bold text-xl uppercase tracking-tighter text-center md:hover:text-brand-blue transition-colors">{product.name}</h3>
          </Link>
          <p className="text-white/90 text-sm font-body mb-4 px-4 line-clamp-3">
            {product.description || 'Custom fabricated 3D signage solution.'}
          </p>
          <Link 
            href={`/inquiry/${product.id}?from=signages`}
            className="pointer-events-auto px-6 py-3 border-2 border-white text-white font-heading font-bold uppercase tracking-widest text-xs md:hover:bg-white md:hover:text-brand-deep-blue active:bg-white/80 transition-colors"
          >
            Inquire
          </Link>
        </div>
      </div>
      <div className="flex md:hidden flex-col items-center justify-center p-6 bg-brand-surface border-t-2 border-brand-border/60">
        <Link href={`/inquiry/${product.id}?from=signages`} className="block w-full mb-2 active:opacity-70 transition-opacity">
          <h3 className="text-brand-deep-blue font-heading font-bold text-xl uppercase tracking-tighter text-center leading-tight md:hover:text-brand-blue transition-colors">{product.name}</h3>
        </Link>
        <p className="text-sm text-brand-deep-blue/80 font-body mb-4 text-center leading-relaxed">
          {product.description || 'Custom fabricated 3D signage solution.'}
        </p>
        <Link 
          href={`/inquiry/${product.id}?from=signages`}
          className="w-full text-center px-6 py-4 bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-xs md:hover:bg-brand-blue active:bg-brand-blue active:scale-[0.98] transition-all"
        >
          Inquire
        </Link>
      </div>
    </div>
  );
}
