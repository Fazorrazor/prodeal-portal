import { createServiceRoleClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { trackRateLimit } from '../../../../lib/ratelimit';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const trackingId = params.id;
    
    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    try {
      const { success } = await trackRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
    } catch (e) {
      console.warn('[Rate Limit Warning] Tracking route rate limit check failed', e);
    }

    const supabase = createServiceRoleClient();

    // Fetch the inquiry using tracking_uuid.
    // Intentionally omit sensitive internal data like notes and staff.
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select('id, status, division_id, created_at, updated_at')
      .eq('tracking_uuid', trackingId)
      .single();

    if (error || !inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry }, { status: 200 });

  } catch (error) {
    console.error('Error fetching inquiry status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
