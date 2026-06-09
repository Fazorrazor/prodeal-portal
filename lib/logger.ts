import { createAdminClient } from './supabase/admin';

export async function logError(context: string, error: any, metadata: any = {}) {
  // Always log to the console for Vercel/local debugging
  console.error(`[API Error] ${context}:`, error, metadata);

  try {
    // Attempt to persist the error to the database using the admin client
    // so it bypasses RLS and always writes if the table exists.
    const adminClient = createAdminClient();
    await adminClient.from('system_error_logs' as any).insert({
      context,
      error_message: error?.message || String(error),
      error_stack: error?.stack || null,
      metadata
    });
  } catch (dbLogErr) {
    // Fail silently if the table doesn't exist yet, but warn the developer
    console.warn('[Logger Warning] Failed to write to system_error_logs table. Did you run the SQL migration?', dbLogErr);
  }
}
