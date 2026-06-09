'use client';

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { NavLogo } from './NavLogo';
import { NavLinks } from './NavLinks';
import { MobileDrawer } from './MobileDrawer';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled 
          ? 'bg-brand-surface/80 backdrop-blur-md border-brand-border/50 shadow-sm py-3' 
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <NavLogo />
        <NavLinks />
        <MobileDrawer />
      </div>
    </header>
  );
}
