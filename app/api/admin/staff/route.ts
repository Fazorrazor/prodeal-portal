import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServer } from '../../../../lib/supabase/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { USER_ROLES, ROLE_VALUES } from '../../../../lib/config/roles';
import { logError } from '../../../../lib/logger';

const staffSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  whatsappPhone: z.string().min(8, "Valid phone is required"),
  role: z.enum(ROLE_VALUES),
  divisionIds: z.array(z.string()).optional()
}).refine(data => {
  if (data.role === USER_ROLES.STAFF && (!data.divisionIds || data.divisionIds.length === 0)) return false;
  return true;
}, {
  message: "Agents must be assigned to at least one division",
  path: ["divisionIds"]
});

export async function POST(req: Request) {
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

    // 3. Validate request body
    const body = await req.json();
    const validatedData = staffSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validatedData.error.errors 
      }, { status: 400 });
    }

    const { fullName, email, password, whatsappPhone, role, divisionIds } = validatedData.data;

    // 4. Create auth user securely via Admin API
    const adminClient = createAdminClient();
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      await logError('POST /api/admin/staff (Auth)', authError, { email, role });
      return NextResponse.json({ error: 'Failed to create auth user.' }, { status: 400 });
    }

    // 5. Insert into staff_members table
    const { error: dbError } = await adminClient
      .from('staff_members')
      .insert({
        auth_user_id: authData.user.id,
        full_name: fullName,
        whatsapp_phone: whatsappPhone,
        role: role,
        division_ids: role === USER_ROLES.STAFF ? divisionIds || [] : [],
        is_active: true
      });

    if (dbError) {
      // Rollback auth user creation if DB insert fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      await logError('POST /api/admin/staff (DB Insert)', dbError, { userId: authData.user.id });
      return NextResponse.json({ error: 'Failed to save staff member to database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id }, { status: 201 });

  } catch (error: any) {
    await logError('POST /api/admin/staff (Unknown)', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
