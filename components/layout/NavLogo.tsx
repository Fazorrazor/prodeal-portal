import Link from 'next/link';
import { BrandLogo } from '../shared/BrandLogo';

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center group transition-opacity">
      <BrandLogo size="sm" />
    </Link>
  );
}
