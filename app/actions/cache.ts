'use server';

import { revalidatePath } from 'next/cache';
import { getVerifiedActiveStaff } from '../../lib/supabase/requireStaff';

export async function clearPlatformCache() {
  const auth = await getVerifiedActiveStaff();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  if (auth.context.staff.role !== 'admin') {
    return { success: false, error: 'Forbidden' };
  }

  try {
    revalidatePath('/', 'layout');
    revalidatePath('/divisions/[slug]', 'page');
    revalidatePath('/admin', 'layout');

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear cache.',
    };
  }
}
