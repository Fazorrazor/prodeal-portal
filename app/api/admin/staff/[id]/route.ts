import { NextResponse } from 'next/server';
import { createServer } from '../../../../../lib/supabase/server';
import { createAdminClient } from '../../../../../lib/supabase/admin';
import { USER_ROLES } from '../../../../../lib/config/roles';
import { logError } from '../../../../../lib/logger';
import { z } from 'zod';
import { adminRateLimit } from '../../../../../lib/ratelimit';
import { ROLE_VALUES } from '../../../../../lib/config/roles';

const UpdateStaffSchema = z.object({
  fullName: z.string().min(2, "Full name is required").optional(),
  whatsappPhone: z.string().min(8, "Valid phone is required").optional(),
  role: z.enum(ROLE_VALUES as [string, ...string[]]).optional(),
  divisionIds: z.array(z.string()).optional(),
  is_active: z.boolean().optional()
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // 0. Rate limiting
    try {
      const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success } = await adminRateLimit.limit(ip);
      if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    } catch (e) {
      console.warn('[Rate Limit Warning] Admin route rate limit check failed', e);
    }

    const supabase = await createServer() as any;
    
    // 1. Verify caller is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify caller is an admin
    const { data: callerStaff } = await supabase
      .from('staff_members')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (callerStaff?.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = UpdateStaffSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json({ error: 'Validation failed', details: validatedData.error.errors }, { status: 400 });
    }
    
    // Build update payload dynamically based on what was sent
    const updateData: any = {};
    if (validatedData.data.is_active !== undefined) updateData.is_active = validatedData.data.is_active;
    if (validatedData.data.fullName) updateData.full_name = validatedData.data.fullName;
    if (validatedData.data.whatsappPhone) updateData.whatsapp_phone = validatedData.data.whatsappPhone;
    if (validatedData.data.role) updateData.role = validatedData.data.role;
    if (validatedData.data.role === USER_ROLES.ADMIN) {
      updateData.division_ids = [];
    } else if (validatedData.data.divisionIds !== undefined) {
      updateData.division_ids = validatedData.data.divisionIds;
    }

    // Check if the target user is the caller themselves
    const { data: targetStaff } = await supabase
      .from('staff_members')
      .select('auth_user_id')
      .eq('id', params.id)
      .single();

    if (targetStaff?.auth_user_id === user.id) {
      return NextResponse.json({ error: 'You cannot modify your own access privileges or active status from this interface.' }, { status: 403 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided to update' }, { status: 400 });
    }

    // 3. Perform update
    const { error: dbError } = await supabase
      .from('staff_members')
      .update(updateData)
      .eq('id', params.id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    await logError(`PATCH /api/admin/staff/${params.id}`, error, { body: await req.json().catch(() => ({})) });
    return NextResponse.json({ error: 'Failed to update staff member. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // 0. Rate limiting
    try {
      const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success } = await adminRateLimit.limit(ip);
      if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    } catch (e) {
      console.warn('[Rate Limit Warning] Admin route rate limit check failed', e);
    }

    const supabase = await createServer() as any;
    
    // 1. Verify caller is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify caller is an admin
    const { data: callerStaff } = await supabase
      .from('staff_members')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (callerStaff?.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if the target user is the caller themselves
    const { data: targetStaff } = await supabase
      .from('staff_members')
      .select('auth_user_id')
      .eq('id', params.id)
      .single();

    if (!targetStaff) {
       return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    if (targetStaff.auth_user_id === user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account from this interface.' }, { status: 403 });
    }

    if (targetStaff.auth_user_id) {
        // Delete from Auth first
        const adminClient = createAdminClient();
        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetStaff.auth_user_id);
        if (authDeleteError) {
             throw authDeleteError;
        }
    }

    // Delete from staff_members table
    const { error: dbError } = await supabase
      .from('staff_members')
      .delete()
      .eq('id', params.id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    await logError(`DELETE /api/admin/staff/${params.id}`, error);
    return NextResponse.json({ error: 'Failed to delete staff member. Please try again.' }, { status: 500 });
  }
}
