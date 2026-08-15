import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServer } from '../../../../lib/supabase/server';
import { createAdminClient } from '../../../../lib/supabase/admin';
import { USER_ROLES, ROLE_VALUES } from '../../../../lib/config/roles';
import { logError } from '../../../../lib/logger';
import { adminRateLimit } from '../../../../lib/ratelimit';

const staffSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  whatsappPhone: z.string().min(8, "Valid phone is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(ROLE_VALUES)
});

export async function POST(req: Request) {
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

    // 3. Validate request body
    const body = await req.json();
    const validatedData = staffSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validatedData.error.errors 
      }, { status: 400 });
    }

    const { fullName, whatsappPhone, email, role } = validatedData.data;

    // 4. Fetch all active divisions to auto-assign all of them to the agent
    const { data: allDivisions } = await supabase.from('divisions').select('id').eq('is_active', true);
    const allDivisionIds = allDivisions?.map((d: any) => d.id) || [];

    // 5. Create auth user securely via Admin API Invite (Sends reset password email)
    const adminClient = createAdminClient();
    
    // Format phone to E.164 if not already
    const formattedPhone = whatsappPhone.startsWith('+') ? whatsappPhone : `+${whatsappPhone}`;
    
    const { data: authData, error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, phone: formattedPhone } // user_metadata
    });

    if (authError) {
      await logError('POST /api/admin/staff (Auth)', authError, { email, phone: formattedPhone, role });
      return NextResponse.json({ error: authError.message || 'Failed to send invite email.' }, { status: 400 });
    }

    // 6. Insert into staff_members table
    const { error: dbError } = await adminClient
      .from('staff_members')
      .insert({
        auth_user_id: authData.user.id,
        full_name: fullName,
        whatsapp_phone: whatsappPhone,
        role: role,
        division_ids: role === USER_ROLES.STAFF ? allDivisionIds : [],
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
