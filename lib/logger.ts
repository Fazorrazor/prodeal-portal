import { createAdminClient } from './supabase/admin';

export async function logError(context: string, error: unknown, metadata: Record<string, unknown> = {}) {
  // Always log to the console for Vercel/local debugging
  console.error(`[API Error] ${context}:`, error, metadata);

  try {
    // Attempt to persist the error to the database using the admin client
    // so it bypasses RLS and always writes if the table exists.
    const adminClient = createAdminClient();
    await adminClient.from('system_error_logs').insert({
      context,
      error_message: error instanceof Error ? error.message : String(error),
      error_stack: error instanceof Error ? error.stack : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: metadata as any
    });
  } catch (dbLogErr) {
    // Fail silently if the table doesn't exist yet, but warn the developer
    console.warn('[Logger Warning] Failed to write to system_error_logs table. Did you run the SQL migration?', dbLogErr);
  }
}
