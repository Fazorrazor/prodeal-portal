import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ScrollReveal } from '../../shared/ScrollReveal';
import { GlobalQuoteCTA } from '../../shared/GlobalQuoteCTA';

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
              <th className="py-4 pr-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">SKU / Product</th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">Size</th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">Material</th>
              <th className="p-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest">MOQ</th>
              <th className="py-4 pl-4 font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-widest text-right">Status</th>
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
                <tr key={product.id} className="border-b border-brand-border/30 hover:bg-black/5 transition-colors group">
                  <td className="py-4 pr-4">
                    <div className="font-heading font-bold text-brand-deep-blue uppercase tracking-tight">{product.name}</div>
                    <div className="text-[10px] text-brand-deep-blue/40 font-mono font-bold tracking-widest mt-1 uppercase">{product.id.split('-')[0]}</div>
                  </td>
                  <td className="p-4 text-sm text-brand-deep-blue font-bold">{product.metadata?.size || 'Standard'}</td>
                  <td className="p-4 text-sm text-brand-deep-blue font-bold">{product.metadata?.material || 'Kraft Paper'}</td>
                  <td className="p-4 font-bold font-mono text-brand-red">{(product.metadata as any)?.moq || 100}</td>
                  <td className="py-4 pl-4 text-right">
                    <StockBadge level={product.metadata?.stock_level as string | undefined} />
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
                <div>
                  <div className="font-bold text-brand-deep-blue font-heading text-xl uppercase tracking-tight">{product.name}</div>
                  <div className="text-[10px] font-bold tracking-widest text-brand-deep-blue/40 font-mono mt-1 uppercase">{product.id.split('-')[0]}</div>
                </div>
                <StockBadge level={product.metadata?.stock_level as string | undefined} />
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
              
              <div className="flex justify-between items-center border-t border-brand-border/20 pt-4 mt-4">
                <span className="text-[10px] text-brand-deep-blue/40 uppercase font-bold tracking-widest">Minimum Order</span>
                <span className="font-bold font-mono text-brand-red">{product.minimum_order_quantity} UNITS</span>
              </div>
            </div>
          ))
        )}
      </div>

      {products && products.length > 0 && (
        <div className="mt-12 text-center">
          <GlobalQuoteCTA slug="bowls" label="Request a Quote" />
        </div>
      )}
    </ScrollReveal>
  );
}

function StockBadge({ level }: { level?: string }) {
  const stockLevel = level?.toLowerCase() || 'in_stock';
  
  if (stockLevel === 'out_of_stock') {
    return <span className="inline-flex px-2 py-1 border-2 border-brand-red text-brand-red text-[10px] font-bold tracking-widest uppercase">Out of Stock</span>;
  }
  
  if (stockLevel === 'low_stock') {
    return <span className="inline-flex px-2 py-1 border-2 border-amber-500 text-amber-600 text-[10px] font-bold tracking-widest uppercase">Low Stock</span>;
  }
  
  return <span className="inline-flex px-2 py-1 border-2 border-green-600 text-green-700 text-[10px] font-bold tracking-widest uppercase">In Stock</span>;
}
