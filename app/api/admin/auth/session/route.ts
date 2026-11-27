import { NextResponse } from 'next/server';
import { getVerifiedActiveStaff } from '../../../../../lib/supabase/requireStaff';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Lightweight session heartbeat for SessionGuard.
 * Immediately returns 401/403 if the session expired or staff was deactivated.
 */
export async function GET() {
  const auth = await getVerifiedActiveStaff();
  if (!auth.ok) {
    return NextResponse.json({ active: false, error: auth.error }, { status: auth.status });
  }
  return NextResponse.json({ active: true, role: auth.context.staff.role }, { status: 200 });
}
