import twilio from 'twilio';
import { buildTwilioMessage, TwilioContext } from './buildMessage';
import { logError } from '../logger';

export async function sendTwilioWhatsAppAlert(phone: string, trackingId: string, divisionName: string, context: TwilioContext) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Twilio environment variables missing. Simulating SMS success for development.');
        return { success: true, messageId: 'simulated_sms_' + Date.now() };
      } else {
        throw new Error('CRITICAL: Twilio environment variables missing in production');
      }
    }

    const client = twilio(accountSid, authToken);
    const { to, body } = buildTwilioMessage(phone, trackingId, divisionName, context);

    // Strip whatsapp: prefix if it was left in the env variable
    const cleanFromPhone = fromPhone.replace('whatsapp:', '');

    const message = await client.messages.create({
      body: body,
      from: cleanFromPhone, // Standard SMS
      to: to                // Standard SMS
    });

    return { 
      success: true, 
      messageId: message.sid 
    };

  } catch (error) {
    await logError('Twilio SMS Send Error', error, { phone, trackingId });
    return { success: false, error: 'Failed to send SMS message via Twilio' };
  }
}
