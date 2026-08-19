'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Printer, Check, Calculator, FileText, Loader2, Sparkles } from 'lucide-react';
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

export function QuotationBuilder({ inquiry, existingQuotation }: QuotationBuilderProps) {
  const [isPending, startTransition] = useTransition();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(!!existingQuotation);

  // Extract initial items from RFQ inquiry payload or existing quote
  const quoteSeed = existingQuotation?.payload || {};
  
  const getInitialItems = (): QuotationItem[] => {
    if (quoteSeed.items && Array.isArray(quoteSeed.items)) {
      return quoteSeed.items.map((it: any, idx: number) => ({
        id: `item-${idx}`,
        description: it.description || it.productName || 'Industrial Supply Item',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'units',
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)
      }));
    }

    const payload = inquiry.inquiry_payload || {};
    
    // Check if multi-item tray exists
    if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
      return payload.items.map((it: any, idx: number) => ({
        id: `seed-${idx}`,
        description: it.name || it.productName || 'B2B Item',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'units',
        unitPrice: 0,
        total: 0
      }));
    }

    // Single item fallback
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
    quoteSeed.paymentTerms || '50% advance upon order confirmation, 50% prior to dispatch from Tema warehouse.'
  );
  const [notes, setNotes] = useState<string>(
    quoteSeed.notes || 'Goods delivered with official manufacturer certificate of analysis (COA) / warranty.'
  );

  const selectedTax = TAX_PRESETS.find((t) => t.id === taxType) || TAX_PRESETS[0];

  // Calculations
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
        unit: 'units',
        unitPrice: 0,
        total: 0
      }
    ]);
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
        toast.success(`Quotation ${quoteNumber} generated & ticket set to Quoted!`);
      } else {
        toast.error(res.error || 'Failed to save quotation');
      }
    });
  };

  return (
    <section className="bg-white border-2 border-brand-deep-blue p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,0.06)] relative">
      {/* ── Quotation Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-brand-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-blue/10 text-brand-blue">
              <Calculator className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-heading font-bold text-brand-deep-blue tracking-tight">
              B2B Pro-Forma Quotation Builder
            </h3>
          </div>
          <p className="text-xs font-mono text-brand-deep-blue/70 mt-1">
            Quote Reference: <span className="font-bold text-brand-blue">{quoteNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-brand-deep-blue/40 text-xs font-mono font-bold uppercase tracking-wider text-brand-deep-blue hover:bg-black/5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Spec PDF
          </button>

          <button
            onClick={handleSave}
            disabled={isPending}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2 bg-brand-deep-blue text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-blue active:scale-95 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isSaved ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            {isPending ? 'Saving...' : isSaved ? 'Update Quotation' : 'Save & Issue Quote'}
          </button>
        </div>
      </div>

      {/* ── Client & Date Context ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-brand-border/40 bg-black/[0.02] px-4 my-6">
        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/60 block mb-1">
            Recipient / Buyer
          </span>
          <p className="text-sm font-bold text-brand-deep-blue">{inquiry.contact_name}</p>
          <p className="text-xs font-body text-brand-deep-blue/80">{inquiry.company_name || 'Individual B2B Account'}</p>
          <p className="text-xs font-mono text-brand-deep-blue/60">{inquiry.phone || inquiry.email || 'Direct Contact'}</p>
        </div>

        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/60 block mb-1">
            Issuing Supplier
          </span>
          <p className="text-sm font-bold text-brand-deep-blue">Prodeal Industries Ltd</p>
          <p className="text-xs font-body text-brand-deep-blue/80">Tema Heavy Industrial Area, Greater Accra, Ghana</p>
          <p className="text-xs font-mono text-brand-deep-blue/60">TIN: C0003892189 / VAT Registered</p>
        </div>

        <div>
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/60 block mb-1">
            Quote Details
          </span>
          <p className="text-xs font-mono text-brand-deep-blue">Date: {new Date().toLocaleDateString('en-GB')}</p>
          <p className="text-xs font-mono text-brand-deep-blue">Division: {inquiry.divisions?.display_name || 'Industrial'}</p>
          <p className="text-xs font-mono text-brand-deep-blue">Validity: {validityDays} Days</p>
        </div>
      </div>

      {/* ── Line Items Interactive Table ── */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-brand-deep-blue text-[10px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/80 bg-brand-surface">
              <th className="py-3 px-3 w-[45%]">Item Description</th>
              <th className="py-3 px-3 w-[15%]">Qty</th>
              <th className="py-3 px-3 w-[15%]">Unit</th>
              <th className="py-3 px-3 w-[15%]">Unit Price (GHS)</th>
              <th className="py-3 px-3 w-[10%] text-right">Total (GHS)</th>
              <th className="py-3 px-2 w-[5%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 font-mono text-xs">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-black/[0.01]">
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    value={it.description}
                    onChange={(e) => handleItemChange(it.id, 'description', e.target.value)}
                    placeholder="Enter item description..."
                    className="w-full px-2.5 py-1.5 border border-brand-border/60 text-xs font-medium text-brand-deep-blue focus:border-brand-blue outline-none"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(it.id, 'quantity', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-brand-border/60 text-xs font-medium text-brand-deep-blue focus:border-brand-blue outline-none"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    value={it.unit}
                    onChange={(e) => handleItemChange(it.id, 'unit', e.target.value)}
                    placeholder="e.g. Drums"
                    className="w-full px-2.5 py-1.5 border border-brand-border/60 text-xs font-medium text-brand-deep-blue focus:border-brand-blue outline-none"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={it.unitPrice}
                    onChange={(e) => handleItemChange(it.id, 'unitPrice', e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 border border-brand-border/60 text-xs font-bold text-brand-blue focus:border-brand-blue outline-none"
                  />
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-brand-deep-blue">
                  ₵{it.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="p-1.5 text-brand-deep-blue/40 hover:text-brand-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-blue hover:text-brand-deep-blue mb-8 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Line Item
      </button>

      {/* ── Tax, Freight & Totals Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t-2 border-brand-border/60">
        {/* Payment & Terms */}
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-1.5">
              Payment Terms
            </label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border/60 text-xs font-body text-brand-deep-blue focus:border-brand-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-1.5">
              Special Notes / Logistics Clauses
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-brand-border/60 text-xs font-body text-brand-deep-blue focus:border-brand-blue outline-none resize-none"
            />
          </div>

          {/* Official Bank Settlement Info */}
          <div className="p-4 bg-black/[0.02] border border-brand-border/60 text-[11px] font-mono space-y-1">
            <span className="font-bold text-brand-deep-blue uppercase tracking-widest block text-[9px]">
              Official Settlement Channels
            </span>
            <p className="text-brand-deep-blue/80">
              <strong className="text-brand-deep-blue">Ecobank Ghana:</strong> 1441002938192 (Tema Main Branch)
            </p>
            <p className="text-brand-deep-blue/80">
              <strong className="text-brand-deep-blue">Stanbic Bank:</strong> 9040003920194 (Accra High Street)
            </p>
            <p className="text-brand-deep-blue/80">
              <strong className="text-brand-deep-blue">MTN MoMo Merchant:</strong> 639201 (Prodeal Industries)
            </p>
          </div>
        </div>

        {/* Totals Computation Box */}
        <div className="bg-brand-surface p-5 border border-brand-border/80 flex flex-col justify-between space-y-3 font-mono">
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-brand-deep-blue/80">
              <span>Items Subtotal:</span>
              <span className="font-bold text-brand-deep-blue">
                ₵{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-brand-deep-blue/80">
              <span>Discount (GHS):</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-28 px-2 py-1 text-right border border-brand-border/60 text-xs font-bold text-brand-deep-blue outline-none"
              />
            </div>

            {/* Freight / Haulage */}
            <div className="flex items-center justify-between text-brand-deep-blue/80">
              <span>Haulage / Logistics (GHS):</span>
              <input
                type="number"
                min="0"
                value={freightAmount}
                onChange={(e) => setFreightAmount(Number(e.target.value))}
                className="w-28 px-2 py-1 text-right border border-brand-border/60 text-xs font-bold text-brand-deep-blue outline-none"
              />
            </div>

            {/* Tax Tier */}
            <div className="flex items-center justify-between text-brand-deep-blue/80 pt-1">
              <span>Tax Category:</span>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="px-2 py-1 border border-brand-border/60 text-xs font-mono font-medium text-brand-deep-blue outline-none bg-white"
              >
                {TAX_PRESETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between text-brand-deep-blue/80 text-[11px]">
              <span>Computed Tax ({selectedTax.label}):</span>
              <span>₵{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-3 border-t-2 border-brand-deep-blue flex justify-between items-baseline">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue block">
                Grand Total (GHS)
              </span>
              <span className="text-[9px] text-brand-deep-blue/60">Inclusive of taxes & haulage</span>
            </div>
            <span className="text-2xl font-bold font-heading text-brand-blue tracking-tight">
              ₵{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
