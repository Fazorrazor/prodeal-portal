import { createAdminClient } from './supabase/admin';
import { redactSensitiveMetadata } from './security';

export async function logError(
  context: string,
  error: unknown,
  metadata: Record<string, unknown> = {}
) {
  const safeMetadata = redactSensitiveMetadata(metadata) as Record<string, unknown>;
  const safeMessage = error instanceof Error ? error.message : String(error);

  console.error(`[API Error] ${context}:`, safeMessage, safeMetadata);

  try {
    const adminClient = createAdminClient();
    await adminClient.from('system_error_logs').insert({
      context,
      error_message: safeMessage.slice(0, 2000),
      error_stack: error instanceof Error ? (error.stack ?? null) : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: safeMetadata as any,
    });
  } catch (dbLogErr) {
    console.warn(
      '[Logger Warning] Failed to write to system_error_logs table. Did you run the SQL migration?',
      dbLogErr
    );
  }
}
