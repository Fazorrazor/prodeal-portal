'use server';

import { revalidatePath } from 'next/cache';
import { createServer } from '../../lib/supabase/server';

export async function clearPlatformCache() {
  const supabase = createServer() as any;
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: staff } = await supabase
    .from('staff_members')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (staff?.role !== 'admin') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    // Revalidate all major paths
    revalidatePath('/', 'layout');
    revalidatePath('/divisions/[slug]', 'page');
    revalidatePath('/admin', 'layout');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
