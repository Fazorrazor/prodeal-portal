import { z } from 'zod';

export const ContactDetailsSchema = z.object({
  name:        z.string().min(2).max(100),
  email:       z.string().email(),
  phone:       z.string().regex(/^\+[1-9]\d{6,14}$/, 'Must be E.164 format'),
  companyName: z.string().max(150).optional(),
});

export const BaseInquirySchema = z.object({
  productId:    z.string().uuid(),
  productName:  z.string(),
  message:      z.string().min(10, "Please tell us a bit more about what you need.").max(1000),
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
