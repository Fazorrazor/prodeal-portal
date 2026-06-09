import { z } from 'zod';

export const ContactDetailsSchema = z.object({
  name:        z.string().min(2).max(100),
  email:       z.string().email(),
  phone:       z.string().regex(/^\+[1-9]\d{6,14}$/, 'Must be E.164 format'),
  companyName: z.string().max(150).optional(),
});

export const SignageInquirySchema = z.object({
  signType:     z.enum(['3d_lettering', 'lightbox', 'standee', 'vehicle_wrap', 'other']),
  width:        z.number().positive().max(10000),   // mm
  height:       z.number().positive().max(10000),   // mm
  quantity:     z.number().int().min(1).max(500),
  materialPref: z.string().max(200).optional(),
  deadline:     z.string().datetime().optional(),
  notes:        z.string().max(1000).optional(),
});

export const PrintingInquirySchema = z.object({
  productType:  z.string().min(2).max(100),
  quantity:     z.number().int().min(1).max(10000),
  hasArtwork:   z.boolean(),
  printSides:   z.enum(['single', 'double', 'all_over']).optional(),
  notes:        z.string().max(1000).optional(),
});

export const BowlsInquirySchema = z.object({
  productSku:   z.string().min(2).max(50),
  quantity:     z.number().int().min(100),          // Enforce MOQ
  deliveryDate: z.string().datetime().optional(),
  deliveryAddr: z.string().max(300),
  notes:        z.string().max(500).optional(),
});

export const ChemicalInquirySchema = z.object({
  productName:  z.string().min(2).max(200),
  casNumber:    z.string().regex(/^\d{2,7}-\d{2}-\d$/).optional(),
  grade:        z.enum(['industrial', 'lab', 'food', 'pharmaceutical']),
  quantityKg:   z.number().positive(),
  intendedUse:  z.string().min(10).max(500),        // Required for compliance
  hasHazmatExp: z.boolean(),
  notes:        z.string().max(500).optional(),
});

export const DIVISION_SCHEMAS = {
  signages:  SignageInquirySchema,
  printing:  PrintingInquirySchema,
  bowls:     BowlsInquirySchema,
  chemicals: ChemicalInquirySchema,
} as const;

export const InquirySubmissionSchema = z.object({
  divisionSlug: z.enum(['signages', 'printing', 'bowls', 'chemicals']),
  contact:      ContactDetailsSchema,
  inquiry:      z.record(z.unknown()), // Validated against DIVISION_SCHEMAS dynamically
  fileIds:      z.array(z.string().uuid()).max(5),
});
