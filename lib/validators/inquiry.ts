import { z } from 'zod';

export const ContactDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(100, 'Name is too long — please shorten it.'),

  email: z
    .string()
    .trim()
    .email('Please enter a valid email address (e.g. john@company.com).'),

  phone: z
    .string()
    .transform(val => val.replace(/[\s\-()]/g, '').trim())
    .pipe(
      z.string().regex(
        /^\+[1-9]\d{6,14}$/,
        'Please enter your number in international format, e.g. +233201234567.'
      )
    ),

  companyName: z
    .string()
    .trim()
    .max(150, 'Company name is too long.')
    .optional(),
    
  botcheck: z.string().optional(), // Honeypot field
});

const RfqItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  quantity: z.number().min(1),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

const BaseInquirySchema = z.object({
  productId:   z.string().optional(),
  productName: z.string().optional(),
  items:       z.array(RfqItemSchema).optional(),
  message: z
    .string()
    .trim()
    .max(1000, 'Your message is too long. Please keep it under 1000 characters.')
    .optional(),
}).refine(data => {
  // Must have either a descriptive message (at least 10 chars) OR at least one item
  if (data.items && data.items.length > 0) return true;
  return typeof data.message === 'string' && data.message.trim().length >= 10;
}, {
  message: 'Please provide either specific product items or at least a sentence explaining what you need.',
  path: ['message'],
});

export const DIVISION_SCHEMAS = {
  signages:  BaseInquirySchema,
  printing:  BaseInquirySchema,
  bowls:     BaseInquirySchema,
  chemicals: BaseInquirySchema,
} as const;

export const InquirySubmissionSchema = z.object({
  divisionSlug: z.enum(['signages', 'printing', 'bowls', 'chemicals']),
  contact:      ContactDetailsSchema,
  inquiry:      z.record(z.unknown()), // Validated against DIVISION_SCHEMAS dynamically
  fileIds:      z.array(z.string()).max(5),
});
