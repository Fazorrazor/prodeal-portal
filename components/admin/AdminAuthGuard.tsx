import { createServer } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';

export async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createServer();
  
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
