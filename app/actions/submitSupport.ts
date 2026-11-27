'use server';

import { Resend } from 'resend';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createServiceRoleClient } from '../../lib/supabase/server';
import { supportRateLimit, isRateLimitConfigured } from '../../lib/ratelimit';
import { extractTrustedClientIp, sanitizeHeaderLine, detectAttackProbe } from '../../lib/security';
import { extractRequestTelemetry, sendSecurityAlert } from '../../lib/alertNotifier';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const SupportRequestSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').max(254),
  message: z
    .string()
    .trim()
    .min(10, 'Please include a bit more detail (at least 10 characters).')
    .max(2000, 'Message is too long (maximum 2000 characters).'),
});

export async function submitSupportRequest(formData: FormData) {
  try {
    const reqHeaders = await headers();
    const { quotaKey } = extractTrustedClientIp(reqHeaders);

    // 1. Rate Limit Check keyed by trusted edge IP
    if (isRateLimitConfigured) {
      try {
        const { success } = await Promise.race([
          supportRateLimit.limit(quotaKey),
          new Promise<{ success: boolean }>((_, reject) =>
            setTimeout(() => reject(new Error('Rate limit timeout')), 800)
          ),
        ]);
        if (!success) {
          return {
            success: false,
            error: 'Too many support requests submitted recently. Please try again later.',
          };
        }
      } catch (rlError) {
        console.warn('[Rate Limit Warning] Support rate limit failed, failing open:', rlError);
      }
    }

    const rawEmail = formData.get('email');
    const rawMessage = formData.get('message');

    // Reject non-string / type-tampered payloads cleanly
    if (typeof rawEmail !== 'string' || typeof rawMessage !== 'string') {
      return { success: false, error: 'Email and message are required.' };
    }

    const probe = detectAttackProbe(rawMessage, 2000);
    if (probe.suspicious) {
      void sendSecurityAlert({
        severity: 'MEDIUM',
        title: `Attack Probe on Support Form (${probe.category})`,
        summary: `Blocked or flagged suspicious ${probe.category} payload in support submission.`,
        cooldownKey: `support_probe:${quotaKey}:${probe.category}`,
        endpoint: 'ServerAction submitSupportRequest',
        actor: rawEmail.slice(0, 120),
        reasonCode: 'SUPPORT_FORM_ATTACK_PROBE',
        probeCategory: probe.category,
        probePreview: rawMessage.slice(0, 120),
        telemetry: extractRequestTelemetry(reqHeaders),
      });
      if (probe.category === 'PAYLOAD_BLOAT') {
        return { success: false, error: 'Message exceeds maximum allowed length.' };
      }
    }

    const parsed = SupportRequestSchema.safeParse({ email: rawEmail, message: rawMessage });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid support request.' };
    }

    const email = sanitizeHeaderLine(parsed.data.email, 254);
    const message = parsed.data.message;

    // 2. Log the complaint into the admin database FIRST
    const supabaseAdmin = createServiceRoleClient();
    const { error: dbError } = await supabaseAdmin
      .from('support_tickets')
      .insert([{ email, message, status: 'new' }]);

    if (dbError) {
      console.error('Failed to log support ticket to database:', dbError);
      return { success: false, error: 'Failed to record complaint in the system.' };
    }

    // 3. Send the email notification
    if (!resend) {
      console.warn('RESEND_API_KEY is not set. Simulating support email delivery.');
      return { success: true };
    }

    const { error } = await resend.emails.send({
      from: 'Prodeal Support <support@prodealindustries.com>',
      to: 'prodealsystems@hotmail.com',
      subject: sanitizeHeaderLine(`New Support Request from ${email}`, 180),
      replyTo: email,
      text: `A new support request was submitted via the Prodeal Portal.\n\nFrom: ${email}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: 'Failed to send the request. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Support action error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
