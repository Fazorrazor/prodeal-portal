import { NextResponse } from 'next/server';
import { createServer } from '../../../../lib/supabase/server';
import { USER_ROLES } from '../../../../lib/config/roles';
import { logError } from '../../../../lib/logger';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const supabase = createServer() as any;
    
    // 1. Verify caller is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get caller's role to determine what alerts they can see
    const { data: staff } = await supabase
      .from('staff_members')
      .select('role, division_ids')
      .eq('auth_user_id', user.id)
      .single();

    if (!staff) {
       return NextResponse.json({ error: 'Staff profile not found' }, { status: 403 });
    }

    // 3. Fetch unread/new inquiries
    let query = supabase
      .from('inquiries')
      .select(`
        id,
        tracking_uuid,
        contact_name,
        created_at,
        divisions ( display_name )
      `)
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(5);

    // 3. Optional: Filter by division if the caller is an agent
    if (staff.role === USER_ROLES.STAFF && staff.division_ids && staff.division_ids.length > 0) {
      query.in('division_id', staff.division_ids);
    }

    const { data: alerts, error: dbError } = await query;

    if (dbError) throw dbError;

    return NextResponse.json({ alerts: alerts || [] }, { status: 200 });

  } catch (error: any) {
    await logError('POST /api/admin/alerts', error);
    return NextResponse.json({ error: 'Failed to create alert.' }, { status: 500 });
  }
}
