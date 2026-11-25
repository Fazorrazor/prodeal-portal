import { NextResponse } from 'next/server';
import { USER_ROLES } from '../../../../lib/config/roles';
import { logError } from '../../../../lib/logger';
import { adminRateLimit, isRateLimitConfigured } from '../../../../lib/ratelimit';
import { extractTrustedClientIp } from '../../../../lib/security';
import { getVerifiedActiveStaff } from '../../../../lib/supabase/requireStaff';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
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

    // 1. Verify caller is authenticated AND active in staff_members
    const auth = await getVerifiedActiveStaff();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { staff, supabase } = auth.context;

    // 2. Fetch unread/new inquiries scoped by role/division
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

    if (staff.role === USER_ROLES.STAFF && staff.division_ids && staff.division_ids.length > 0) {
      query = query.in('division_id', staff.division_ids);
    }

    const { data: alerts, error: dbError } = await query;
    if (dbError) throw dbError;

    return NextResponse.json({ alerts: alerts || [] }, { status: 200 });
  } catch (error: unknown) {
    await logError('GET /api/admin/alerts', error);
    return NextResponse.json({ error: 'Failed to load alerts.' }, { status: 500 });
  }
}
