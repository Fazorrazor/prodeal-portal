import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { z } from 'zod';
import { adminLoginRateLimit, isRateLimitConfigured } from '../../../../../lib/ratelimit';
import {
  detectAttackProbe,
  extractTrustedClientIp,
  sanitizeSafeRedirect,
} from '../../../../../lib/security';
import { extractRequestTelemetry, sendSecurityAlert } from '../../../../../lib/alertNotifier';

const LoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  password: z.string().min(1, 'Password is required.').max(256),
  redirectTo: z.string().max(256).optional(),
});

const GENERIC_AUTH_ERROR = 'Invalid email or password.';

export async function POST(req: Request) {
  const telemetry = extractRequestTelemetry(req.headers);
  const { quotaKey } = extractTrustedClientIp(req.headers);

  try {
    // 1. Parse and validate body cleanly before touching auth
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
    }

    const emailProbe = detectAttackProbe((body as Record<string, unknown>)?.email, 254);
    if (emailProbe.suspicious) {
      void sendSecurityAlert({
        severity: 'HIGH',
        title: 'Attack Probe on Admin Login',
        summary: `Blocked suspicious ${emailProbe.category} payload targeting the admin login endpoint.`,
        cooldownKey: `admin_login_probe:${quotaKey}:${emailProbe.category}`,
        endpoint: 'POST /api/admin/auth/login',
        reasonCode: 'ADMIN_LOGIN_ATTACK_PROBE',
        probeCategory: emailProbe.category,
        telemetry,
      });
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 400 });
    }

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    // 2. Dual-key brute-force lockout (IP /64 AND target email) via Upstash Redis
    if (isRateLimitConfigured) {
      try {
        const [ipCheck, emailCheck] = await Promise.all([
          adminLoginRateLimit.limit(`ip:${quotaKey}`),
          adminLoginRateLimit.limit(`email:${email}`),
        ]);

        if (!ipCheck.success || !emailCheck.success) {
          void sendSecurityAlert({
            severity: 'HIGH',
            title: 'Admin Login Brute-Force Lockout',
            summary: `Repeated failed admin login attempts triggered a 15-minute rate-limit lockout.`,
            cooldownKey: `admin_login_lockout:${quotaKey}:${email}`,
            endpoint: 'POST /api/admin/auth/login',
            actor: email,
            reasonCode: 'ADMIN_LOGIN_BRUTE_FORCE_LOCKOUT',
            telemetry,
          });
          return NextResponse.json(
            { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
            { status: 429 }
          );
        }
      } catch (rlErr) {
        console.warn('[Rate Limit Warning] Admin login rate limit check failed:', rlErr);
      }
    }

    // 3. Authenticate against Supabase Auth server-side
    const cookieStore = await cookies();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any }) as any;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // 4. Verify caller is an ACTIVE staff member BEFORE accepting session
    const { data: staff, error: staffError } = await supabase
      .from('staff_members')
      .select('id, role, is_active')
      .eq('auth_user_id', data.user.id)
      .single();

    if (staffError || !staff || staff.is_active !== true) {
      await supabase.auth.signOut();
      void sendSecurityAlert({
        severity: 'HIGH',
        title: 'Deactivated or Unauthorized Staff Login Attempt',
        summary: `A user attempted to sign into the admin portal with a deactivated or missing staff profile.`,
        cooldownKey: `inactive_staff_login:${quotaKey}:${email}`,
        endpoint: 'POST /api/admin/auth/login',
        actor: email,
        reasonCode: 'INACTIVE_STAFF_LOGIN_BLOCKED',
        telemetry,
      });
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const redirectTo = sanitizeSafeRedirect(parsed.data.redirectTo, '/admin', '/admin');
    return NextResponse.json({ success: true, redirectTo }, { status: 200 });
  } catch (err) {
    console.error('Admin login route error:', err);
    return NextResponse.json({ error: 'Unable to complete sign-in. Please try again.' }, { status: 500 });
  }
}
