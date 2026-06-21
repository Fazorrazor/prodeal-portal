'use client';

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { NavLogo } from './NavLogo';
import { NavLinks } from './NavLinks';
import { MobileDrawer } from './MobileDrawer';
import { NavbarSearch } from './NavbarSearch';

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
          ? 'bg-brand-surface/80 backdrop-blur-md border-brand-border/50 shadow-sm py-2' 
          : 'bg-transparent border-transparent py-4'
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Left: Logo */}
        <div className="flex-none">
          <NavLogo />
        </div>
        
        {/* Center: Search Bar (Desktop) */}
        <div className="flex-1 hidden sm:block max-w-xl mx-auto">
          <NavbarSearch />
        </div>

        {/* Right: Nav Links & Mobile Hamburger */}
        <div className="flex-none flex items-center gap-4 sm:gap-6 justify-end">
          <div className="sm:hidden">
            <NavbarSearch isMobile />
          </div>
          <div className="hidden lg:block">
            <NavLinks />
          </div>
          <div className="lg:hidden shrink-0">
            <MobileDrawer />
          </div>
        </div>

      </div>
    </header>
  );
}
