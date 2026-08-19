'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Printer, Check, Calculator, Loader2, Sparkles, CreditCard, Layers, Wrench } from 'lucide-react';
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
    <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-5 sm:p-6 transition-all space-y-4">
      
      {/* ── Luxury Header Bar with Zero-Wrap Button Protections ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 pb-4 border-b border-slate-100/80 shrink-0">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0 mt-0.5 sm:mt-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-display font-bold text-brand-deep-blue tracking-tight leading-tight">
              B2B Pro-Forma Quotation
            </h3>
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

        {/* Action Buttons (Fixed nowrap with shrink-0) */}
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

      {/* ── Compact Line Items Section with Scrollbar (45% Height Reduction) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Quotation Line Items ({items.length})
            </h4>
          </div>
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
                  onClick={() => setPaymentTerms(preset)}
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
              onChange={(e) => setPaymentTerms(e.target.value)}
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
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
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
                onChange={(e) => setFreightAmount(Number(e.target.value))}
                className="w-24 h-8 px-2 text-right bg-white rounded-lg border border-slate-200 text-xs font-bold text-brand-deep-blue outline-none"
              />
            </div>

            {/* Tax Category */}
            <div className="space-y-1 pt-0.5">
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
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
  );
}
