import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { SDSDownloadButton } from './SDSDownloadButton';
import Link from 'next/link';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';

export async function ChemicalCatalog() {
  const supabase = createServerComponentClient({ cookies });
  
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
      {!products || products.length === 0 ? (
        <div className="text-center py-12 border-y-2 border-brand-border/60">
          <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">All Clear.</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60 mt-2">No chemical products registered in the database.</p>
        </div>
      ) : (
        <>
          <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ScrollRevealItem key={product.id} className="h-full">
                <div className="h-full flex flex-col border-b-2 border-brand-border/60 pb-8 hover:border-brand-blue transition-colors group">
                  {product.image_path && (
                    <div className="relative w-full aspect-video bg-black/5 overflow-hidden mb-6">
                      <Image 
                        src={product.image_path} 
                        alt={product.name} 
                        width={400} 
                        height={300} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tight">{product.name}</h3>
                      <div className="text-[10px] font-mono font-bold text-brand-deep-blue/40 mt-1 uppercase tracking-widest">
                        CAS: {product.metadata?.cas_number || 'N/A'}
                      </div>
                    </div>
                    <span className="px-2 py-1 border border-brand-deep-blue/20 text-[10px] font-bold text-brand-deep-blue uppercase tracking-widest whitespace-nowrap group-hover:border-brand-blue group-hover:text-brand-blue transition-colors">
                      {product.metadata?.grade || 'Industrial'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-brand-deep-blue/70 font-body mb-8 flex-1 leading-relaxed">
                    {product.description || 'Standard industrial chemical formulation.'}
                  </p>
                  
                  <div className="pt-4 border-t border-brand-border/30 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-brand-deep-blue/40 uppercase tracking-widest mb-0.5">Min. Order</span>
                      <span className="text-sm font-bold text-brand-red font-mono">
                        {(product.metadata as any)?.moq || 250} KG
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <SDSDownloadButton 
                        documentId={product.id} 
                        chemicalName={product.name} 
                      />
                      <Link 
                        href={`/inquiry/${product.id}`}
                        className="px-4 py-2 border border-brand-deep-blue text-brand-deep-blue text-[10px] font-bold uppercase tracking-widest hover:bg-brand-deep-blue hover:text-white transition-colors"
                      >
                        Inquire
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </>
      )}
    </div>
  );
}
