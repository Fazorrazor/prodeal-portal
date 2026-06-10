import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';
import { GlobalQuoteCTA } from '../../shared/GlobalQuoteCTA';

export async function SignageGallery() {
  const supabase = createServerComponentClient({ cookies });
  
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
      <h2 className="font-heading font-bold text-3xl text-brand-deep-blue mb-8 text-center">Recent Installations</h2>
      
      {!products || products.length === 0 ? (
        <div className="text-center py-12 border-y-2 border-brand-border/60">
          <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">All Clear.</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60 mt-2">No gallery images uploaded yet.</p>
        </div>
      ) : (
        <>
          <ScrollReveal className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {products.map((product) => (
                <ScrollRevealItem key={product.id}>
                  {product.image_path ? (
                    <GalleryImage 
                      src={product.image_path} 
                      alt={product.name} 
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-black/5 flex items-center justify-center font-bold text-brand-deep-blue/40 uppercase text-xs">No Image Available</div>
                  )}
                </ScrollRevealItem>
            ))}
          </ScrollReveal>
          <div className="mt-16 text-center">
            <GlobalQuoteCTA slug="signages" label="Request a Quote" />
          </div>
        </>
      )}
    </div>
  );
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="break-inside-avoid relative overflow-hidden group border-2 border-brand-border/60 hover:border-brand-blue transition-colors">
      {/* Replaced with Next/Image for optimized LCP */}
      <Image 
        src={src}
        alt={alt}
        width={600}
        height={400}
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-brand-deep-blue/0 group-hover:bg-brand-deep-blue/20 transition-colors duration-300 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-brand-deep-blue/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-end">
        <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{alt}</p>
      </div>
    </div>
  );
}
