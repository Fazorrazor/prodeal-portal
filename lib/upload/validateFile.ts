/**
 * Strictly allowlisted upload MIME types.
 * SVG (image/svg+xml) is intentionally excluded to prevent stored XSS vectors.
 */
export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/illustrator',
  'application/postscript',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed.` };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'Empty files cannot be uploaded.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  return { valid: true };
}

/**
 * Verifies binary magic bytes match the declared MIME type to block polyglot/spoofed uploads.
 */
export function verifyFileMagicBytes(mimeType: string, buffer: Buffer): { valid: boolean; error?: string } {
  if (mimeType === 'image/jpeg') {
    const ok = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    return ok ? { valid: true } : { valid: false, error: 'Invalid JPEG file signature.' };
  }
  if (mimeType === 'image/png') {
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    const ok = buffer.length >= 8 && sig.every((b, i) => buffer[i] === b);
    return ok ? { valid: true } : { valid: false, error: 'Invalid PNG file signature.' };
  }
  if (mimeType === 'image/webp') {
    const ok =
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';
    return ok ? { valid: true } : { valid: false, error: 'Invalid WebP file signature.' };
  }
  if (mimeType === 'application/pdf') {
    const ok = buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-';
    return ok ? { valid: true } : { valid: false, error: 'Invalid PDF file signature.' };
  }
  if (mimeType === 'application/postscript' || mimeType === 'application/illustrator') {
    const head4 = buffer.length >= 4 ? buffer.toString('ascii', 0, 4) : '';
    const head5 = buffer.length >= 5 ? buffer.toString('ascii', 0, 5) : '';
    const ok = head4 === '%!PS' || head5 === '%PDF-';
    return ok ? { valid: true } : { valid: false, error: 'Invalid PostScript/Illustrator file signature.' };
  }
  if (mimeType === 'application/vnd.ms-excel') {
    const sig = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
    const ok = buffer.length >= 8 && sig.every((b, i) => buffer[i] === b);
    return ok ? { valid: true } : { valid: false, error: 'Invalid Excel (.xls) file signature.' };
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    const ok = buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
    return ok ? { valid: true } : { valid: false, error: 'Invalid Excel (.xlsx) file signature.' };
  }
  return { valid: false, error: `Unsupported MIME type "${mimeType}".` };
}
