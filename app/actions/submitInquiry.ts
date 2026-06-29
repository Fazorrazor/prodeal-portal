'use server';

import { createServiceRoleClient } from '../../lib/supabase/server';
import { inquiryRateLimit } from '../../lib/ratelimit';
import { InquirySubmissionSchema, DIVISION_SCHEMAS } from '../../lib/validators/inquiry';
import { headers } from 'next/headers';
import { logError } from '../../lib/logger';
import { sendWhatsAppAlert } from '../../lib/whatsapp/send';
import { sendTwilioWhatsAppAlert } from '../../lib/twilio/send';

export async function submitInquiry(formData: any) {
  try {
    // 1. Rate Limit Check (Fail-open on timeout to prevent Redis from becoming a bottleneck)
    const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';
    const reqDivisionSlug = formData?.divisionSlug || 'unknown';
    const limitKey = `${ip}:${reqDivisionSlug}`;

    try {
      const { success } = await Promise.race([
        inquiryRateLimit.limit(limitKey),
        new Promise<{ success: boolean }>((_, reject) => 
          setTimeout(() => reject(new Error('Rate limit timeout')), 800)
        )
      ]);
      
      if (!success) {
        return { 
          success: false, 
          error: "You've submitted multiple requests for this service recently. Please wait a little while, or contact our priority line." 
        };
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

    // 2.5. Honeypot check for bots
    if (contact.botcheck) {
      console.warn(`[Spam Blocked] Bot honeypot triggered by IP: ${ip}`);
      // Return a simulated success to trick the bot into thinking it worked
      return { success: true, trackingId: crypto.randomUUID(), assignedPhone: null };
    }

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

    // 5. Find an active staff member for assignment (Load Balancing)
    const { data: staffMembers, error: staffError } = await supabase
      .from('staff_members')
      .select('id, whatsapp_phone')
      .contains('division_ids', [divisionId])
      .eq('is_active', true);

    if (staffError) {
      await logError('SubmitInquiry Action - Staff Lookup Error', staffError, { divisionId });
    }

    let assignedStaff = null;
    let staffPhone = null;
    
    if (staffMembers && staffMembers.length > 0) {
      const staffIds = staffMembers.map((s: any) => s.id);
      
      // Calculate current workload (open tickets) for each active staff member
      const { data: workloadData, error: workloadError } = await supabase
        .from('inquiries')
        .select('assigned_staff')
        .in('assigned_staff', staffIds)
        .in('status', ['new', 'in_progress']);

      const workloads = staffMembers.reduce((acc: Record<string, number>, staff: any) => {
        acc[staff.id] = 0;
        return acc;
      }, {});

      if (!workloadError && workloadData) {
        workloadData.forEach((w: any) => {
          if (w.assigned_staff in workloads) {
            workloads[w.assigned_staff]++;
          }
        });
      }

      // Pick the staff member with the lowest number of open tickets
      let minWorkload = Infinity;
      let selectedStaff = staffMembers[0];

      staffMembers.forEach((staff: any) => {
        if (workloads[staff.id] < minWorkload) {
          minWorkload = workloads[staff.id];
          selectedStaff = staff;
        }
      });

      assignedStaff = selectedStaff.id;
      staffPhone = selectedStaff.whatsapp_phone;
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

      const waContext = {
        divisionSlug,
        inquiryData: parsedInquiry.data,
        attachmentCount: fileIds ? fileIds.length : 0
      };

      // Push to QStash Background Queue
      try {
        const { Client } = await import('@upstash/qstash');
        const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
        
        // Vercel automatically provides VERCEL_URL. If missing, fallback to localhost.
        const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
          : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        await qstash.publishJSON({
          url: `${baseUrl}/api/webhooks/qstash/whatsapp`,
          body: {
            phone: staffPhone,
            trackingId: newInquiry.tracking_uuid,
            divisionName,
            waContext,
            inquiryId: newInquiry.id
          },
        });
        
        // Pre-emptively update status to pending since it's now in the queue
        await supabase
          .from('inquiries')
          .update({ wa_status: 'pending' })
          .eq('id', newInquiry.id);
          
      } catch (qError: any) {
        console.error('[QStash Publish Error]', qError);
        await supabase
          .from('inquiries')
          .update({ 
            wa_status: 'failed',
            internal_notes: `[SYSTEM_WARNING] Failed to publish WhatsApp job to QStash: ${qError.message}` 
          })
          .eq('id', newInquiry.id);
      }
    } else {
      // If no staff is available, we log a warning but the business decides if it should fail.
      // Based on B2B norms, we accept the ticket but flag it as unassigned.
      console.warn(`[WARN] Inquiry ${newInquiry.tracking_uuid} submitted but no active staff found for division.`);
    }

    // 8. Return success with tracking ID and assigned staff phone
    return { success: true, trackingId: newInquiry.tracking_uuid, assignedPhone: staffPhone };

  } catch (error) {
    await logError('SubmitInquiry Action - Unknown Error', error, { formData });
    return { success: false, error: 'Internal server error.' };
  }
}
