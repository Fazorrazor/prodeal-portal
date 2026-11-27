'use server';

import { revalidatePath } from 'next/cache';
import { getVerifiedActiveStaff } from '../../lib/supabase/requireStaff';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteSupportTicket(ticketId: string) {
  if (!UUID_REGEX.test(ticketId)) {
    return { success: false, error: 'Invalid ticket ID.' };
  }

  const auth = await getVerifiedActiveStaff();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }
  if (auth.context.staff.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admins only.' };
  }

  const { error } = await auth.context.supabase
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
