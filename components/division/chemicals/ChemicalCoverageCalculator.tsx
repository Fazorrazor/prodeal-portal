'use client';

import { useState } from 'react';
import { Calculator, X, Plus, Check, ArrowRight } from 'lucide-react';
import { useRfqStore } from '@/lib/store/rfqStore';

interface ChemicalProductRate {
  id?: string;
  name: string;
  ratePerM2: number; // in Liters/kg per m2 for 1 coat
  defaultCoats: number;
  unit: string;
  packSize: number; // e.g. 20L drum or 5L can
  packName: string;
}

const CHEMICAL_PRESETS: Record<string, ChemicalProductRate> = {
  'waterproof': {
    name: 'Liquid Rubber & Waterproof Coating',
    ratePerM2: 0.8,
    defaultCoats: 2,
    unit: 'Liters',
    packSize: 20,
    packName: '20L Commercial Drum',
  },
  'rust': {
    name: 'Anti-Rust Conversion Agent',
    ratePerM2: 0.15,
    defaultCoats: 1,
    unit: 'Liters',
    packSize: 5,
    packName: '5L Industrial Container',
  },
  'tile': {
    name: 'Tile Adhesive Liquid Additive',
    ratePerM2: 0.3,
    defaultCoats: 1,
    unit: 'Liters',
    packSize: 20,
    packName: '20L Drum',
  },
  'paint': {
    name: 'Stone & Art Textured Wall Paint',
    ratePerM2: 0.6,
    defaultCoats: 2,
    unit: 'Liters',
    packSize: 18,
    packName: '18L Bucket',
  },
};

export function ChemicalCoverageCalculator({
  productName,
  productId,
}: {
  productName?: string;
  productId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(() => {
    if (productName?.toLowerCase().includes('rust')) return 'rust';
    if (productName?.toLowerCase().includes('tile')) return 'tile';
    if (productName?.toLowerCase().includes('paint')) return 'paint';
    return 'waterproof';
  });

  const [length, setLength] = useState<string>('10');
  const [width, setWidth] = useState<string>('5');
  const [customArea, setCustomArea] = useState<string>('50');
  const [inputMode, setInputMode] = useState<'dimensions' | 'area'>('dimensions');
  const [coats, setCoats] = useState<number>(2);
  const [added, setAdded] = useState(false);

  const { addItem } = useRfqStore();

  const activePreset = CHEMICAL_PRESETS[selectedType] || CHEMICAL_PRESETS['waterproof'];

  const computedArea = inputMode === 'dimensions'
    ? Math.max(0, (parseFloat(length) || 0) * (parseFloat(width) || 0))
    : Math.max(0, parseFloat(customArea) || 0);

  const requiredVolume = Math.ceil(computedArea * (coats || 1) * activePreset.ratePerM2 * 10) / 10;
  const recommendedPacks = Math.ceil(requiredVolume / activePreset.packSize) || 1;
  const totalPackVolume = recommendedPacks * activePreset.packSize;

  const handleAddToRfq = () => {
    addItem({
      id: productId || `chem-${selectedType}`,
      name: productName || activePreset.name,
      divisionSlug: 'chemicals',
      quantity: recommendedPacks,
      unit: `${activePreset.packName}s (${totalPackVolume} ${activePreset.unit})`,
      notes: `Calculated for ${computedArea} m² coverage (${coats} coat${coats > 1 ? 's' : ''}, estimated ${requiredVolume} ${activePreset.unit} needed)`,
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
        <Calculator className="w-3.5 h-3.5 text-brand-blue" />
        <span>Calculate Coverage</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-brand-border/30 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-border/20">
              <div>
                <p className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-widest mb-1">
                  Chemical Engineering Tool
                </p>
                <h3 className="font-display font-medium text-xl text-brand-deep-blue leading-none">
                  Surface Coverage Estimator
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-brand-deep-blue/50 hover:text-brand-deep-blue rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-medium text-brand-deep-blue/70 mb-2">
                  Chemical Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CHEMICAL_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedType(key);
                        setCoats(preset.defaultCoats);
                      }}
                      className={`p-2.5 text-left text-xs rounded-xl border transition-all ${
                        selectedType === key
                          ? 'border-brand-blue bg-brand-blue/5 font-semibold text-brand-deep-blue'
                          : 'border-brand-border/40 hover:border-brand-border text-brand-deep-blue/70'
                      }`}
                    >
                      <span className="block truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Dimension Mode */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-brand-deep-blue/70">
                    Surface Dimensions
                  </label>
                  <div className="flex gap-1 bg-brand-surface p-1 rounded-lg border border-brand-border/40">
                    <button
                      type="button"
                      onClick={() => setInputMode('dimensions')}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        inputMode === 'dimensions'
                          ? 'bg-white text-brand-deep-blue shadow-xs'
                          : 'text-brand-deep-blue/60'
                      }`}
                    >
                      L × W (m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('area')}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        inputMode === 'area'
                          ? 'bg-white text-brand-deep-blue shadow-xs'
                          : 'text-brand-deep-blue/60'
                      }`}
                    >
                      Total m²
                    </button>
                  </div>
                </div>

                {inputMode === 'dimensions' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-brand-deep-blue/50 uppercase font-mono block mb-1">
                        Length (Meters)
                      </span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border/40 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-deep-blue focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-deep-blue/50 uppercase font-mono block mb-1">
                        Width (Meters)
                      </span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full bg-brand-surface border border-brand-border/40 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-deep-blue focus:outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full bg-brand-surface border border-brand-border/40 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-deep-blue focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                )}
              </div>

              {/* Number of Coats */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-medium text-brand-deep-blue/70 block">
                    Recommended Applications
                  </label>
                  <span className="text-[11px] text-brand-deep-blue/50 font-light">
                    Standard is {activePreset.defaultCoats} coats for industrial durability
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCoats(c)}
                      className={`w-8 h-8 rounded-lg border text-xs font-medium transition-all ${
                        coats === c
                          ? 'border-brand-blue bg-brand-blue text-white'
                          : 'border-brand-border/40 text-brand-deep-blue hover:border-brand-border'
                      }`}
                    >
                      {c}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation Result Summary Card */}
              <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border/40 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-deep-blue/60 font-light">Total Surface Area</span>
                  <span className="font-mono font-bold text-brand-deep-blue">{computedArea} m²</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-brand-deep-blue/60 font-light">Net Product Required</span>
                  <span className="font-mono font-bold text-brand-deep-blue">{requiredVolume} {activePreset.unit}</span>
                </div>
                <div className="pt-2 border-t border-brand-border/20 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-brand-blue font-bold">
                      Recommended Wholesale Pack
                    </p>
                    <p className="text-sm font-semibold text-brand-deep-blue">
                      {recommendedPacks} × {activePreset.packName} ({totalPackVolume} {activePreset.unit})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
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
                    <span>Add {recommendedPacks} Pack{recommendedPacks > 1 ? 's' : ''} to RFQ Tray</span>
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
