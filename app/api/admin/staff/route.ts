import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { USER_ROLES, ROLE_VALUES } from '../../../../lib/config/roles';
import { logError } from '../../../../lib/logger';
import { adminRateLimit, isRateLimitConfigured } from '../../../../lib/ratelimit';
import { extractTrustedClientIp, getAdminPortalOrigin } from '../../../../lib/security';
import { getVerifiedActiveStaff } from '../../../../lib/supabase/requireStaff';

const staffSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
  whatsappPhone: z.string().trim().min(8, 'Valid phone is required').max(25),
  email: z.string().trim().email('Valid email is required').max(254),
  role: z.enum(ROLE_VALUES),
});

export async function POST(req: Request) {
  try {
    // 0. Rate limiting keyed by trusted edge IP
    if (isRateLimitConfigured) {
      try {
        const { quotaKey } = extractTrustedClientIp(req.headers);
        const { success } = await adminRateLimit.limit(quotaKey);
        if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      } catch (e) {
        console.warn('[Rate Limit Warning] Admin route rate limit check failed', e);
      }
    }

    // 1. Verify caller is an authenticated, active admin
    const auth = await getVerifiedActiveStaff();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { staff: callerStaff, supabase } = auth.context;

    if (callerStaff.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Validate request body
    const body = await req.json();
    const validatedData = staffSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const { fullName, whatsappPhone, email, role } = validatedData.data;

    // 3. Fetch active divisions to auto-assign to agents
    const { data: allDivisions } = await supabase.from('divisions').select('id').eq('is_active', true);
    const allDivisionIds = allDivisions?.map((d: { id: string }) => d.id) || [];

    // 4. Create auth user via Admin API Invite
    const adminClient = createAdminClient();
    const formattedPhone = whatsappPhone.startsWith('+') ? whatsappPhone : `+${whatsappPhone}`;

    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${getAdminPortalOrigin()}/admin/update-password`,
      data: { full_name: fullName, phone: formattedPhone },
    });

    if (authError) {
      await logError('POST /api/admin/staff (Auth)', authError, { role });
      return NextResponse.json({ error: authError.message || 'Failed to send invite email.' }, { status: 400 });
    }

    // 5. Insert into staff_members table
    const { error: dbError } = await adminClient.from('staff_members').insert({
      auth_user_id: authData.user.id,
      full_name: fullName,
      whatsapp_phone: whatsappPhone,
      role,
      division_ids: role === USER_ROLES.STAFF ? allDivisionIds : [],
      is_active: true,
    });

    if (dbError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      await logError('POST /api/admin/staff (DB Insert)', dbError, { userId: authData.user.id });
      return NextResponse.json({ error: 'Failed to save staff member to database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id }, { status: 201 });
  } catch (error: unknown) {
    await logError('POST /api/admin/staff (Unknown)', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
