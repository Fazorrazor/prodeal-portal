import Link from 'next/link';
import { BrandLogo } from '../shared/BrandLogo';

interface NavLogoProps {
  theme?: 'light' | 'dark';
}

export function NavLogo({ theme = 'light' }: NavLogoProps) {
  return (
    <Link href="/" className="flex items-center group transition-opacity">
      <BrandLogo size="sm" theme={theme} />
    </Link>
  );
}
