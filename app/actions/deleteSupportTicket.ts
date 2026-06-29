'use server';

import { createServer } from '../../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteSupportTicket(ticketId: string) {
  const supabase = await createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify admin status
  const { data: staff } = await supabase
    .from('staff_members')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (staff?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  const { error } = await supabase
    .from('support_tickets')
    .delete()
    .eq('id', ticketId);

  if (error) {
    console.error('Failed to delete support ticket:', error);
    return { success: false, error: 'Failed to delete complaint.' };
  }

  revalidatePath('/admin/complaints');
  return { success: true };
}
