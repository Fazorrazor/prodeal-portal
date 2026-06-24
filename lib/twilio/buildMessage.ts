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
  const { divisionSlug, inquiryData, attachmentCount } = context;
  
  let specificFields = '';
  let divisionEmoji = '🏢';

  if (divisionSlug === '3d-signages') {
    divisionEmoji = '🏗️';
    specificFields = `[ SIGNAGE DETAILS ]
Sign Type: ${inquiryData.signType || 'N/A'}
Dimensions: ${inquiryData.width || '?'}x${inquiryData.height || '?'}
Material: ${inquiryData.materialPreference || 'N/A'}
Quantity: ${inquiryData.quantity || '1'}`;
  } else if (divisionSlug === 'souvenirs-printing') {
    divisionEmoji = '🖨️';
    specificFields = `[ PRINTING DETAILS ]
Product: ${inquiryData.productType || 'N/A'}
Quantity: ${inquiryData.quantity || '1'}
Artwork Ready: ${inquiryData.artworkReady ? 'Yes' : 'No'}`;
  } else if (divisionSlug === 'disposable-bowls') {
    divisionEmoji = '🥣';
    specificFields = `[ INVENTORY DETAILS ]
Product SKU: ${inquiryData.sku || 'N/A'}
Quantity: ${inquiryData.quantity || '1'}
Delivery Required: ${inquiryData.deliveryAddress ? 'Yes' : 'No'}`;
  } else if (divisionSlug === 'chemicals') {
    divisionEmoji = '🧪';
    specificFields = `[ CHEMICAL DETAILS ]
Intended Use: ${inquiryData.intendedUse || 'N/A'}
CAS Number: ${inquiryData.casNumber || 'N/A'}
Grade: ${inquiryData.grade || 'N/A'}`;
  } else {
    specificFields = `[ INQUIRY DETAILS ]
Please check the admin portal for specific fields.`;
  }

  const messageText = `*${divisionEmoji} NEW INQUIRY: ${divisionName.toUpperCase()}*
---------------------------
TRACKING ID: ${trackingId}
ATTACHMENTS: ${attachmentCount}
---------------------------
${specificFields}

Please log in to the admin portal to review the full details and respond.`;

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
    to: `whatsapp:${formattedPhone}`,
    body: messageText
  };
}
