import twilio from 'twilio';
import { buildTwilioMessage, TwilioContext } from './buildMessage';
import { logError } from '../logger';

export async function sendTwilioWhatsAppAlert(phone: string, trackingId: string, divisionName: string, context: TwilioContext) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Twilio environment variables missing. Simulating success for development.');
        return { success: true, messageId: 'simulated_tw_' + Date.now() };
      } else {
        throw new Error('CRITICAL: Twilio environment variables missing in production');
      }
    }

    const client = twilio(accountSid, authToken);
    const { to, body } = buildTwilioMessage(phone, trackingId, divisionName, context);

    const message = await client.messages.create({
      body: body,
      from: fromPhone.startsWith('whatsapp:') ? fromPhone : `whatsapp:${fromPhone}`,
      to: to
    });

    return { 
      success: true, 
      messageId: message.sid 
    };

  } catch (error) {
    await logError('Twilio Send Error', error, { phone, trackingId });
    return { success: false, error: 'Failed to send WhatsApp message via Twilio' };
  }
}
