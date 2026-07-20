import { createClient } from '@supabase/supabase-js';
import { ScrollReveal } from '../../shared/ScrollReveal';
import Image from 'next/image';
import Link from 'next/link';

import { ProductImageFallback } from '../../shared/ProductImageFallback';

export async function InventoryTable() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
    <ScrollReveal className="mt-0">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-brand-deep-blue pb-5 mb-0">
        <div>
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-1.5">
            — Division
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Disposable Bowls
          </h2>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/80 uppercase tracking-widest">
          Wholesale orders only
        </p>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto border-t-2 border-brand-border/60">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b-2 border-brand-border/60">
              <th className="py-4 pr-4 w-14" />
              <th className="py-4 pr-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">
                SKU / Product
              </th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">
                Size
              </th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">
                Material
              </th>
              <th className="py-4 pl-4 w-24" />
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12">
                  <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">
                    All Clear.
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/80 mt-1">
                    No inventory data available.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-brand-border/30 md:hover:bg-black/5 transition-colors group relative"
                >
                  {/* Thumb */}
                  <td className="py-4 pr-4">
                    <div className="block w-12 h-12 bg-black/5 overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
                      {product.image_path ? (
                        <Image
                          src={product.image_path}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ProductImageFallback />
                      )}
                    </div>
                  </td>

                  {/* Name / SKU / desc */}
                  <td className="py-4 pr-4">
                    <Link href={`/inquiry/${product.id}?from=bowls`} className="block w-fit before:absolute before:inset-0 before:z-10 focus:outline-none">
                      <div className="font-heading font-bold text-brand-deep-blue uppercase tracking-tight md:group-hover:text-brand-blue transition-colors">
                        {product.name}
                      </div>
                    </Link>
                    <div className="text-[10px] text-brand-deep-blue/80 font-mono font-bold tracking-widest mt-0.5 uppercase relative z-20 pointer-events-none">
                      {product.id.split('-')[0]}
                    </div>
                    <div className="text-xs text-brand-deep-blue/80 mt-1 max-w-xs leading-relaxed relative z-20 pointer-events-none">
                      {product.description || 'Premium disposable catering bowl.'}
                    </div>
                  </td>

                  <td className="p-4 text-sm text-brand-deep-blue font-mono font-bold relative z-20 pointer-events-none">
                    {product.metadata?.size || 'Standard'}
                  </td>
                  <td className="p-4 text-sm text-brand-deep-blue font-mono font-bold relative z-20 pointer-events-none">
                    {product.metadata?.material || 'Food-grade Plastic'}
                  </td>
                  {/* CTA */}
                  <td className="py-4 pl-4 text-right">
                    <div className="inline-block px-4 py-2 bg-brand-deep-blue text-white font-bold uppercase tracking-widest text-[10px] md:group-hover:bg-brand-blue transition-colors relative z-20">
                      Inquire
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile List ── */}
      <div className="md:hidden">
        {!products || products.length === 0 ? (
          <div className="border-t border-brand-border/30 pt-8">
            <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tighter">
              All Clear.
            </h3>
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/80 mt-1">
              No inventory data available.
            </p>
          </div>
        ) : (
          products.map((product) => (
              <Link
                href={`/inquiry/${product.id}?from=bowls`}
                key={product.id}
                className="border-b border-brand-border/40 py-5 flex flex-col gap-3 group active:bg-black/5 hover:bg-black/[0.02] transition-colors block"
              >
                {/* Row: fixed thumbnail + name block */}
                <div className="flex gap-4 items-start">
                  <div className="block w-16 h-16 bg-black/5 shrink-0 overflow-hidden group-hover:opacity-90 transition-opacity">
                    {product.image_path ? (
                      <Image
                        src={product.image_path}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProductImageFallback />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-base text-brand-deep-blue uppercase tracking-tight leading-snug group-hover:text-brand-blue transition-colors">
                      {product.name}
                    </div>
                    <div className="text-[10px] font-mono font-bold tracking-widest text-brand-deep-blue/80 mt-0.5 uppercase">
                      {product.id.split('-')[0]}
                    </div>
                    <p className="text-xs text-brand-deep-blue/80 mt-1.5 leading-relaxed">
                      {product.description || 'Premium disposable catering bowl.'}
                    </p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-2 gap-3 border-t border-brand-border/20 pt-3">
                  <div>
                    <span className="block text-[9px] text-brand-deep-blue/80 uppercase font-bold tracking-widest mb-0.5">
                      Size
                    </span>
                    <span className="text-brand-deep-blue font-mono font-bold text-sm">
                      {product.metadata?.size || 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-brand-deep-blue/80 uppercase font-bold tracking-widest mb-0.5">
                      Material
                    </span>
                    <span className="text-brand-deep-blue font-mono font-bold text-sm">
                      {product.metadata?.material || 'Food-grade Plastic'}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="w-full text-center py-4 bg-brand-deep-blue text-white font-bold uppercase tracking-widest text-[10px] group-hover:bg-brand-blue transition-colors min-h-[44px] flex items-center justify-center">
                  Inquire About This
                </div>
              </Link>
          ))
        )}
      </div>
    </ScrollReveal>
  );
}
