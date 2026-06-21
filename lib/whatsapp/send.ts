import { buildWhatsAppMessage, WhatsAppContext } from './buildMessage';
import { logError } from '../logger';

export async function sendWhatsAppAlert(phone: string, trackingId: string, divisionName: string, context: WhatsAppContext) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('WhatsApp environment variables missing. Simulating success for development.');
        return { success: true, messageId: 'simulated_wa_' + Date.now() };
      } else {
        throw new Error('CRITICAL: WhatsApp environment variables missing in production');
      }
    }

    const payload = buildWhatsAppMessage(phone, trackingId, divisionName, context);

    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
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
