'use server';

import { createServer } from '../../lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { logError } from '../../lib/logger';

const QuotationItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().default('units'),
  unitPrice: z.number().nonnegative('Unit price must be 0 or more'),
  total: z.number().nonnegative()
});

const SaveQuotationSchema = z.object({
  inquiryId: z.string().uuid(),
  quoteNumber: z.string(),
  items: z.array(QuotationItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().nonnegative(),
  taxType: z.enum(['standard_vat', 'exempt', 'nhil_getfund']),
  taxRate: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  freightAmount: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().positive('Total amount must be greater than 0'),
  currency: z.string().default('GHS'),
  validityDays: z.number().int().positive().default(14),
  paymentTerms: z.string().default('50% advance upon order confirmation, 50% before dispatch/delivery.'),
  notes: z.string().optional()
});

export type SaveQuotationPayload = z.infer<typeof SaveQuotationSchema>;

export async function saveQuotation(payload: SaveQuotationPayload) {
  try {
    const validated = SaveQuotationSchema.parse(payload);
    const supabase = (await createServer()) as any;

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please sign in as an admin or staff member.' };
    }

    // 1. Insert quotation event into inquiry_events
    const { error: eventError } = await supabase.from('inquiry_events').insert({
      inquiry_id: validated.inquiryId,
      actor_id: user.id,
      event_type: 'quotation_generated',
      payload: {
        quoteNumber: validated.quoteNumber,
        items: validated.items,
        subtotal: validated.subtotal,
        taxType: validated.taxType,
        taxRate: validated.taxRate,
        taxAmount: validated.taxAmount,
        freightAmount: validated.freightAmount,
        discountAmount: validated.discountAmount,
        totalAmount: validated.totalAmount,
        currency: validated.currency,
        validityDays: validated.validityDays,
        paymentTerms: validated.paymentTerms,
        notes: validated.notes,
        generatedAt: new Date().toISOString(),
        issuerId: user.id
      }
    });

    if (eventError) {
      await logError('Failed to record quotation event', eventError, { inquiryId: validated.inquiryId });
      return { success: false, error: 'Database failed to save quotation event.' };
    }

    // 2. Automatically update inquiry status to 'quoted'
    const { error: statusError } = await supabase
      .from('inquiries')
      .update({
        status: 'quoted',
        updated_at: new Date().toISOString()
      })
      .eq('id', validated.inquiryId);

    if (statusError) {
      await logError('Failed to update status to quoted', statusError, { inquiryId: validated.inquiryId });
    }

    // 3. Revalidate paths
    revalidatePath(`/admin/tickets/${validated.inquiryId}`);
    revalidatePath('/admin/tickets');
    revalidatePath('/admin');

    return {
      success: true,
      quoteNumber: validated.quoteNumber,
      totalAmount: validated.totalAmount
    };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors.map((e) => e.message).join(', ') };
    }
    await logError('saveQuotation action error', err);
    return { success: false, error: err.message || 'An unexpected error occurred while saving the quotation.' };
  }
}
