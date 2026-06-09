import { expect, test } from 'vitest';
import { validateFileUpload } from '../lib/upload/validateFile';

test('validateFileUpload rejects files over 10MB', () => {
  // Mock a File object larger than 10MB (11MB)
  const largeFile = new File([''], 'huge.jpg', { type: 'image/jpeg' });
  Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

  const result = validateFileUpload(largeFile);
  
  expect(result.valid).toBe(false);
  expect(result.error).toContain('10MB limit');
});

test('validateFileUpload accepts valid files under 10MB', () => {
  const validFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
  Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 });

  const result = validateFileUpload(validFile);
  
  expect(result.valid).toBe(true);
});
