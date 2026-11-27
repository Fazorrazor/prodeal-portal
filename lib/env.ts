import { z } from 'zod';

const optionalNonEmpty = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine((v) => !v || z.string().url().safeParse(v).success, {
    message: 'Must be a valid URL',
  });

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: 'Must be a valid email address',
  });

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().trim().min(1, 'required').url('invalid_url'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1, 'required'),
  NEXT_PUBLIC_ADMIN_SUBDOMAIN_HOST: optionalNonEmpty,
});

export const serverEnvSchema = publicEnvSchema.extend({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1, 'required'),
  ADMIN_SUBDOMAIN_HOST: optionalNonEmpty,
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalNonEmpty,
  RESEND_API_KEY: optionalNonEmpty,
  SECURITY_ALERT_EMAIL: optionalEmail,
  SECURITY_ALERT_FROM: optionalNonEmpty,
  ENABLE_DEV_SECURITY_EMAILS: optionalNonEmpty,
  CRON_SECRET: optionalNonEmpty,
  CLOUDFLARE_ORIGIN_SECRET: optionalNonEmpty,
  META_WA_ACCESS_TOKEN: optionalNonEmpty,
  META_WA_PHONE_NUMBER_ID: optionalNonEmpty,
  WHATSAPP_TOKEN: optionalNonEmpty,
  WHATSAPP_PHONE_ID: optionalNonEmpty,
  TWILIO_ACCOUNT_SID: optionalNonEmpty,
  TWILIO_AUTH_TOKEN: optionalNonEmpty,
  TWILIO_PHONE_NUMBER: optionalNonEmpty,
  TWILIO_WHATSAPP_NUMBER: optionalNonEmpty,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export interface EnvValidationResult {
  ok: boolean;
  missingRequired: string[];
  invalidFields: string[];
  warnings: string[];
}

const REQUIRED_SERVER_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export function validateServerEnv(
  rawEnv: Record<string, string | undefined> = process.env
): EnvValidationResult {
  const missingRequired: string[] = [];
  const invalidFields: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_SERVER_KEYS) {
    const val = rawEnv[key];
    if (!val || val.trim().length === 0) {
      missingRequired.push(key);
    }
  }

  const parsed = serverEnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '');
      if (!field) continue;
      if (!missingRequired.includes(field) && !invalidFields.includes(field)) {
        invalidFields.push(field);
      }
    }
  }

  const isProd = rawEnv.NODE_ENV === 'production';
  if (isProd) {
    if (!rawEnv.ADMIN_SUBDOMAIN_HOST?.trim()) {
      warnings.push('ADMIN_SUBDOMAIN_HOST is unset in production (admin subdomain isolation inactive).');
    }
    if (!rawEnv.UPSTASH_REDIS_REST_URL?.trim() || !rawEnv.UPSTASH_REDIS_REST_TOKEN?.trim()) {
      warnings.push('UPSTASH_REDIS_REST_URL/TOKEN unset in production (distributed rate limiting inactive).');
    }
    if (!rawEnv.RESEND_API_KEY?.trim()) {
      warnings.push('RESEND_API_KEY is unset in production (transactional & security emails disabled).');
    }
  }

  return {
    ok: missingRequired.length === 0 && invalidFields.length === 0,
    missingRequired,
    invalidFields,
    warnings,
  };
}

export function requireServerEnv(
  rawEnv: Record<string, string | undefined> = process.env
): ServerEnv {
  const result = serverEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const fields = Array.from(new Set(result.error.issues.map((i) => String(i.path[0] ?? 'unknown'))));
    throw new Error(`Invalid or missing server environment variables: ${fields.join(', ')}`);
  }
  return result.data;
}
