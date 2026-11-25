import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '../../../../../lib/logger';
import { adminRateLimit, isRateLimitConfigured } from '../../../../../lib/ratelimit';
import { extractTrustedClientIp } from '../../../../../lib/security';
import { getVerifiedActiveStaff } from '../../../../../lib/supabase/requireStaff';

const StatusUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'quoted', 'closed']),
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    if (!UUID_REGEX.test(params.id)) {
      return NextResponse.json({ error: 'Invalid inquiry ID' }, { status: 400 });
    }

    // 0. Rate limiting keyed by trusted edge IP
    if (isRateLimitConfigured) {
      try {
        const { quotaKey } = extractTrustedClientIp(request.headers);
        const { success } = await adminRateLimit.limit(quotaKey);
        if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      } catch (e) {
        console.warn('[Rate Limit Warning] Admin route rate limit check failed', e);
      }
    }

    // 1. Verify authenticated AND active staff member
    const auth = await getVerifiedActiveStaff();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user, supabase } = auth.context;

    // 2. Validate request body
    const body = await request.json();
    const validatedData = StatusUpdateSchema.parse(body);

    // 3. Update the inquiry status (RLS enforces division boundary)
    const { data: inquiry, error: updateError } = await supabase
      .from('inquiries')
      .update({ status: validatedData.status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, status')
      .single();

    if (updateError) throw updateError;

    // 4. Log the event
    const { error: eventError } = await supabase.from('inquiry_events').insert({
      inquiry_id: params.id,
      actor_id: user.id,
      event_type: 'status_changed',
      payload: { new_status: validatedData.status },
    });

    if (eventError) await logError('Failed to log inquiry event', eventError, { inquiryId: params.id });

    return NextResponse.json({ success: true, status: inquiry.status });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    await logError(`PATCH /api/admin/inquiries/${params.id}`, error);
    return NextResponse.json({ error: 'Failed to update inquiry status. Please try again.' }, { status: 500 });
  }
}
