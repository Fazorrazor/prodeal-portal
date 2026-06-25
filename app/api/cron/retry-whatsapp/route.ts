import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '../../../../lib/supabase/server';
import { sendWhatsAppAlert } from '../../../../lib/whatsapp/send';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Authenticate the cron request (Vercel automatic header)
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  try {
    // 2. Find inquiries that need retrying
    // Max 5 retries to prevent endless loops & Meta API bans
    const { data: failedInquiries, error: fetchError } = await supabase
      .from('inquiries')
      .select('id, tracking_uuid, division_id, assigned_staff, inquiry_payload, divisions(display_name), wa_retry_count')
      .in('wa_status', ['pending', 'failed'])
      .lt('wa_retry_count', 5)
      .order('created_at', { ascending: true })
      .limit(20); // Process in small batches

    if (fetchError) {
      console.error('[CRON Error] Failed to fetch failed inquiries:', fetchError);
      return NextResponse.json({ error: 'Database fetch error' }, { status: 500 });
    }

    if (!failedInquiries || failedInquiries.length === 0) {
      return NextResponse.json({ message: 'No failed inquiries to retry.' });
    }

    const results = [];

    // 3. Process each failed inquiry
    for (const inquiry of failedInquiries) {
      let staffPhone = null;
      let assignedStaffId = inquiry.assigned_staff;

      // If it failed because it had no assigned staff, try to assign one now!
      if (!assignedStaffId) {
        const { data: staffMembers } = await supabase
          .from('staff_members')
          .select('id, whatsapp_phone, division_ids')
          .eq('is_active', true);

        const availableStaff = staffMembers?.filter(s => s.division_ids?.includes(inquiry.division_id));

        if (availableStaff && availableStaff.length > 0) {
          // Find the one with the fewest open tickets (simple round-robin proxy for now, or just pick the first)
          const selectedStaff = availableStaff[0];
          assignedStaffId = selectedStaff.id;
          staffPhone = selectedStaff.whatsapp_phone;

          // Update the database with the new assignment
          await supabase
            .from('inquiries')
            .update({ assigned_staff: assignedStaffId })
            .eq('id', inquiry.id);
        }
      } else {
        // If it was assigned, fetch the staff phone number
        const { data: staff } = await supabase
          .from('staff_members')
          .select('whatsapp_phone')
          .eq('id', assignedStaffId)
          .single();
        
        if (staff) {
          staffPhone = staff.whatsapp_phone;
        }
      }

      // If we STILL don't have a staff member, skip it and increment retry count
      if (!staffPhone) {
        await supabase
          .from('inquiries')
          .update({ 
            wa_retry_count: (inquiry.wa_retry_count || 0) + 1,
            internal_notes: '[CRON] Still no active staff available for division.'
          })
          .eq('id', inquiry.id);
        results.push({ id: inquiry.id, status: 'skipped_no_staff' });
        continue;
      }

      const divisionName = (inquiry.divisions as any)?.display_name || 'Unknown Division';
      const waContext = {
        divisionSlug: '', // not strictly needed for formatting if divisionName is passed, unless buildMessage uses it.
        inquiryData: inquiry.inquiry_payload as any,
        attachmentCount: 0 // Simplification for retry
      };

      // Attempt to resend
      const waResult = await sendWhatsAppAlert(staffPhone, inquiry.tracking_uuid, divisionName, waContext);

      if (waResult.success) {
        // Success: update status and message ID
        await supabase
          .from('inquiries')
          .update({ 
            wa_status: 'sent',
            wa_message_id: waResult.messageId,
            wa_sent_at: new Date().toISOString()
          })
          .eq('id', inquiry.id);
        
        results.push({ id: inquiry.id, status: 'sent' });
      } else {
        // Failed again: increment retry count
        const newRetryCount = (inquiry.wa_retry_count || 0) + 1;
        await supabase
          .from('inquiries')
          .update({ 
            wa_retry_count: newRetryCount,
            internal_notes: `[CRON] Retry ${newRetryCount} failed: ${waResult.error}`
          })
          .eq('id', inquiry.id);
        
        results.push({ id: inquiry.id, status: 'failed_again', error: waResult.error });
      }
    }

    return NextResponse.json({ message: 'Processed batch', results });
  } catch (err: any) {
    console.error('[CRON Exception]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
