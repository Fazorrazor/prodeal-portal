'use server';

import { createServer, createServiceRoleClient } from '../../lib/supabase/server';
import { logError } from '../../lib/logger';
import { revalidatePath } from 'next/cache';

export async function deleteInquirySafely(inquiryId: string) {
  try {
    // 1. Verify the caller is an authenticated user
    // Even though middleware protects /admin routes, it is a hard requirement 
    // to verify auth in Server Actions that destroy data.
    const supabaseUser = createServer();
    const { data: { session } } = await supabaseUser.auth.getSession();
    
    if (!session?.user) {
      return { success: false, error: 'Unauthorized.' };
    }

    // 2. Initialize the Service Role Client to bypass RLS (since there is no DELETE policy)
    const supabaseAdmin = createServiceRoleClient();

    // 3. Verify admin role (matches your RLS get_user_role() logic)
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from('staff_members')
      .select('role')
      .eq('auth_user_id', session.user.id)
      .single();

    if (staffError || staffData?.role !== 'admin') {
      return { success: false, error: 'Forbidden. Admin access required to delete.' };
    }

    // 4. Fetch the inquiry to check for attachments BEFORE we delete the row
    const { data: inquiry, error: fetchError } = await supabaseAdmin
      .from('inquiries')
      .select('attachments')
      .eq('id', inquiryId)
      .single();

    if (fetchError || !inquiry) {
      return { success: false, error: 'Inquiry not found.' };
    }

    // 5. Clean up storage files if they exist (prevents orphaned artwork)
    const attachments = inquiry.attachments as string[] | null;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const { error: storageError } = await supabaseAdmin
        .storage
        .from('inquiry-attachments')
        .remove(attachments);
        
      if (storageError) {
        // Log it but continue to delete the row anyway
        await logError('DeleteInquiry Action - Storage Error', storageError, { inquiryId, attachments });
      }
    }

    // 6. Safely delete the row
    // Related inquiry_events will be deleted automatically via ON DELETE CASCADE
    const { error: deleteError } = await supabaseAdmin
      .from('inquiries')
      .delete()
      .eq('id', inquiryId);

    if (deleteError) {
       await logError('DeleteInquiry Action - Database Error', deleteError, { inquiryId });
       return { success: false, error: 'Failed to delete inquiry from database.' };
    }

    // 7. Purge the cache so the Admin UI updates instantly
    revalidatePath('/admin/(dashboard)', 'layout');
    
    return { success: true };
    
  } catch (error) {
    await logError('DeleteInquiry Action - Unknown Error', error, { inquiryId });
    return { success: false, error: 'Internal server error during deletion.' };
  }
}
