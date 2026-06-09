import Link from 'next/link';
import { PUBLIC_NAV_LINKS, TRACKING_LINK } from '../../lib/config/navigation';

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-8 sm:gap-12">
      <div className="flex flex-col gap-3">
        <h3 className="font-heading font-semibold text-brand-deep-blue">Divisions</h3>
        {PUBLIC_NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className="text-sm text-brand-deep-blue/70 hover:text-brand-blue transition-colors">
            {link.name === 'Chemicals' ? 'Industrial Chemicals' : link.name === 'Printing' ? 'Souvenirs & Printing' : link.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-heading font-semibold text-brand-deep-blue">Support</h3>
        <Link href={TRACKING_LINK.href} className="text-sm text-brand-deep-blue/70 hover:text-brand-blue transition-colors">{TRACKING_LINK.name}</Link>
        <a href="mailto:support@prodealindustries.com" className="text-sm text-brand-deep-blue/70 hover:text-brand-blue transition-colors">Contact Us</a>
      </div>
    </div>
  );
}
