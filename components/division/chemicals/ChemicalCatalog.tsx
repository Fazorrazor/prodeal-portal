import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';

import Link from 'next/link';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { ScrollRevealItem } from '../../shared/ScrollRevealItem';

export async function ChemicalCatalog({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const supabase = createServerComponentClient({ cookies });
  
  let query = supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'chemicals')
    .order('name');

  const q = typeof searchParams?.q === 'string' ? searchParams.q : undefined;

  if (q) {
    const term = `%${q}%`;
    query = query.or(`name.ilike.${term},metadata->>cas_number.ilike.${term}`);
  }

  const { data: products, error } = await query.limit(50);

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
                  
                  <div className="pt-4 border-t border-brand-border/30 flex flex-col mt-auto">

                    <Link 
                      href={`/inquiry/${product.id}?from=chemicals`}
                      className="w-full py-3 bg-brand-deep-blue text-white text-[10px] font-bold uppercase tracking-widest text-center hover:bg-brand-blue transition-colors"
                    >
                      Inquire About This
                    </Link>
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
