import { buildWhatsAppMessage } from './buildMessage';
import { logError } from '../logger';

export async function sendWhatsAppAlert(phone: string, trackingId: string, divisionName: string) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      console.warn('WhatsApp environment variables missing. Simulating success for development.');
      // In dev, if keys are missing, we pretend it worked so we don't break the flow
      return { success: true, messageId: 'simulated_wa_' + Date.now() };
    }

    const payload = buildWhatsAppMessage(phone, trackingId, divisionName);

    const res = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'WhatsApp API Error');
    }

    return { 
      success: true, 
      messageId: data.messages?.[0]?.id 
    };

  } catch (error) {
    await logError('WhatsApp Send Error', error, { phone, trackingId });
    return { success: false, error: 'Failed to send WhatsApp message' };
  }
}
