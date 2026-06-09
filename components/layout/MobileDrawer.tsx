'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { NavLogo } from './NavLogo';
import { ALL_MAIN_LINKS } from '../../lib/config/navigation';

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-brand-deep-blue transition-colors hover:text-brand-blue"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-brand-deep-blue/40 backdrop-blur-sm z-[90]"
              />
              
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-brand-surface z-[100] shadow-2xl border-l border-brand-border/50 flex flex-col"
              >
                <div className="p-4 flex items-center justify-between border-b border-brand-border/30">
                  <NavLogo />
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 -mr-2 text-brand-deep-blue transition-colors hover:text-brand-red"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col p-6 gap-6">
                  {ALL_MAIN_LINKS.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'text-lg font-heading transition-colors',
                          isActive ? 'text-brand-blue font-bold' : 'text-brand-deep-blue/80 hover:text-brand-blue'
                        )}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
