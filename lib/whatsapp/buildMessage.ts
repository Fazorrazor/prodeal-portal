export function buildWhatsAppMessage(toPhone: string, trackingId: string, divisionName: string) {
  return {
    messaging_product: 'whatsapp',
    to: toPhone.replace(/\D/g, ''),
    type: 'template',
    template: {
      name: 'new_inquiry_alert',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: trackingId },
            { type: 'text', text: divisionName }
          ]
        }
      ]
    }
  };
}
