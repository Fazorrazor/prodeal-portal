'use server';

import { createServiceRoleClient } from '../../lib/supabase/server';
import { inquiryRateLimit } from '../../lib/ratelimit';
import { InquirySubmissionSchema, DIVISION_SCHEMAS } from '../../lib/validators/inquiry';
import { headers } from 'next/headers';
import { logError } from '../../lib/logger';
import { sendWhatsAppAlert } from '../../lib/whatsapp/send';

export async function submitInquiry(formData: any) {
  try {
    // 1. Rate Limit Check (Fail-open on timeout to prevent Redis from becoming a bottleneck)
    const ip = headers().get('x-forwarded-for') ?? '127.0.0.1';
    try {
      const { success } = await Promise.race([
        inquiryRateLimit.limit(ip),
        new Promise<{ success: boolean }>((_, reject) => 
          setTimeout(() => reject(new Error('Rate limit timeout')), 800)
        )
      ]);
      
      if (!success) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      }
    } catch (rlError) {
      console.warn('[Rate Limit Warning] Upstash timed out or failed. Failing open to allow business request:', rlError);
      // We continue execution. A temporary Redis outage should not stop business inquiries.
    }

    // 2. Validate overall schema structure
    const parsedData = InquirySubmissionSchema.safeParse(formData);
    if (!parsedData.success) {
      return { success: false, error: 'Invalid form data structure.', details: parsedData.error.errors };
    }

    const { divisionSlug, contact, inquiry, fileIds } = parsedData.data;

    // 3. Validate division-specific payload
    const DivisionSchema = DIVISION_SCHEMAS[divisionSlug as keyof typeof DIVISION_SCHEMAS];
    if (!DivisionSchema) {
       return { success: false, error: 'Invalid division selected.' };
    }

    const parsedInquiry = DivisionSchema.safeParse(inquiry);
    if (!parsedInquiry.success) {
      return { success: false, error: 'Invalid division specific data.', details: parsedInquiry.error.errors };
    }

    const supabase = createServiceRoleClient() as any;

    // 4. Get the division ID (use simple memory cache to avoid sequential DB round-trip)
    let divisionId = (global as any).divisionCache?.[divisionSlug];
    
    if (!divisionId) {
      const { data: divisionRecord, error: divisionError } = await supabase
        .from('divisions')
        .select('id')
        .eq('slug', divisionSlug)
        .single();

      if (divisionError || !divisionRecord) {
        return { success: false, error: 'Division not found in database.' };
      }
      
      divisionId = divisionRecord.id;
      if (!(global as any).divisionCache) (global as any).divisionCache = {};
      (global as any).divisionCache[divisionSlug] = divisionId;
    }

    // 5. Find an active staff member for auto-assignment
    const { data: staffMembers, error: staffError } = await supabase
      .from('staff_members')
      .select('id, whatsapp_phone')
      .eq('division_id', divisionId)
      .eq('is_active', true);

    if (staffError) {
      await logError('SubmitInquiry Action - Staff Lookup Error', staffError, { divisionId });
    }

    // Pick a random active staff member if available (simple load balancing)
    let assignedStaff = null;
    let staffPhone = null;
    if (staffMembers && staffMembers.length > 0) {
      const randomIndex = Math.floor(Math.random() * staffMembers.length);
      assignedStaff = staffMembers[randomIndex].id;
      staffPhone = staffMembers[randomIndex].whatsapp_phone;
    }

    // 6. Insert into inquiries table
    const { data: newInquiry, error: insertError } = await supabase
      .from('inquiries')
      .insert({
        division_id: divisionId,
        assigned_staff: assignedStaff,
        contact_name: contact.name,
        contact_email: contact.email,
        contact_phone: contact.phone,
        company_name: contact.companyName || null,
        inquiry_payload: parsedInquiry.data,
        attachments: fileIds,
        status: 'new'
      })
      .select('id, tracking_uuid, divisions(display_name)')
      .single();

    if (insertError || !newInquiry) {
      await logError('SubmitInquiry Action - Insert Error', insertError, { formData });
      return { success: false, error: 'Failed to save inquiry to database.' };
    }

    // 7. Enforce RULE 4: Trigger WhatsApp API
    if (staffPhone) {
      const divisionName = Array.isArray(newInquiry.divisions) 
        ? newInquiry.divisions[0]?.display_name 
        : (newInquiry.divisions as any)?.display_name || divisionSlug;

      const waResult = await sendWhatsAppAlert(staffPhone, newInquiry.tracking_uuid, divisionName);

      if (!waResult.success) {
        // Rollback the database write if WA fails (Strict Rule 4 compliance)
        await supabase.from('inquiries').delete().eq('id', newInquiry.id);
        return { success: false, error: 'Failed to notify agent. Inquiry was not submitted.' };
      }

      // Update the inquiry with the WA message ID
      await supabase
        .from('inquiries')
        .update({ 
          wa_message_id: waResult.messageId, 
          wa_sent_at: new Date().toISOString() 
        })
        .eq('id', newInquiry.id);
    } else {
      // If no staff is available, we log a warning but the business decides if it should fail.
      // Based on B2B norms, we accept the ticket but flag it as unassigned.
      console.warn(`[WARN] Inquiry ${newInquiry.tracking_uuid} submitted but no active staff found for division.`);
    }

    // 8. Return success with tracking ID
    return { success: true, trackingId: newInquiry.tracking_uuid };

  } catch (error) {
    await logError('SubmitInquiry Action - Unknown Error', error, { formData });
    return { success: false, error: 'Internal server error.' };
  }
}
