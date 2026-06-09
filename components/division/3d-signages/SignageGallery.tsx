import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';
import { GlobalQuoteCTA } from '../../shared/GlobalQuoteCTA';

export async function SignageGallery() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch files from the public bucket
  const { data, error } = await supabase.storage.from('product-images').list('signages', {
    limit: 12,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    throw new Error('Failed to load gallery images');
  }

  // Filter out any hidden files or folders
  const files = data?.filter(file => file.name !== '.emptyFolderPlaceholder') || [];

  return (
    <div>
      <h2 className="font-heading font-bold text-3xl text-brand-deep-blue mb-8 text-center">Recent Installations</h2>
      
      {files.length === 0 ? (
        <div className="text-center py-12 border-y-2 border-brand-border/60">
          <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">All Clear.</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60 mt-2">No gallery images uploaded yet.</p>
        </div>
      ) : (
        <>
          <ScrollReveal className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {files.map((file) => {
              const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(`signages/${file.name}`);
              return (
                <ScrollRevealItem key={file.id}>
                  <GalleryImage 
                    src={publicUrlData.publicUrl} 
                    alt={file.name} 
                  />
                </ScrollRevealItem>
              );
            })}
          </ScrollReveal>
          <div className="mt-16 text-center">
            <GlobalQuoteCTA slug="signages" label="Start 3D Signage Inquiry" />
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
