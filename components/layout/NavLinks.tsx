'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { cn } from '../../lib/utils';
import { ALL_MAIN_LINKS } from '../../lib/config/navigation';

function NavLinksContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  return (
    <nav className="hidden md:flex items-center gap-6 lg:gap-8">
      {ALL_MAIN_LINKS.map((link) => {
        const slug = link.href.split('/').pop();
        const isActive = pathname.startsWith(link.href) || (pathname.startsWith('/inquiry') && fromParam === slug);
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

export function NavLinks() {
  return (
    <Suspense fallback={<nav className="hidden md:flex items-center gap-6 lg:gap-8" />}>
      <NavLinksContent />
    </Suspense>
  );
}
