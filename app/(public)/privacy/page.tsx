import { AnimatedBorder } from '../../../components/admin/AnimatedBorder';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Prodeal Systems',
  description: 'Privacy policy and data handling practices for Prodeal Systems.',
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
        <div className="bg-brand-deep-blue/5 p-6 border-l-2 border-brand-deep-blue">
          <p className="font-bold uppercase tracking-widest text-xs mb-2">Corporate Identity & Jurisdiction</p>
          <p>
            This policy is issued on behalf of Prodeal Systems Ltd. Data processing is governed in accordance with the Data Protection Act, 2012 (Act 843) of the Republic of Ghana, alongside applicable international B2B data protection standards.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">1. Data Collection & Usage</h2>
          <p className="mb-4">
            Prodeal Systems ("we," "our," or "us") is committed to protecting your privacy. We collect minimal personal information necessary to facilitate B2B inquiries and communication. The information we collect may include your name, company name, email address, and WhatsApp-enabled phone number.
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
          <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">3. Data Retention & User Rights</h2>
          <p>
            Inquiry data is retained in our secure database to maintain a historical record of your quotes and facilitate future orders. To exercise your right to data access, rectification, or erasure, please submit a formal request to our compliance team at <code className="bg-brand-deep-blue/10 px-1">legal@prodealindustries.com</code>.
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
            For any questions regarding this Privacy Policy, please contact our support team at <Link href="/support" className="text-brand-blue hover:underline font-bold">our Support Page</Link> or email us at <code className="bg-brand-deep-blue/10 px-1">support@prodealindustries.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
