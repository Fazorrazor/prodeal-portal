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

    // SECURITY: File Content Verification
    if (file.type === 'image/svg+xml') {
      const content = buffer.toString('utf-8').toLowerCase();
      if (content.includes('<script') || content.includes('javascript:') || content.includes('onload=')) {
        return NextResponse.json({ error: 'Malicious content detected in SVG' }, { status: 400 });
      }
    } else if (file.type === 'image/jpeg') {
      // Magic bytes: FF D8 FF
      if (buffer.length < 3 || buffer[0] !== 0xFF || buffer[1] !== 0xD8 || buffer[2] !== 0xFF) {
        return NextResponse.json({ error: 'Invalid JPEG file signature' }, { status: 400 });
      }
    } else if (file.type === 'image/png') {
      // Magic bytes: 89 50 4E 47 0D 0A 1A 0A
      const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
      if (buffer.length < 8 || !pngSignature.every((byte, i) => buffer[i] === byte)) {
        return NextResponse.json({ error: 'Invalid PNG file signature' }, { status: 400 });
      }
    } else if (file.type === 'application/pdf') {
      // Magic bytes: %PDF- (25 50 44 46 2D)
      if (buffer.length < 5 || buffer.toString('utf-8', 0, 5) !== '%PDF-') {
        return NextResponse.json({ error: 'Invalid PDF file signature' }, { status: 400 });
      }
    }

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
