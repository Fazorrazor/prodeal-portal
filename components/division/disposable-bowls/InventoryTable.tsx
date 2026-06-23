import { createPublicClient } from '../../../lib/supabase/server';
import { ScrollReveal } from '../../shared/ScrollReveal';
import Image from 'next/image';
import Link from 'next/link';

import { ProductImageFallback } from '../../shared/ProductImageFallback';
import { ImageLightbox } from '../../shared/ImageLightbox';

function getStockBadge(level: string | undefined) {
  if (level === 'out_of_stock') {
    return <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-[9px] font-bold uppercase tracking-widest border border-red-200">Out of Stock</span>;
  }
  if (level === 'low_stock') {
    return <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest border border-amber-200">Low Stock</span>;
  }
  return <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-widest border border-emerald-200">In Stock</span>;
}

export async function InventoryTable() {
  const supabase = createPublicClient();

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
          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/40 mb-1.5">
            — Live Stock Register
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue tracking-tighter uppercase leading-none">
            Inventory
          </h2>
        </div>
        <p className="text-[10px] font-mono text-brand-deep-blue/40 uppercase tracking-widest">
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
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">
                Status
              </th>
              <th className="py-4 pl-4 w-24" />
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <h3 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-tighter">
                    All Clear.
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/40 mt-1">
                    No inventory data available.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-brand-border/30 md:hover:bg-black/5 transition-colors group"
                >
                  {/* Thumb */}
                  <td className="py-4 pr-4">
                    <ImageLightbox
                      src={product.image_path || ''}
                      alt={product.name}
                      className="block w-12 h-12 bg-black/5 overflow-hidden shrink-0 active:opacity-80 transition-opacity"
                    >
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
                    </ImageLightbox>
                  </td>

                  {/* Name / SKU / desc */}
                  <td className="py-4 pr-4">
                    <Link href={`/inquiry/${product.id}?from=bowls`} className="block w-fit">
                      <div className="font-heading font-bold text-brand-deep-blue uppercase tracking-tight md:hover:text-brand-blue transition-colors">
                        {product.name}
                      </div>
                    </Link>
                    <div className="text-[10px] text-brand-deep-blue/40 font-mono font-bold tracking-widest mt-0.5 uppercase">
                      {product.id.split('-')[0]}
                    </div>
                    <div className="text-xs text-brand-deep-blue/60 mt-1 max-w-xs leading-relaxed">
                      {product.description || 'Premium disposable catering bowl.'}
                    </div>
                  </td>

                  <td className="p-4 text-sm text-brand-deep-blue font-mono font-bold">
                    {product.metadata?.size || 'Standard'}
                  </td>
                  <td className="p-4 text-sm text-brand-deep-blue font-mono font-bold">
                    {product.metadata?.material || 'Food-grade Plastic'}
                  </td>
                  <td className="p-4">
                    {getStockBadge(product.metadata?.stock_level)}
                  </td>
                  {/* CTA */}
                  <td className="py-4 pl-4 text-right">
                    {product.metadata?.stock_level === 'out_of_stock' ? (
                      <button disabled className="inline-block px-4 py-2 bg-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[10px] cursor-not-allowed">
                        Out of Stock
                      </button>
                    ) : (
                      <Link
                        href={`/inquiry/${product.id}?from=bowls`}
                        className="inline-block px-4 py-2 bg-brand-deep-blue text-white font-bold uppercase tracking-widest text-[10px] md:hover:bg-brand-blue active:bg-brand-blue transition-colors"
                      >
                        Inquire
                      </Link>
                    )}
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
            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/40 mt-1">
              No inventory data available.
            </p>
          </div>
        ) : (
          products.map((product) => (
              <div
                key={product.id}
                className="border-b border-brand-border/40 py-5 flex flex-col gap-3"
              >
                {/* Row: fixed thumbnail + name block */}
                <div className="flex gap-4 items-start">
                  <ImageLightbox
                    src={product.image_path || ''}
                    alt={product.name}
                    className="block w-16 h-16 bg-black/5 shrink-0 overflow-hidden active:opacity-80 transition-opacity"
                  >
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
                  </ImageLightbox>

                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-bold text-base text-brand-deep-blue uppercase tracking-tight leading-snug">
                      {product.name}
                    </div>
                    <div className="text-[10px] font-mono font-bold tracking-widest text-brand-deep-blue/35 mt-0.5 uppercase">
                      {product.id.split('-')[0]}
                    </div>
                    <p className="text-xs text-brand-deep-blue/55 mt-1.5 leading-relaxed">
                      {product.description || 'Premium disposable catering bowl.'}
                    </p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-3 gap-3 border-t border-brand-border/20 pt-3">
                  <div>
                    <span className="block text-[9px] text-brand-deep-blue/35 uppercase font-bold tracking-widest mb-0.5">
                      Size
                    </span>
                    <span className="text-brand-deep-blue font-mono font-bold text-sm">
                      {product.metadata?.size || 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-brand-deep-blue/35 uppercase font-bold tracking-widest mb-0.5">
                      Material
                    </span>
                    <span className="text-brand-deep-blue font-mono font-bold text-sm">
                      {product.metadata?.material || 'Food-grade Plastic'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-brand-deep-blue/35 uppercase font-bold tracking-widest mb-0.5">
                      Status
                    </span>
                    {getStockBadge(product.metadata?.stock_level)}
                  </div>
                </div>

                {/* CTA */}
                {product.metadata?.stock_level === 'out_of_stock' ? (
                  <button disabled className="block w-full text-center py-4 bg-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[10px] cursor-not-allowed min-h-[44px] flex items-center justify-center">
                    Out of Stock
                  </button>
                ) : (
                  <Link
                    href={`/inquiry/${product.id}?from=bowls`}
                    className="block w-full text-center py-4 bg-brand-deep-blue text-white font-bold uppercase tracking-widest text-[10px] active:bg-brand-blue transition-colors min-h-[44px] flex items-center justify-center"
                  >
                    Inquire About This
                  </Link>
                )}
              </div>
          ))
        )}
      </div>
    </ScrollReveal>
  );
}
