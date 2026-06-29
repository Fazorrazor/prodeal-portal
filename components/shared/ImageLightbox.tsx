'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}

export function ImageLightbox({ src, alt, children, className = '' }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (src) setIsOpen(true);
        }} 
        className={`cursor-zoom-in ${className}`}
      >
        {children}
      </div>
      
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && src && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }} 
                className="absolute top-4 right-4 md:top-8 md:right-8 p-3 text-white bg-black/40 hover:bg-black/80 border border-white/10 transition-colors z-[110] group"
                aria-label="Close image viewer"
              >
                <X className="w-6 h-6 md:group-hover:scale-110 transition-transform" />
              </button>
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center border border-white/10 bg-black/20"
                onClick={(e) => e.stopPropagation()}
              >
                <Image 
                  src={src} 
                  alt={alt || 'Full screen image view'} 
                  fill 
                  className="object-contain drop-shadow-2xl"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
