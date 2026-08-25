import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const TAX_PRESETS = [
  { id: 'standard_vat', label: 'Standard VAT + Levies (21.9%)', rate: 0.219 },
  { id: 'nhil_getfund', label: 'Flat Rate Scheme (3%)', rate: 0.03 },
  { id: 'exempt', label: 'Tax Exempt / Export (0%)', rate: 0.0 }
] as const;

function calculateQuotationTotal({
  items,
  discountAmount = 0,
  freightAmount = 0,
  taxRate = 0.219
}: {
  items: Array<{ quantity: number; unitPrice: number }>;
  discountAmount?: number;
  freightAmount?: number;
  taxRate?: number;
}) {
  const subtotal = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableBase * taxRate).toFixed(2));
  const totalAmount = Number((taxableBase + taxAmount + freightAmount).toFixed(2));
  return { subtotal, taxableBase, taxAmount, totalAmount };
}

describe('Quotation Financial Calculations', () => {
  it('correctly calculates subtotal, standard VAT, and total', () => {
    const items = [
      { quantity: 10, unitPrice: 150 }, // 1,500
      { quantity: 2, unitPrice: 500 }   // 1,000
    ]; // Subtotal = 2,500
    const result = calculateQuotationTotal({ items, discountAmount: 0, freightAmount: 200, taxRate: 0.219 });

    expect(result.subtotal).toBe(2500);
    expect(result.taxableBase).toBe(2500);
    expect(result.taxAmount).toBe(547.5);
    expect(result.totalAmount).toBe(3247.5);
  });

  it('correctly applies discount and computes taxable base', () => {
    const items = [{ quantity: 5, unitPrice: 1000 }]; // 5,000
    const result = calculateQuotationTotal({ items, discountAmount: 500, freightAmount: 100, taxRate: 0.03 });

    expect(result.subtotal).toBe(5000);
    expect(result.taxableBase).toBe(4500);
    expect(result.taxAmount).toBe(135);
    expect(result.totalAmount).toBe(4735);
  });

  it('handles tax exemption correctly', () => {
    const items = [{ quantity: 1, unitPrice: 12000 }];
    const result = calculateQuotationTotal({ items, discountAmount: 0, freightAmount: 500, taxRate: 0 });

    expect(result.subtotal).toBe(12000);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(12500);
  });
});
