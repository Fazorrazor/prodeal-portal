import { NextResponse } from 'next/server';
import { createServer } from '../../../../../lib/supabase/server';
import { USER_ROLES } from '../../../../../lib/config/roles';
import { logError } from '../../../../../lib/logger';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
      updateData.division_id = null;
    } else if (body.divisionId !== undefined) {
      updateData.division_id = body.divisionId;
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
