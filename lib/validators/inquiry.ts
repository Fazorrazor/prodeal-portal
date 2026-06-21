import { z } from 'zod';

export const ContactDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter your full name.')
    .max(100, 'Name is too long — please shorten it.'),

  email: z
    .string()
    .email('Please enter a valid email address (e.g. john@company.com).'),

  phone: z
    .string()
    .regex(
      /^\+[1-9]\d{6,14}$/,
      'Please enter your number in international format, e.g. +233201234567.'
    ),

  companyName: z
    .string()
    .max(150, 'Company name is too long.')
    .optional(),
});

const BaseInquirySchema = z.object({
  productId:   z.string().uuid(),
  productName: z.string(),
  message: z
    .string()
    .min(10, 'Please give us a bit more detail — at least a sentence about what you need.')
    .max(1000, 'Your message is too long. Please keep it under 1000 characters.'),
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
