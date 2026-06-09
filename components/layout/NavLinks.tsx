'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { ALL_MAIN_LINKS } from '../../lib/config/navigation';

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
      {ALL_MAIN_LINKS.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-brand-blue',
              isActive ? 'text-brand-blue font-semibold' : 'text-brand-deep-blue/80'
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
