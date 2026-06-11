import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ScrollReveal } from '../../shared/ScrollReveal';
import Image from 'next/image';
import Link from 'next/link';
import { ProductImageFallback } from '../../shared/ProductImageFallback';

export async function InventoryTable() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, divisions!inner(slug)')
    .eq('divisions.slug', 'bowls')
    .limit(50)
    .order('name');

  if (error) {
    throw new Error('Failed to load inventory data');
  }

  return (
    <ScrollReveal className="mt-8">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border-t-2 border-brand-border/60">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-brand-border/60">
              <th className="py-4 pr-4 w-16"></th>
              <th className="py-4 pr-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">SKU / Product</th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">Size</th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">Material</th>
              <th className="py-4 pl-4 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">All Clear.</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60 mt-2">No inventory data available.</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-brand-border/30 md:hover:bg-black/5 transition-colors group">
                  <td className="py-4 pr-4">
                    <Link href={`/inquiry/${product.id}?from=bowls`} className="block w-12 h-12 bg-black/5 overflow-hidden shrink-0 active:opacity-80 transition-opacity">
                      {product.image_path ? (
                        <Image src={product.image_path} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <ProductImageFallback />
                      )}
                    </Link>
                  </td>
                  <td className="py-4 pr-4">
                    <Link href={`/inquiry/${product.id}?from=bowls`} className="block w-fit">
                      <div className="font-heading font-bold text-brand-deep-blue uppercase tracking-tight md:hover:text-brand-blue transition-colors">{product.name}</div>
                    </Link>
                    <div className="text-[10px] text-brand-deep-blue/40 font-mono font-bold tracking-widest mt-1 uppercase">{product.id.split('-')[0]}</div>
                  </td>
                  <td className="p-4 text-sm text-brand-deep-blue font-bold">{product.metadata?.size || 'Standard'}</td>
                  <td className="p-4 text-sm text-brand-deep-blue font-bold">{product.metadata?.material || 'Kraft Paper'}</td>

                  <td className="py-4 pl-4 text-right">
                    <Link 
                      href={`/inquiry/${product.id}?from=bowls`}
                      className="inline-block px-4 py-2 bg-brand-deep-blue text-white font-bold uppercase tracking-widest text-[10px] md:hover:bg-brand-blue active:bg-brand-blue active:scale-[0.98] transition-colors"
                    >
                      Inquire
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-0">
        {!products || products.length === 0 ? (
          <div className="py-12 border-y-2 border-brand-border/60 text-center">
            <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">All Clear.</h3>
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60 mt-2">No inventory data available.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="border-b-2 border-brand-border/60 py-6 flex flex-col gap-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <Link href={`/inquiry/${product.id}?from=bowls`} className="block w-16 h-16 bg-black/5 shrink-0 overflow-hidden active:opacity-80 transition-opacity">
                    {product.image_path ? (
                      <Image src={product.image_path} alt={product.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <ProductImageFallback />
                    )}
                  </Link>
                  <div>
                    <Link href={`/inquiry/${product.id}?from=bowls`} className="block w-fit">
                      <div className="font-bold text-brand-deep-blue font-heading text-xl uppercase tracking-tight leading-tight md:hover:text-brand-blue transition-colors">{product.name}</div>
                    </Link>
                    <div className="text-[10px] font-bold tracking-widest text-brand-deep-blue/40 font-mono mt-1 uppercase">{product.id.split('-')[0]}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-brand-border/20 pt-4">
                <div>
                  <span className="block text-[10px] text-brand-deep-blue/40 uppercase font-bold tracking-widest mb-0.5">Size</span>
                  <span className="text-brand-deep-blue font-bold">{product.metadata?.size || 'Standard'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-brand-deep-blue/40 uppercase font-bold tracking-widest mb-0.5">Material</span>
                  <span className="text-brand-deep-blue font-bold">{product.metadata?.material || 'Kraft Paper'}</span>
                </div>
              </div>
              

              <div className="mt-4">
                <Link 
                  href={`/inquiry/${product.id}?from=bowls`}
                  className="block w-full text-center px-4 py-3 bg-brand-deep-blue text-white font-bold uppercase tracking-widest text-xs md:hover:bg-brand-blue active:bg-brand-blue active:scale-[0.98] transition-colors"
                >
                  Inquire About This
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollReveal>
  );
}


