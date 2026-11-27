import { getVerifiedActiveStaff } from '../../lib/supabase/requireStaff';
import { redirect } from 'next/navigation';

export async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const auth = await getVerifiedActiveStaff();

  if (!auth.ok) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
