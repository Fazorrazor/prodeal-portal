import Link from 'next/link';
import { PUBLIC_NAV_LINKS } from '../../lib/config/navigation';

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-8 sm:gap-12">
      <div className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-brand-deep-blue">Services</h2>
        {PUBLIC_NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className="text-sm text-brand-deep-blue/80 hover:text-brand-blue transition-colors">
            {link.name === 'Chemicals' ? 'Industrial Chemicals' : link.name === 'Printing' ? 'Souvenirs & Printing' : link.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-brand-deep-blue">Support</h2>
        <Link href="/support" className="text-sm text-brand-deep-blue/80 hover:text-brand-blue transition-colors">Contact Us</Link>
      </div>
    </div>
  );
}
