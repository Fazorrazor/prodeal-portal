const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/illustrator',
  'application/postscript',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not allowed.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` };
  }
  return { valid: true };
}
