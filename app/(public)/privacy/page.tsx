import { AnimatedBorder } from '../../../components/admin/AnimatedBorder';

export const metadata = {
  title: 'Privacy Policy | Prodeal Industries',
  description: 'Privacy policy and data handling practices for Prodeal Industries.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-2 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="mb-16 relative">
        <AnimatedBorder direction="bottom" delay={0.1} />
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-deep-blue tracking-tighter uppercase mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest text-brand-deep-blue/80">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="space-y-12 text-brand-deep-blue leading-relaxed font-mono text-sm md:text-base">
        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">1. Data Collection & Usage</h2>
          <p className="mb-4">
            Prodeal Industries ("we," "our," or "us") is committed to protecting your privacy. We collect minimal personal information necessary to facilitate B2B inquiries and communication. The information we collect may include your name, company name, email address, and WhatsApp-enabled phone number.
          </p>
          <p>
            This data is used exclusively to route your inquiry to the appropriate division specialist and to communicate with you regarding your quote requests via the Meta WhatsApp Business API.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">2. Third-Party Sharing</h2>
          <p className="mb-4">
            We do not sell, rent, or lease your personal information to third parties. Your data is strictly shared with our internal staff members and our secured infrastructure providers (e.g., hosting and database services) solely for the purpose of fulfilling your inquiry.
          </p>
          <p>
            Because we utilize WhatsApp for direct communication, your phone number and message contents will be processed by Meta Platforms, Inc. in accordance with their enterprise privacy agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">3. Data Retention</h2>
          <p>
            Inquiry data is retained in our secure database to maintain a historical record of your quotes and facilitate future orders. If you wish to have your data expunged from our CRM systems, you may request deletion by contacting your assigned Prodeal representative.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">4. Cookies and Analytics</h2>
          <p>
            We utilize privacy-first analytics tools (such as Vercel Web Analytics) to monitor website performance and stability. These tools do not track individual user identities across the web and do not rely on invasive advertising cookies.
          </p>
        </section>

        <section className="pt-8 border-t border-brand-border/60">
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">Contact Information</h2>
          <p>
            For any questions regarding this Privacy Policy, please contact our support team at <a href="mailto:support@prodealindustries.com" className="text-brand-blue hover:underline">support@prodealindustries.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
