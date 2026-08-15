export interface TwilioContext {
  divisionSlug: string;
  attachmentCount: number;
  inquiryData: {
    signType?: string;
    width?: string | number;
    height?: string | number;
    materialPreference?: string;
    quantity?: string | number;
    productType?: string;
    artworkReady?: boolean;
    sku?: string;
    deliveryAddress?: string;
    intendedUse?: string;
    casNumber?: string;
    grade?: string;
    [key: string]: unknown;
  };
}

export function buildTwilioMessage(toPhone: string, trackingId: string, divisionName: string, context: TwilioContext) {
  const messageText = `🚨 New ${divisionName} Inquiry!
ID: ${trackingId}

View details & claim ticket:
https://prodealindustries.com/admin`;

  let formattedPhone = toPhone.replace(/\D/g, '');
  // If it's a local Ghana number starting with 0 and 10 digits long, convert to 233
  if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
    formattedPhone = '233' + formattedPhone.substring(1);
  }

  // Twilio requires numbers to start with '+'
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone;
  }

  return {
    to: formattedPhone, // Standard SMS, no 'whatsapp:' prefix
    body: messageText
  };
}
