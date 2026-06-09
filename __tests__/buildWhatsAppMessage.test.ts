import { expect, test } from 'vitest';
import { buildWhatsAppMessage } from '../lib/whatsapp/buildMessage';

test('buildWhatsAppMessage strips non-numeric characters from phone and sets correct product', () => {
  const result = buildWhatsAppMessage('+233 54 123 4567', 'ABC-123', 'Chemicals');
  
  expect(result.messaging_product).toBe('whatsapp');
  expect(result.to).toBe('233541234567');
  expect(result.template.name).toBe('new_inquiry_alert');
});
