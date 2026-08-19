'use client';

import { useState } from 'react';
import { Calculator, X, Plus, Check, ArrowRight, ShieldCheck, Wrench, MapPin } from 'lucide-react';
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
  const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
  const [siteLocation, setSiteLocation] = useState<string>('Accra / Tema Metro');
  const [siteType, setSiteType] = useState<string>('Concrete Roof / Slab');
  const [added, setAdded] = useState(false);

  const { addItem } = useRfqStore();

  const activePreset = CHEMICAL_PRESETS[selectedType] || CHEMICAL_PRESETS['waterproof'];

  const computedArea = inputMode === 'dimensions'
    ? Math.max(0, (parseFloat(length) || 0) * (parseFloat(width) || 0))
    : Math.max(0, parseFloat(customArea) || 0);

  const requiredVolume = Math.ceil(computedArea * (coats || 1) * activePreset.ratePerM2 * 10) / 10;
  const recommendedPacks = Math.ceil(requiredVolume / activePreset.packSize) || 1;
  const totalPackVolume = recommendedPacks * activePreset.packSize;

  const estimatedLaborDays = computedArea <= 50 ? '1-2 Days' : computedArea <= 200 ? '2-3 Days' : '4-6 Days';

  const handleAddToRfq = () => {
    const installNotes = includeInstallation 
      ? ` • [TURNKEY INSTALLATION REQUESTED]: ${computedArea} m² on ${siteType} in ${siteLocation} (Carries 5-Year Workmanship Warranty)`
      : '';

    addItem({
      id: productId || `chem-${selectedType}`,
      name: productName || activePreset.name,
      divisionSlug: 'chemicals',
      quantity: recommendedPacks,
      unit: `${activePreset.packName}s (${totalPackVolume} ${activePreset.unit})`,
      notes: `Calculated for ${computedArea} m² (${coats} coat${coats > 1 ? 's' : ''}, estimated ${requiredVolume} ${activePreset.unit})${installNotes}`,
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
        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-brand-deep-blue text-xs font-semibold rounded-full border border-slate-200/80 transition-all shadow-2xs active:scale-[0.98]"
      >
        <Calculator className="w-3.5 h-3.5 text-brand-blue" />
        <span>Calculate Coverage & Labor</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-brand-deep-blue leading-tight">
                    Coverage & Turnkey Installation
                  </h3>
                  <p className="text-xs text-slate-400">Surface volume & technician application estimator</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-deep-blue hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Chemical Formulation Category
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
                      className={`p-3 text-left text-xs rounded-xl border transition-all ${
                        selectedType === key
                          ? 'border-brand-blue bg-brand-blue/5 font-semibold text-brand-deep-blue shadow-2xs'
                          : 'border-slate-200/60 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span className="block font-medium truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Dimension Mode */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Surface Area Dimensions
                  </label>
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setInputMode('dimensions')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        inputMode === 'dimensions'
                          ? 'bg-white text-brand-deep-blue shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      L × W (m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('area')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        inputMode === 'area'
                          ? 'bg-white text-brand-deep-blue shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Total m²
                    </button>
                  </div>
                </div>

                {inputMode === 'dimensions' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Length (Meters)
                      </span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="w-full h-11 bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 text-sm font-semibold text-brand-deep-blue focus:bg-white focus:border-brand-blue/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Width (Meters)
                      </span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="w-full h-11 bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 text-sm font-semibold text-brand-deep-blue focus:bg-white focus:border-brand-blue/50 outline-none transition-all"
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
                      placeholder="e.g. 150 m²"
                      className="w-full h-11 bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 text-sm font-semibold text-brand-deep-blue focus:bg-white focus:border-brand-blue/50 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Number of Coats */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <label className="text-xs font-semibold text-brand-deep-blue block">
                    Recommended Coating Layers
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Industrial standard is {activePreset.defaultCoats} coats
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCoats(c)}
                      className={`w-9 h-9 rounded-xl border text-xs font-semibold transition-all ${
                        coats === c
                          ? 'border-brand-blue bg-brand-blue text-white shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c}×
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Turnkey Installation Addon Option ── */}
              <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                includeInstallation 
                  ? 'bg-brand-blue/[0.03] border-brand-blue/30 shadow-2xs' 
                  : 'bg-slate-50/50 border-slate-200/60'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeInstallation}
                    onChange={(e) => setIncludeInstallation(e.target.checked)}
                    className="w-5 h-5 rounded text-brand-blue border-slate-300 focus:ring-brand-blue mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-brand-deep-blue">
                        Include Certified Prodeal On-Site Application
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        5-Yr Warranty
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Applied by certified Prodeal technicians with official leak-test & moisture QA sign-off.
                    </p>
                  </div>
                </label>

                {includeInstallation && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-brand-blue/10 animate-in fade-in duration-200">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                        Application Substrate
                      </span>
                      <select
                        value={siteType}
                        onChange={(e) => setSiteType(e.target.value)}
                        className="w-full h-9 px-2.5 bg-white rounded-lg border border-slate-200 text-xs font-medium text-brand-deep-blue outline-none"
                      >
                        <option value="Concrete Roof / Slab">Concrete Roof / Slab</option>
                        <option value="Industrial Epoxy Floor">Industrial Epoxy Floor</option>
                        <option value="Basement / Wet Retaining Wall">Basement / Wet Wall</option>
                        <option value="Large-Format Tile Area">Large-Format Tile Area</option>
                        <option value="Steel Structural Surface">Steel Structure</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                        Project Location
                      </span>
                      <select
                        value={siteLocation}
                        onChange={(e) => setSiteLocation(e.target.value)}
                        className="w-full h-9 px-2.5 bg-white rounded-lg border border-slate-200 text-xs font-medium text-brand-deep-blue outline-none"
                      >
                        <option value="Accra / Tema Metro">Accra / Tema Metro</option>
                        <option value="Kumasi & Ashanti Hub">Kumasi & Ashanti</option>
                        <option value="Takoradi / Western Hub">Takoradi & Western</option>
                        <option value="Other Regional Center">Other Regional</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Calculation Result Summary Card */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Net Product Needed</span>
                  <span className="font-mono font-bold text-brand-deep-blue">{requiredVolume} {activePreset.unit}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Wholesale Packaging</span>
                  <span className="font-semibold text-brand-deep-blue">
                    {recommendedPacks} × {activePreset.packName}
                  </span>
                </div>
                {includeInstallation && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/50">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      Estimated Site Work
                    </span>
                    <span className="font-semibold text-emerald-800 font-mono">
                      ~{estimatedLaborDays}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-brand-deep-blue transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleAddToRfq}
                className="flex-1 h-11 bg-brand-deep-blue hover:bg-brand-blue text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to RFQ Tray!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add {recommendedPacks} Pack{recommendedPacks > 1 ? 's' : ''} {includeInstallation ? '+ Installation' : ''} to RFQ</span>
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
