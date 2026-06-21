import { NextResponse } from 'next/server';
import { createServer } from '../../../../../lib/supabase/server';
import { createAdminClient } from '../../../../../lib/supabase/admin';
import { USER_ROLES } from '../../../../../lib/config/roles';
import { logError } from '../../../../../lib/logger';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createServer() as any;
    
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
    
    // Build update payload dynamically based on what was sent
    const updateData: any = {};
    if (typeof body.is_active === 'boolean') updateData.is_active = body.is_active;
    if (body.fullName) updateData.full_name = body.fullName;
    if (body.whatsappPhone) updateData.whatsapp_phone = body.whatsappPhone;
    if (body.role) updateData.role = body.role;
    if (body.role === USER_ROLES.ADMIN) {
      updateData.division_ids = [];
    } else if (body.divisionIds !== undefined) {
      updateData.division_ids = body.divisionIds;
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
    const supabase = createServer() as any;
    
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
