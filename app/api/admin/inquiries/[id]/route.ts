import { NextResponse } from 'next/server';
import { createServer } from '../../../../../lib/supabase/server';
import { z } from 'zod';
import { logError } from '../../../../../lib/logger';

const StatusUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'quoted', 'closed']),
});

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createServer() as any;
    
    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate request body
    const body = await request.json();
    const validatedData = StatusUpdateSchema.parse(body);

    // 3. Update the inquiry status
    const { data: inquiry, error: updateError } = await supabase
      .from('inquiries')
      .update({ status: validatedData.status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, status')
      .single();

    if (updateError) throw updateError;

    // 4. Log the event
    const { error: eventError } = await supabase
      .from('inquiry_events')
      .insert({
        inquiry_id: params.id,
        actor_id: user.id,
        event_type: 'status_changed',
        payload: { new_status: validatedData.status }
      });

    if (eventError) await logError('Failed to log inquiry event', eventError, { inquiryId: params.id });

    return NextResponse.json({ success: true, status: inquiry.status });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    await logError(`PATCH /api/admin/inquiries/${params.id}`, error);
    return NextResponse.json({ error: 'Failed to update inquiry status. Please try again.' }, { status: 500 });
  }
}
