'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Check, 
  Calculator, 
  Loader2, 
  Sparkles, 
  CreditCard, 
  Layers, 
  Wrench, 
  Maximize2, 
  X, 
  FileText,
  Building2,
  User,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { saveQuotation } from '../../app/actions/saveQuotation';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface QuotationBuilderProps {
  inquiry: {
    id: string;
    tracking_uuid: string;
    contact_name: string;
    company_name?: string | null;
    phone?: string | null;
    email?: string | null;
    inquiry_payload?: any;
    divisions?: { display_name: string; slug?: string } | null;
    created_at: string;
  };
  existingQuotation?: any;
}

const TAX_PRESETS = [
  { id: 'standard_vat', label: 'Standard VAT + Levies (21.9%)', rate: 0.219 },
  { id: 'nhil_getfund', label: 'Flat Rate Scheme (3%)', rate: 0.03 },
  { id: 'exempt', label: 'Tax Exempt / Export (0%)', rate: 0.0 }
] as const;

const PAYMENT_PRESETS = [
  '50% advance upon order confirmation, 50% prior to dispatch from Tema warehouse.',
  '100% advance payment prior to batch manufacturing.',
  '30 days net settlement for approved corporate B2B accounts.',
  'Payment on delivery (Accra / Tema Metro only).'
];

export function QuotationBuilder({ inquiry, existingQuotation }: QuotationBuilderProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(!!existingQuotation);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when fullscreen mode is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Handle Escape key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const quoteSeed = existingQuotation?.payload || {};
  
  const getInitialItems = (): QuotationItem[] => {
    if (quoteSeed.items && Array.isArray(quoteSeed.items)) {
      return quoteSeed.items.map((it: any, idx: number) => ({
        id: `item-${idx}`,
        description: it.description || it.productName || 'Industrial Supply Item',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'Units',
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
      }));
    }

    const payload = inquiry.inquiry_payload || {};
    
    if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
      return payload.items.map((it: any, idx: number) => ({
        id: `seed-${idx}`,
        description: it.name || it.productName || 'B2B Item',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'Units',
        unitPrice: 0,
        total: 0
      }));
    }

    const singleName = payload.productName || (payload.inquiry && payload.inquiry.productName) || 'Industrial Supply Item';
    const singleQty = Number(payload.quantity || payload.inquiry?.quantity || payload.inquiry?.boxCount || payload.inquiry?.litersNeeded || 1);
    const unitName = payload.inquiry?.boxCount ? 'Cartons' : (payload.inquiry?.litersNeeded ? 'Liters' : 'Units');

    return [
      {
        id: 'seed-0',
        description: singleName,
        quantity: singleQty > 0 ? singleQty : 1,
        unit: unitName,
        unitPrice: 0,
        total: 0
      }
    ];
  };

  const [items, setItems] = useState<QuotationItem[]>(getInitialItems);
  const [taxType, setTaxType] = useState<string>(quoteSeed.taxType || 'standard_vat');
  const [freightAmount, setFreightAmount] = useState<number>(Number(quoteSeed.freightAmount) || 0);
  const [discountAmount, setDiscountAmount] = useState<number>(Number(quoteSeed.discountAmount) || 0);
  const [validityDays, setValidityDays] = useState<number>(Number(quoteSeed.validityDays) || 14);
  const [paymentTerms, setPaymentTerms] = useState<string>(
    quoteSeed.paymentTerms || PAYMENT_PRESETS[0]
  );
  const [notes, setNotes] = useState<string>(
    quoteSeed.notes || 'Goods delivered with official manufacturer certificate of analysis (COA) / warranty.'
  );

  const selectedTax = TAX_PRESETS.find((t) => t.id === taxType) || TAX_PRESETS[0];

  const subtotal = items.reduce((acc, it) => acc + (it.total || 0), 0);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableBase * selectedTax.rate).toFixed(2));
  const totalAmount = Number((taxableBase + taxAmount + freightAmount).toFixed(2));

  const quoteNumber = quoteSeed.quoteNumber || `PI-QT-${inquiry.tracking_uuid.substring(0, 6).toUpperCase()}-${new Date().getFullYear()}`;

  const handleItemChange = (id: string, field: keyof QuotationItem, val: any) => {
    setIsSaved(false);
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = field === 'quantity' ? Number(val) : it.quantity;
          const p = field === 'unitPrice' ? Number(val) : it.unitPrice;
          updated.total = Number((q * p).toFixed(2));
        }
        return updated;
      })
    );
  };

  const addItem = () => {
    setIsSaved(false);
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unit: 'Units',
        unitPrice: 0,
        total: 0
      }
    ]);
  };

  const addLaborItem = () => {
    setIsSaved(false);
    setItems((prev) => [
      ...prev,
      {
        id: `labor-${Date.now()}`,
        description: 'Turnkey On-Site Surface Preparation & Chemical Application (Certified 5-Year Workmanship Warranty)',
        quantity: 1,
        unit: 'm² / Lot',
        unitPrice: 0,
        total: 0
      }
    ]);
    toast.info('Added turnkey application labor item');
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast.error('Quotation must contain at least 1 item.');
      return;
    }
    setIsSaved(false);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSave = () => {
    if (totalAmount <= 0) {
      toast.error('Please enter unit prices so total amount is greater than 0.');
      return;
    }

    startTransition(async () => {
      const res = await saveQuotation({
        inquiryId: inquiry.id,
        quoteNumber,
        items: items.map(({ description, quantity, unit, unitPrice, total }) => ({
          description,
          quantity: Number(quantity),
          unit,
          unitPrice: Number(unitPrice),
          total: Number(total)
        })),
        subtotal,
        taxType: taxType as any,
        taxRate: selectedTax.rate,
        taxAmount,
        freightAmount,
        discountAmount,
        totalAmount,
        currency: 'GHS',
        validityDays,
        paymentTerms,
        notes
      });

      if (res.success) {
        setIsSaved(true);
        toast.success(`Quotation ${quoteNumber} issued & saved successfully!`);
      } else {
        toast.error(res.error || 'Failed to save quotation');
      }
    });
  };

  return (
    <>
      {/* ── Standard In-Page Card View ── */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all space-y-4 relative group/card">
        
        {/* ── Top-Right Corner Google-Style Fullscreen Button ── */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-20">
          <div className="relative group/card-expand flex items-center justify-center">
            <button
              onClick={() => setIsFullscreen(true)}
              type="button"
              aria-label="Full screen"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 active:scale-95 transition-all shadow-2xs flex items-center justify-center"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/card-expand:scale-110" />
            </button>
            
            {/* Google-Style Floating Tooltip */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover/card-expand:flex flex-col items-center pointer-events-none z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-slate-900/95 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                Full screen
              </div>
            </div>
          </div>
        </div>

        {/* ── Header Bar with Quick Actions ── */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 pb-4 border-b border-slate-100/80 shrink-0 pr-12 xl:pr-14">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 mt-0.5 sm:mt-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-display font-bold text-brand-deep-blue tracking-tight leading-tight">
                  B2B Pro-Forma Quotation
                </h3>
                {isSaved ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                    Draft
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Ref:</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-brand-blue">
                  {quoteNumber}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {inquiry.divisions?.display_name || 'Industrial Supplies'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {validityDays}d Validity
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Print & Save) */}
          <div className="flex items-center gap-2 shrink-0 pt-1 xl:pt-0">
            <button
              onClick={() => window.print()}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-brand-deep-blue hover:bg-slate-50 transition-all shadow-2xs whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Spec PDF</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isPending}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-brand-deep-blue hover:bg-brand-blue text-white text-xs font-semibold active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isSaved ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isPending ? 'Saving...' : isSaved ? 'Update Quote' : 'Save & Issue Quote'}</span>
            </button>
          </div>
        </div>

        {/* ── Compact Line Items Section with Scrollbar ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Quotation Line Items ({items.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="text-[11px] font-medium text-brand-blue hover:text-brand-deep-blue hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Work in full canvas</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Scrollable Items Container */}
          <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className="p-3 bg-slate-50/50 hover:bg-slate-50/80 rounded-xl border border-slate-100/90 transition-all space-y-2.5"
              >
                {/* Row 1: Item Description + Delete Button */}
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-slate-200/60 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={it.description}
                      onChange={(e) => handleItemChange(it.id, 'description', e.target.value)}
                      placeholder="Product name, grade, or custom formulation specification..."
                      className="w-full h-9 px-3 bg-white rounded-lg border border-slate-200/80 text-xs font-medium text-brand-deep-blue focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/5 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Row 2: Qty, Unit, Unit Price, Line Total */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-end">
                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(it.id, 'quantity', e.target.value)}
                      className="w-full h-8 px-2.5 bg-white rounded-lg border border-slate-200/80 text-xs font-semibold text-brand-deep-blue focus:border-brand-blue/50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                      Packaging Unit
                    </label>
                    <input
                      type="text"
                      value={it.unit}
                      onChange={(e) => handleItemChange(it.id, 'unit', e.target.value)}
                      placeholder="e.g. Drums, Cartons"
                      className="w-full h-8 px-2.5 bg-white rounded-lg border border-slate-200/80 text-xs font-medium text-brand-deep-blue focus:border-brand-blue/50 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                      Unit Price (GHS)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={it.unitPrice}
                      onChange={(e) => handleItemChange(it.id, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full h-8 px-2.5 bg-white rounded-lg border border-slate-200/80 text-xs font-bold text-brand-blue focus:border-brand-blue/50 outline-none"
                    />
                  </div>

                  <div className="h-8 px-2.5 bg-brand-blue/5 rounded-lg border border-brand-blue/10 flex items-center justify-between">
                    <span className="text-[9px] uppercase font-semibold text-brand-blue/70">Total</span>
                    <span className="text-xs font-bold font-mono text-brand-deep-blue">
                      ₵{it.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-slate-300 hover:border-brand-blue/40 bg-slate-50/50 hover:bg-brand-blue/5 text-[11px] font-semibold text-brand-blue active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>

            <button
              type="button"
              onClick={addLaborItem}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg border border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-100/50 text-[11px] font-semibold text-emerald-700 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Add Turnkey Application Labor</span>
            </button>
          </div>
        </div>

        {/* ── Commercial Terms & Calculations Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-slate-100/80">
          
          {/* Left Column (7 cols): Terms, Logistics, Bank settlement */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Payment Terms with Preset Chips */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Payment Terms & Conditions
              </label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {PAYMENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsSaved(false);
                      setPaymentTerms(preset);
                    }}
                    className={`text-[9px] font-medium px-2 py-0.5 rounded-md border transition-all ${
                      paymentTerms === preset
                        ? 'bg-brand-blue text-white border-brand-blue shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-white'
                    }`}
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={paymentTerms}
                onChange={(e) => {
                  setIsSaved(false);
                  setPaymentTerms(e.target.value);
                }}
                className="w-full p-2.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/80 text-xs font-medium text-brand-deep-blue focus:border-brand-blue/50 outline-none resize-none transition-all leading-snug"
              />
            </div>

            {/* Corporate Settlement Credentials */}
            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[9px] mb-0.5">
                <CreditCard className="w-3 h-3" />
                <span>Settlement Credentials</span>
              </div>
              <p className="text-slate-600">
                <strong className="text-brand-deep-blue">Ecobank:</strong> 1441002938192 • <strong className="text-brand-deep-blue">Stanbic:</strong> 9040003920194 • <strong className="text-brand-deep-blue">MTN MoMo:</strong> 639201
              </p>
            </div>
          </div>

          {/* Right Column (5 cols): Compact Totals & Tax Calculation Card */}
          <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-100 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Items Subtotal:</span>
                <span className="font-bold font-mono text-brand-deep-blue text-xs sm:text-sm">
                  ₵{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between text-slate-600">
                <span>Discount (GHS):</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => {
                    setIsSaved(false);
                    setDiscountAmount(Number(e.target.value));
                  }}
                  className="w-24 h-8 px-2 text-right bg-white rounded-lg border border-slate-200 text-xs font-bold text-brand-deep-blue outline-none"
                />
              </div>

              {/* Freight / Haulage */}
              <div className="flex items-center justify-between text-slate-600">
                <span>Haulage (GHS):</span>
                <input
                  type="number"
                  min="0"
                  value={freightAmount}
                  onChange={(e) => {
                    setIsSaved(false);
                    setFreightAmount(Number(e.target.value));
                  }}
                  className="w-24 h-8 px-2 text-right bg-white rounded-lg border border-slate-200 text-xs font-bold text-brand-deep-blue outline-none"
                />
              </div>

              {/* Tax Category */}
              <div className="space-y-1 pt-0.5">
                <select
                  value={taxType}
                  onChange={(e) => {
                    setIsSaved(false);
                    setTaxType(e.target.value);
                  }}
                  className="w-full h-8 px-2.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-brand-deep-blue outline-none shadow-2xs cursor-pointer"
                >
                  {TAX_PRESETS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-2.5 border-t border-slate-200/80 flex justify-between items-baseline">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Grand Total (GHS)
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-display text-brand-blue tracking-tight">
                ₵{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Apple-Grade Animated Fullscreen Workstation Portal ── */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsFullscreen(false)}
              className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 md:p-7"
            >
              {/* Apple-Style Fluid Window */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full h-[94vh] max-w-[1380px] bg-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.35)] border border-slate-200/80 flex flex-col overflow-hidden text-brand-deep-blue"
              >
                {/* ── Top Header Bar (Clean Minimalist Luxury) ── */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-white">
                  
                  {/* Left: Branding & Context */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-base font-display font-bold text-brand-deep-blue tracking-tight leading-tight">
                          Pro-Forma Quotation Workstation
                        </h2>
                        <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-brand-blue border border-slate-200/60">
                          {quoteNumber}
                        </span>
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <Check className="w-3 h-3" /> Saved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 truncate">
                        <span className="font-medium">{inquiry.contact_name}</span>
                        {inquiry.company_name && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-semibold text-slate-700">{inquiry.company_name}</span>
                          </>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-brand-blue font-medium">{inquiry.divisions?.display_name || 'Industrial'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions & Close Button */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => window.print()}
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-brand-deep-blue hover:bg-slate-50 active:scale-98 transition-all shadow-2xs whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Print Spec PDF</span>
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={isPending}
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-brand-deep-blue hover:bg-brand-blue text-white text-xs font-semibold active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 whitespace-nowrap"
                    >
                      {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isSaved ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>{isPending ? 'Saving...' : isSaved ? 'Update Quote' : 'Save & Issue Quote'}</span>
                    </button>

                    {/* Clean Google-style Close Button */}
                    <div className="relative group/close-tip flex items-center justify-center pl-1">
                      <button
                        onClick={() => setIsFullscreen(false)}
                        type="button"
                        aria-label="Close full screen"
                        className="w-9 h-9 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-brand-deep-blue active:scale-95 transition-all shadow-2xs flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-2 hidden group-hover/close-tip:flex flex-col items-center pointer-events-none z-30 animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-slate-900/95 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
                          Close (Esc)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Main Workspace (Dual-Column Ergonomics) ── */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-50/40">
                  
                  {/* Left Column (7.5 cols): Quotation Line Items Workstation */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden bg-white">
                    
                    {/* Item Toolbar */}
                    <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/30">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-blue" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Quotation Line Items ({items.length})
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={addItem}
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-dashed border-brand-blue/40 bg-brand-blue/5 hover:bg-brand-blue/10 text-xs font-semibold text-brand-blue active:scale-95 transition-all whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Item</span>
                        </button>

                        <button
                          type="button"
                          onClick={addLaborItem}
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 text-xs font-semibold text-emerald-700 active:scale-95 transition-all whitespace-nowrap"
                        >
                          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">+ Turnkey Labor</span>
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Items Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3.5 scrollbar-thin">
                      {items.map((it, idx) => (
                        <div
                          key={it.id}
                          className="p-4 bg-slate-50/50 hover:bg-slate-50/90 rounded-2xl border border-slate-100 hover:border-slate-200/90 transition-all space-y-3 relative group/item"
                        >
                          {/* Row 1: Item # Badge + Specification/Description + Delete */}
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg bg-slate-200/70 flex items-center justify-center text-xs font-mono font-bold text-slate-600 shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={it.description}
                                onChange={(e) => handleItemChange(it.id, 'description', e.target.value)}
                                placeholder="Enter product name, chemical grade, formulation, or warranty tier..."
                                className="w-full h-10 px-3.5 bg-white rounded-xl border border-slate-200/80 text-xs sm:text-sm font-medium text-brand-deep-blue focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(it.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Row 2: Qty, Packaging Unit, Unit Price, Line Total */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) => handleItemChange(it.id, 'quantity', e.target.value)}
                                className="w-full h-9 px-3 bg-white rounded-xl border border-slate-200/80 text-xs font-bold text-brand-deep-blue focus:border-brand-blue/60 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Packaging Unit
                              </label>
                              <input
                                type="text"
                                value={it.unit}
                                onChange={(e) => handleItemChange(it.id, 'unit', e.target.value)}
                                placeholder="e.g. Drums, Cartons"
                                className="w-full h-9 px-3 bg-white rounded-xl border border-slate-200/80 text-xs font-medium text-brand-deep-blue focus:border-brand-blue/60 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Unit Price (GHS)
                              </label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₵</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={it.unitPrice}
                                  onChange={(e) => handleItemChange(it.id, 'unitPrice', e.target.value)}
                                  placeholder="0.00"
                                  className="w-full h-9 pl-6 pr-3 bg-white rounded-xl border border-slate-200/80 text-xs font-bold text-brand-blue focus:border-brand-blue/60 outline-none transition-all"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Line Total
                              </label>
                              <div className="h-9 px-3 bg-brand-blue/5 rounded-xl border border-brand-blue/10 flex items-center justify-between">
                                <span className="text-[9px] uppercase font-semibold text-brand-blue/70">Total</span>
                                <span className="text-xs font-bold font-mono text-brand-deep-blue">
                                  ₵{it.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Subtotal Bar */}
                    <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={addItem}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-deep-blue transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add another line item</span>
                      </button>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-medium">Subtotal ({items.length} items):</span>
                        <span className="font-bold font-mono text-brand-deep-blue text-sm">
                          ₵{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (4.5 cols): Commercial Terms & Financial Breakdown Deck */}
                  <div className="lg:col-span-5 xl:col-span-4 flex flex-col overflow-y-auto p-6 space-y-4 scrollbar-thin bg-slate-50/60">
                    
                    {/* Financial Summary Calculation Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-brand-blue" />
                          Financial Breakdown
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                          GHS
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center text-slate-600 font-medium">
                          <span>Items Subtotal:</span>
                          <span className="font-bold font-mono text-brand-deep-blue">
                            ₵{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Discount */}
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Discount (GHS):</span>
                          <input
                            type="number"
                            min="0"
                            value={discountAmount}
                            onChange={(e) => {
                              setIsSaved(false);
                              setDiscountAmount(Number(e.target.value));
                            }}
                            className="w-28 h-8 px-2.5 text-right bg-slate-50 focus:bg-white rounded-lg border border-slate-200 text-xs font-bold text-brand-deep-blue focus:border-brand-blue outline-none transition-all"
                          />
                        </div>

                        {/* Haulage */}
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Haulage / Freight (GHS):</span>
                          <input
                            type="number"
                            min="0"
                            value={freightAmount}
                            onChange={(e) => {
                              setIsSaved(false);
                              setFreightAmount(Number(e.target.value));
                            }}
                            className="w-28 h-8 px-2.5 text-right bg-slate-50 focus:bg-white rounded-lg border border-slate-200 text-xs font-bold text-brand-deep-blue focus:border-brand-blue outline-none transition-all"
                          />
                        </div>

                        {/* Tax Category */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Tax Assessment Scheme
                          </label>
                          <select
                            value={taxType}
                            onChange={(e) => {
                              setIsSaved(false);
                              setTaxType(e.target.value);
                            }}
                            className="w-full h-9 px-3 bg-slate-50 focus:bg-white rounded-xl border border-slate-200 text-xs font-semibold text-brand-deep-blue outline-none cursor-pointer focus:border-brand-blue transition-all"
                          >
                            {TAX_PRESETS.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-0.5">
                            <span>Computed Tax ({ (selectedTax.rate * 100).toFixed(1) }%):</span>
                            <span className="font-semibold font-mono text-slate-700">
                              ₵{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Grand Total */}
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Grand Total Payable
                            </span>
                            <span className="text-[10px] text-slate-400">Taxes & haulage included</span>
                          </div>
                          <span className="text-2xl font-bold font-display text-brand-blue tracking-tight">
                            ₵{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms & Conditions */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Payment Terms & Schedule
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Quick presets</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {PAYMENT_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setIsSaved(false);
                              setPaymentTerms(preset);
                            }}
                            className={`text-[10px] font-semibold p-2 rounded-xl border text-left transition-all leading-tight ${
                              paymentTerms === preset
                                ? 'bg-brand-blue text-white border-brand-blue shadow-2xs'
                                : 'bg-slate-50/80 text-slate-600 border-slate-200/70 hover:bg-slate-100'
                            }`}
                          >
                            Preset {idx + 1}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        value={paymentTerms}
                        onChange={(e) => {
                          setIsSaved(false);
                          setPaymentTerms(e.target.value);
                        }}
                        className="w-full p-2.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/80 text-xs font-medium text-brand-deep-blue focus:border-brand-blue outline-none resize-none transition-all leading-snug"
                      />
                    </div>

                    {/* Validity & Delivery Warranty Notes */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs space-y-2.5">
                      <div className="grid grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Validity Period (Days)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={validityDays}
                            onChange={(e) => {
                              setIsSaved(false);
                              setValidityDays(Number(e.target.value));
                            }}
                            className="w-full h-8 px-2.5 bg-slate-50 focus:bg-white rounded-lg border border-slate-200 text-xs font-bold text-brand-deep-blue outline-none"
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 pb-1">
                          Valid until {new Date(Date.now() + validityDays * 86400000).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Delivery & Warranty Notes
                        </label>
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => {
                            setIsSaved(false);
                            setNotes(e.target.value);
                          }}
                          className="w-full p-2.5 bg-slate-50/60 focus:bg-white rounded-xl border border-slate-200/80 text-xs font-medium text-brand-deep-blue focus:border-brand-blue outline-none resize-none transition-all leading-snug"
                        />
                      </div>
                    </div>

                    {/* Settlement Credentials Card */}
                    <div className="p-3.5 bg-slate-100/70 rounded-2xl border border-slate-200/60 text-[11px] space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                        <CreditCard className="w-3.5 h-3.5 text-brand-blue" />
                        <span>Corporate Settlement Accounts</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        <strong className="text-brand-deep-blue">Ecobank:</strong> 1441002938192 • <strong className="text-brand-deep-blue">Stanbic:</strong> 9040003920194 • <strong className="text-brand-deep-blue">MTN MoMo:</strong> 639201
                      </p>
                    </div>

                  </div>

                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
