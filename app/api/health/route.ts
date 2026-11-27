import { NextResponse } from 'next/server';
import { evaluateHealthChecks } from '@/lib/health';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function pingSupabase(): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin
    .from('divisions')
    .select('id', { head: true, count: 'exact' })
    .limit(1);
  return !error;
}

export async function GET() {
  const result = await evaluateHealthChecks({
    pingDatabase: pingSupabase,
    timeoutMs: 3000,
  });

  return NextResponse.json(result.body, {
    status: result.statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
