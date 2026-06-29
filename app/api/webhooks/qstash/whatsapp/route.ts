import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppAlert } from '../../../../../lib/whatsapp/send';
import { createServiceRoleClient } from '../../../../../lib/supabase/server';

export const maxDuration = 60; // Allow function to run longer if WhatsApp API is slow
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, trackingId, divisionName, waContext, inquiryId } = body;

    if (!phone || !trackingId || !divisionName || !inquiryId) {
      return NextResponse.json({ success: false, error: 'Missing required payload parameters' }, { status: 400 });
    }

    // Call the WhatsApp API
    const waResult = await sendWhatsAppAlert(phone, trackingId, divisionName, waContext);
    const supabase = createServiceRoleClient();

    if (!waResult.success) {
      // Update inquiry status on failure
      await supabase
        .from('inquiries')
        .update({ 
          wa_status: 'failed',
          wa_retry_count: 1, // Assume 1 for now, a better cron can handle retries later
          internal_notes: `[SYSTEM_WARNING] WhatsApp notification failed to send via QStash: ${waResult.error || 'Unknown error'}` 
        })
        .eq('id', inquiryId);

      // Return a 500 so QStash knows to automatically retry this request later!
      return NextResponse.json({ success: false, error: waResult.error }, { status: 500 });
    }

    // On Success: Update database
    await supabase
      .from('inquiries')
      .update({ 
        wa_message_id: waResult.messageId, 
        wa_sent_at: new Date().toISOString(),
        wa_status: 'sent'
      })
      .eq('id', inquiryId);

    return NextResponse.json({ success: true, messageId: waResult.messageId });
  } catch (error: any) {
    console.error('QStash WhatsApp Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Remove the top-level call and do a dynamic import at runtime
export const POST = async (req: NextRequest) => {
  // Import verifySignatureAppRouter at runtime to avoid requiring env vars during build
  const { verifySignatureAppRouter } = await import('@upstash/qstash/dist/nextjs');

  // Wrap the handler with the verifier and call it with the incoming request
  const wrapped = verifySignatureAppRouter(handler);
  return wrapped(req);
};
