import { NextRequest, NextResponse } from 'next/server';
import { uploadRateLimit, isRateLimitConfigured } from '../../../lib/ratelimit';
import { validateFileUpload, verifyFileMagicBytes } from '../../../lib/upload/validateFile';
import { createServiceRoleClient } from '../../../lib/supabase/server';
import { extractTrustedClientIp, isValidDivisionSlug } from '../../../lib/security';
import { extractRequestTelemetry, sendSecurityAlert } from '../../../lib/alertNotifier';

export async function POST(req: NextRequest) {
  const telemetry = extractRequestTelemetry(req.headers);
  const { quotaKey } = extractTrustedClientIp(req.headers);
  try {
    // 1. Rate limiting keyed by trusted edge IP (/64 normalized for IPv6)
    if (isRateLimitConfigured) {
      try {
        const { success } = await uploadRateLimit.limit(quotaKey);
        if (!success) {
          return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
        }
      } catch (e) {
        console.warn('[Rate Limit Warning] Upload route rate limit check failed, failing open', e);
      }
    }

    // 2. Parse incoming FormData and validate inputs strictly
    const formData = await req.formData();
    const file = formData.get('file');
    const divisionSlug = formData.get('divisionSlug');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!isValidDivisionSlug(divisionSlug)) {
      if (typeof divisionSlug === 'string' && (divisionSlug.includes('..') || divisionSlug.includes('/'))) {
        void sendSecurityAlert({
          severity: 'HIGH',
          title: 'Upload Path Traversal Attempt Blocked',
          summary: `Blocked invalid divisionSlug containing path traversal characters.`,
          cooldownKey: `upload_traversal:${quotaKey}`,
          endpoint: 'POST /api/upload',
          reasonCode: 'UPLOAD_PATH_TRAVERSAL',
          probeCategory: 'CMD_OR_PATH_TRAVERSAL',
          probePreview: divisionSlug.slice(0, 80),
          telemetry,
        });
      }
      return NextResponse.json({ error: 'Invalid division slug provided' }, { status: 400 });
    }

    // 3. Validate MIME allowlist and size cap (SVG is excluded)
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      if (file.type === 'image/svg+xml' || file.type === 'text/html') {
        void sendSecurityAlert({
          severity: 'MEDIUM',
          title: 'Disallowed Active-Content Upload Blocked',
          summary: `Blocked upload with disallowed MIME type "${file.type}".`,
          cooldownKey: `upload_mime:${quotaKey}:${file.type}`,
          endpoint: 'POST /api/upload',
          reasonCode: 'DISALLOWED_UPLOAD_MIME',
          probeCategory: 'XSS_PROBE',
          probePreview: `${file.name} (${file.type})`.slice(0, 120),
          telemetry,
        });
      }
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Verify actual binary magic bytes match declared MIME type
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const magicCheck = verifyFileMagicBytes(file.type, buffer);
    if (!magicCheck.valid) {
      void sendSecurityAlert({
        severity: 'HIGH',
        title: 'Spoofed File Signature Blocked',
        summary: `Upload declared MIME "${file.type}" failed binary magic-byte verification.`,
        cooldownKey: `upload_magic:${quotaKey}:${file.type}`,
        endpoint: 'POST /api/upload',
        reasonCode: 'SPOOFED_UPLOAD_MAGIC_BYTES',
        probeCategory: 'XSS_PROBE',
        probePreview: `${file.name} (${file.type})`.slice(0, 120),
        telemetry,
      });
      return NextResponse.json({ error: magicCheck.error || 'Invalid file signature' }, { status: 400 });
    }

    // 5. Generate safe, collision-free, traversal-proof storage path
    const uuid = crypto.randomUUID();
    const safeFilename =
      file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '_')
        .replace(/^\.+/, '')
        .slice(0, 120) || 'attachment';
    const storagePath = `${divisionSlug}/${uuid}-${safeFilename}`;

    // 6. Upload to private inquiry-attachments bucket
    const supabaseAdmin = createServiceRoleClient();
    const { error: uploadError } = await supabaseAdmin.storage
      .from('inquiry-attachments')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
    }

    return NextResponse.json({
      fileId: uuid,
      path: storagePath,
      name: safeFilename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
