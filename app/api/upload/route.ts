import { NextRequest, NextResponse } from 'next/server';
import { uploadRateLimit } from '../../../lib/ratelimit';
import { validateFileUpload } from '../../../lib/upload/validateFile';
import { createServiceRoleClient } from '../../../lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // a. Extract the client IP from the request headers
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';

    // b. Check the uploadRateLimit from lib/ratelimit.ts
    try {
      const { success } = await uploadRateLimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
      }
    } catch (e) {
      console.warn('[Rate Limit Warning] Upload route rate limit check failed, failing open', e);
    }

    // c. Parse the incoming FormData and extract the file
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const divisionSlug = formData.get('divisionSlug') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!divisionSlug) {
      return NextResponse.json({ error: 'No division slug provided' }, { status: 400 });
    }

    // d. Run validateFileUpload(file). Return HTTP 400 with the error message if invalid.
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Convert file to buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // e. Generate a unique storage path: {divisionSlug}/{uuid}-{filename}
    const uuid = crypto.randomUUID();
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // sanitize filename
    const storagePath = `${divisionSlug}/${uuid}-${filename}`;

    // f. Upload to the inquiry-attachments bucket in Supabase Storage using the service role client
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

    // g. Return { fileId: uuid, path: storagePath, name: filename, size: bytes, mimeType: type }
    return NextResponse.json({
      fileId: uuid,
      path: storagePath,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    });
    
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
