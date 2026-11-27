'use server';

import { createServiceRoleClient } from '../../lib/supabase/server';
import { getVerifiedActiveStaff } from '../../lib/supabase/requireStaff';
import { logError } from '../../lib/logger';
import { revalidatePath } from 'next/cache';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteInquirySafely(inquiryId: string) {
  try {
    if (!UUID_REGEX.test(inquiryId)) {
      return { success: false, error: 'Invalid inquiry ID.' };
    }

    // 1. Verify authenticated, active admin via supabase.auth.getUser() (never getSession())
    const auth = await getVerifiedActiveStaff();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }
    if (auth.context.staff.role !== 'admin') {
      return { success: false, error: 'Forbidden. Admin access required to delete.' };
    }

    const supabaseAdmin = createServiceRoleClient();

    // 2. Fetch attachments BEFORE deleting the row
    const { data: inquiry, error: fetchError } = await supabaseAdmin
      .from('inquiries')
      .select('attachments')
      .eq('id', inquiryId)
      .single();

    if (fetchError || !inquiry) {
      return { success: false, error: 'Inquiry not found.' };
    }

    // 3. Clean up storage files if present
    const attachments = inquiry.attachments as string[] | null;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('inquiry-attachments')
        .remove(attachments);

      if (storageError) {
        await logError('DeleteInquiry Action - Storage Error', storageError, { inquiryId });
      }
    }

    // 4. Delete row (cascades inquiry_events)
    const { error: deleteError } = await supabaseAdmin
      .from('inquiries')
      .delete()
      .eq('id', inquiryId);

    if (deleteError) {
      await logError('DeleteInquiry Action - Database Error', deleteError, { inquiryId });
      return { success: false, error: 'Failed to delete inquiry from database.' };
    }

    revalidatePath('/admin/(dashboard)', 'layout');
    return { success: true };
  } catch (error) {
    await logError('DeleteInquiry Action - Unknown Error', error, { inquiryId });
    return { success: false, error: 'Internal server error during deletion.' };
  }
}

export async function bulkDeleteInquiriesSafely(inquiryIds: string[]) {
  try {
    const auth = await getVerifiedActiveStaff();
    if (!auth.ok) {
      return { success: false, error: auth.error };
    }
    if (auth.context.staff.role !== 'admin') {
      return { success: false, error: 'Forbidden. Admin access required to delete.' };
    }

    if (!Array.isArray(inquiryIds) || inquiryIds.length === 0 || inquiryIds.length > 200) {
      return { success: false, error: 'Provide between 1 and 200 valid inquiry IDs.' };
    }
    if (!inquiryIds.every((id) => typeof id === 'string' && UUID_REGEX.test(id))) {
      return { success: false, error: 'Invalid inquiry ID format.' };
    }

    const supabaseAdmin = createServiceRoleClient();

    const { data: inquiries, error: fetchError } = await supabaseAdmin
      .from('inquiries')
      .select('attachments')
      .in('id', inquiryIds);

    if (fetchError) {
      return { success: false, error: 'Failed to fetch inquiries.' };
    }

    let allAttachments: string[] = [];
    inquiries.forEach((inq) => {
      if (inq.attachments && Array.isArray(inq.attachments)) {
        allAttachments = allAttachments.concat(inq.attachments as string[]);
      }
    });

    if (allAttachments.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('inquiry-attachments')
        .remove(allAttachments);

      if (storageError) {
        await logError('BulkDeleteInquiry Action - Storage Error', storageError, { count: inquiryIds.length });
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('inquiries')
      .delete()
      .in('id', inquiryIds);

    if (deleteError) {
      await logError('BulkDeleteInquiry Action - Database Error', deleteError, { count: inquiryIds.length });
      return { success: false, error: 'Failed to delete inquiries from database.' };
    }

    revalidatePath('/admin/(dashboard)', 'layout');
    return { success: true };
  } catch (error) {
    await logError('BulkDeleteInquiry Action - Unknown Error', error);
    return { success: false, error: 'Internal server error during deletion.' };
  }
}
