import 'server-only';
import { createServer } from './server';

export interface VerifiedStaffContext {
  user: { id: string; email?: string };
  staff: {
    id: string;
    role: string;
    division_ids: string[] | null;
    is_active: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
}

/**
 * Single authoritative server-side auth + active-staff verification boundary.
 * Always validates the JWT via supabase.auth.getUser() (never getSession())
 * and rejects deactivated staff (is_active !== true).
 */
export async function getVerifiedActiveStaff(): Promise<
  | { ok: true; context: VerifiedStaffContext }
  | { ok: false; status: 401 | 403; error: string }
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServer()) as any;
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const { data: staff, error: staffError } = await supabase
    .from('staff_members')
    .select('id, role, division_ids, is_active')
    .eq('auth_user_id', user.id)
    .single();

  if (staffError || !staff || staff.is_active !== true) {
    return { ok: false, status: 403, error: 'Account inactive or staff profile not found' };
  }

  return {
    ok: true,
    context: { user, staff, supabase },
  };
}
