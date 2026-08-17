import Link from 'next/link';
import { PUBLIC_NAV_LINKS } from '../../lib/config/navigation';

export function FooterLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-24">
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-1">Divisions</h2>
        {PUBLIC_NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className="text-base font-medium text-white/80 hover:text-white transition-colors">
            {link.name === 'Chemicals' ? 'Industrial Chemicals' : link.name === 'Printing' ? 'Souvenirs & Printing' : link.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-1">Support</h2>
        <Link href="/support" className="text-base font-medium text-white/80 hover:text-white transition-colors">Contact Us</Link>
        <Link href="/track" className="text-base font-medium text-white/80 hover:text-white transition-colors">Track Inquiry</Link>
      </div>
    </div>
  );
}
