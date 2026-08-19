'use client';

import { useState } from 'react';
import { Package, X, Plus, Check, ArrowRight } from 'lucide-react';
import { useRfqStore } from '@/lib/store/rfqStore';

interface BowlsCartonCalculatorProps {
  productId?: string;
  productName?: string;
  piecesPerCarton?: number;
}

export function BowlsCartonCalculator({
  productId,
  productName = 'Disposable Catering Bowls',
  piecesPerCarton = 100,
}: BowlsCartonCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartons, setCartons] = useState<number>(10);
  const [added, setAdded] = useState(false);
  const { addItem } = useRfqStore();

  const totalPieces = cartons * piecesPerCarton;

  // Wholesale bulk tiering logic
  let tierLabel = 'Standard Wholesale';
  let tierColor = 'text-brand-deep-blue/70 bg-brand-deep-blue/5';
  if (cartons >= 50) {
    tierLabel = 'Tier 3 VIP Master Distributor';
    tierColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (cartons >= 20) {
    tierLabel = 'Tier 2 Commercial Volume';
    tierColor = 'text-brand-blue bg-brand-blue/10 border-brand-blue/20';
  }

  const handleAddToRfq = () => {
    addItem({
      id: productId || `bowl-${productName.replace(/\s+/g, '-').toLowerCase()}`,
      name: productName,
      divisionSlug: 'bowls',
      quantity: cartons,
      unit: `Carton${cartons > 1 ? 's' : ''} (${totalPieces.toLocaleString()} pcs)`,
      notes: `${cartons} cartons at ${piecesPerCarton} pcs/carton (${tierLabel})`,
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-surface hover:bg-brand-border/20 text-brand-deep-blue text-[11px] font-medium rounded-full border border-brand-border/40 transition-colors"
      >
        <Package className="w-3.5 h-3.5 text-brand-blue" />
        <span>Carton Estimator</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-border/30 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-border/20">
              <div>
                <p className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-widest mb-1">
                  Wholesale Packaging Logistics
                </p>
                <h3 className="font-display font-medium text-xl text-brand-deep-blue leading-none">
                  Carton & Volume Breakdown
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-brand-deep-blue/50 hover:text-brand-deep-blue rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/50 block mb-1">
                  Selected Item
                </span>
                <p className="text-base font-semibold text-brand-deep-blue">{productName}</p>
                <p className="text-xs text-brand-deep-blue/60 font-light mt-0.5">
                  Pack spec: {piecesPerCarton} pieces per master carton
                </p>
              </div>

              {/* Cartons selector */}
              <div>
                <label className="block text-xs font-medium text-brand-deep-blue/70 mb-2">
                  Number of Master Cartons
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={cartons}
                    onChange={(e) => setCartons(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 bg-brand-surface border border-brand-border/40 rounded-xl px-3 py-2.5 text-center text-lg font-mono font-bold text-brand-deep-blue focus:outline-none focus:border-brand-blue"
                  />
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {[5, 10, 25, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setCartons(qty)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                          cartons === qty
                            ? 'border-brand-blue bg-brand-blue/10 text-brand-blue font-bold'
                            : 'border-brand-border/40 text-brand-deep-blue/70 hover:border-brand-border'
                        }`}
                      >
                        {qty} ctns
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-deep-blue/60 font-light">Total Units</span>
                  <span className="font-mono font-bold text-base text-brand-deep-blue">
                    {totalPieces.toLocaleString()} pieces
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-deep-blue/60 font-light">Wholesale Tier</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${tierColor}`}>
                    {tierLabel}
                  </span>
                </div>

                <div className="pt-2 border-t border-brand-border/20 text-[11px] text-brand-deep-blue/60 font-light">
                  Direct dispatch from Accra warehouse. Palletized staging available on 20+ carton orders.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#fafafa] border-t border-brand-border/20 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-xs font-medium text-brand-deep-blue/70 hover:text-brand-deep-blue transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleAddToRfq}
                className="flex-1 py-3 bg-brand-blue hover:bg-brand-deep-blue text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to RFQ Tray!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add {cartons} Cartons to RFQ</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
