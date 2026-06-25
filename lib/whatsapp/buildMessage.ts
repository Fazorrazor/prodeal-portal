export interface WhatsAppContext {
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

export function buildWhatsAppMessage(toPhone: string, trackingId: string, divisionName: string, context: WhatsAppContext) {
  let formattedPhone = toPhone.replace(/\D/g, '');
  // If it's a local Ghana number starting with 0 and 10 digits long, convert to 233
  if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
    formattedPhone = '233' + formattedPhone.substring(1);
  }

  return {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'template',
    template: {
      name: 'prodeal_new_inquiry',
      language: {
        code: 'en_US'
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: divisionName.toUpperCase()
            },
            {
              type: 'text',
              text: trackingId
            }
          ]
        }
      ]
    }
  };
}
