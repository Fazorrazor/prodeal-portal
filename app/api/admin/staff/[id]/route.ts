import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../../lib/supabase/admin';
import { USER_ROLES, ROLE_VALUES } from '../../../../../lib/config/roles';
import { logError } from '../../../../../lib/logger';
import { z } from 'zod';
import { adminRateLimit, isRateLimitConfigured } from '../../../../../lib/ratelimit';
import { extractTrustedClientIp } from '../../../../../lib/security';
import { getVerifiedActiveStaff } from '../../../../../lib/supabase/requireStaff';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const UpdateStaffSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120).optional(),
  whatsappPhone: z.string().trim().min(8, 'Valid phone is required').max(25).optional(),
  role: z.enum(ROLE_VALUES as [string, ...string[]]).optional(),
  divisionIds: z.array(z.string().uuid()).max(20).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    if (isRateLimitConfigured) {
      try {
        const { quotaKey } = extractTrustedClientIp(req.headers);
        const { success } = await adminRateLimit.limit(quotaKey);
        if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      } catch (e) {
        console.warn('[Rate Limit Warning] Admin route rate limit check failed', e);
      }
    }

    const auth = await getVerifiedActiveStaff();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user, staff: callerStaff, supabase } = auth.context;

    if (callerStaff.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = UpdateStaffSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validatedData.error.issues },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (validatedData.data.is_active !== undefined) updateData.is_active = validatedData.data.is_active;
    if (validatedData.data.fullName) updateData.full_name = validatedData.data.fullName;
    if (validatedData.data.whatsappPhone) updateData.whatsapp_phone = validatedData.data.whatsappPhone;
    if (validatedData.data.role) updateData.role = validatedData.data.role;
    if (validatedData.data.role === USER_ROLES.ADMIN) {
      updateData.division_ids = [];
    } else if (validatedData.data.divisionIds !== undefined) {
      updateData.division_ids = validatedData.data.divisionIds;
    }

    const { data: targetStaff } = await supabase
      .from('staff_members')
      .select('auth_user_id')
      .eq('id', params.id)
      .single();

    if (!targetStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    if (targetStaff.auth_user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot modify your own access privileges or active status from this interface.' },
        { status: 403 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided to update' }, { status: 400 });
    }

    const { error: dbError } = await supabase
      .from('staff_members')
      .update(updateData)
      .eq('id', params.id);

    if (dbError) throw dbError;

    // Propagate deactivation/reactivation directly to Supabase Auth so tokens cannot be refreshed
    if (validatedData.data.is_active !== undefined && targetStaff.auth_user_id) {
      const adminClient = createAdminClient();
      const { error: banError } = await adminClient.auth.admin.updateUserById(
        targetStaff.auth_user_id,
        { ban_duration: validatedData.data.is_active ? 'none' : '876000h' }
      );
      if (banError) {
        await logError(`PATCH /api/admin/staff/${params.id} (Auth Ban Sync)`, banError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    await logError(`PATCH /api/admin/staff/${params.id}`, error);
    return NextResponse.json({ error: 'Failed to update staff member. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    if (isRateLimitConfigured) {
      try {
        const { quotaKey } = extractTrustedClientIp(req.headers);
        const { success } = await adminRateLimit.limit(quotaKey);
        if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      } catch (e) {
        console.warn('[Rate Limit Warning] Admin route rate limit check failed', e);
      }
    }

    const auth = await getVerifiedActiveStaff();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user, staff: callerStaff, supabase } = auth.context;

    if (callerStaff.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: targetStaff } = await supabase
      .from('staff_members')
      .select('auth_user_id')
      .eq('id', params.id)
      .single();

    if (!targetStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    if (targetStaff.auth_user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account from this interface.' },
        { status: 403 }
      );
    }

    if (targetStaff.auth_user_id) {
      const adminClient = createAdminClient();
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetStaff.auth_user_id);
      if (authDeleteError) {
        throw authDeleteError;
      }
    }

    const { error: dbError } = await supabase.from('staff_members').delete().eq('id', params.id);
    if (dbError) throw dbError;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    await logError(`DELETE /api/admin/staff/${params.id}`, error);
    return NextResponse.json({ error: 'Failed to delete staff member. Please try again.' }, { status: 500 });
  }
}
