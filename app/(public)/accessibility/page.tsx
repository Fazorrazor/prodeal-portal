import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Prodeal Industries Ltd',
  description: 'Prodeal Industries Ltd is committed to digital accessibility and ADA compliance.',
};

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16 md:px-10 md:py-24">
      <div className="border-b-2 border-brand-deep-blue pb-8 mb-12">
        <p className="text-[10px] font-mono font-bold text-brand-deep-blue/60 uppercase tracking-[0.25em] mb-4">
          Compliance & Standards
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-brand-deep-blue uppercase tracking-tighter leading-none">
          Accessibility Statement.
        </h1>
      </div>

      <div className="prose prose-sm md:prose-base prose-neutral max-w-none text-brand-deep-blue">
        <div className="space-y-12">
          
          <section className="border-l-2 border-brand-blue pl-6">
            <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">1. Our Commitment</h2>
            <p className="text-sm font-mono leading-relaxed mb-4">
              Prodeal Industries Ltd is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards, including the Americans with Disabilities Act (ADA) requirements and Web Content Accessibility Guidelines (WCAG).
            </p>
          </section>

          <section className="border-l-2 border-brand-border/40 pl-6">
            <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">2. Conformance Status</h2>
            <p className="text-sm font-mono leading-relaxed mb-4">
              The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. 
            </p>
            <p className="text-sm font-mono leading-relaxed mb-4">
              The Prodeal Industries Ltd portal is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content may not fully conform to the accessibility standard, though we enforce strict contrast ratios, semantic HTML, and keyboard navigability across our primary B2B inquiry flows.
            </p>
          </section>

          <section className="border-l-2 border-brand-border/40 pl-6">
            <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">3. Assistive Technologies</h2>
            <p className="text-sm font-mono leading-relaxed mb-4">
              Our B2B portal is designed to be compatible with standard assistive technologies. We utilize semantic markup and ARIA (Accessible Rich Internet Applications) attributes to ensure that screen readers can accurately interpret the site's architecture and form inputs.
            </p>
          </section>

          <section className="border-l-2 border-brand-border/40 pl-6">
            <h2 className="text-xl font-heading font-bold uppercase tracking-widest mb-4">4. Feedback & Support</h2>
            <p className="text-sm font-mono leading-relaxed mb-4">
              We welcome your feedback on the accessibility of the Prodeal portal. If you encounter accessibility barriers on this site, please contact our support team immediately. We aim to respond to accessibility feedback within 2 business days.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
