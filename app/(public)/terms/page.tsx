import { AnimatedBorder } from '../../../components/admin/AnimatedBorder';

export const metadata = {
  title: 'Terms of Service | Prodeal Industries',
  description: 'Terms of service and liability guidelines for Prodeal Industries.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mb-16 relative">
        <AnimatedBorder direction="bottom" delay={0.1} />
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-deep-blue tracking-tighter uppercase mb-4">
          Terms of Service
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest text-brand-deep-blue/60">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="space-y-12 text-brand-deep-blue leading-relaxed font-mono text-sm md:text-base">
        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">1. General Provisions</h2>
          <p>
            By accessing the Prodeal Industries portal and submitting an inquiry, you agree to be bound by these Terms of Service. Prodeal Industries operates strictly as a Business-to-Business (B2B) supplier. All inquiries, quotes, and subsequent agreements are governed by these terms unless expressly modified in a formal written contract.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">2. Inquiries and Quotes</h2>
          <p className="mb-4">
            The Prodeal portal is a lead-capture and inquiry system, not an e-commerce checkout. Submitting an inquiry through our platform does not constitute a legally binding purchase agreement.
          </p>
          <p>
            Any quotes or estimates provided by our representatives via WhatsApp or email are valid only for the duration specified in that communication. Prodeal reserves the right to modify pricing, minimum order quantities (MOQs), and lead times based on market availability prior to final invoice generation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">3. Industrial Liability and Compliance</h2>
          <div className="bg-brand-red/5 border-l-2 border-brand-red p-6 space-y-4">
            <p className="font-bold text-brand-red uppercase tracking-widest text-xs">Crucial clause for Chemical & Industrial divisions</p>
            <p>
              Prodeal Industries supplies industrial-grade materials, chemicals, and fabricated signage. It is the sole responsibility of the purchasing entity to ensure that they possess the necessary licenses, facilities, and training to safely receive, store, and utilize these products.
            </p>
            <p>
              For the Chemicals division, buyers must adhere to all local and international EPA regulations. Prodeal Industries accepts no liability for damages, injuries, or regulatory penalties arising from the improper handling, transport, or application of supplied materials once they have left our facilities or designated freight partners.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">4. Fulfillment and Refunds</h2>
          <p>
            Due to the custom-fabricated nature of our 3D Signages and Printing divisions, and the bulk nature of our Chemical and Inventory divisions, all confirmed orders are final. Cancellations or refunds are not permitted once production has commenced or materials have been dispatched, except in cases where the delivered product demonstrably fails to meet the specifications agreed upon in the final invoice.
          </p>
        </section>

        <section className="pt-8 border-t border-brand-border/60">
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">Contact Information</h2>
          <p>
            If you require clarification on any of these terms prior to finalizing an order, please contact our legal and compliance team at <a href="mailto:legal@prodealindustries.com" className="text-brand-blue hover:underline">legal@prodealindustries.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
