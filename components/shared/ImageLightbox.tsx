'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
  src?: string;
  images?: string[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  alt: string;
  children: React.ReactNode;
  className?: string;
}

export function ImageLightbox({ 
  src, 
  images = [], 
  initialIndex = 0, 
  onIndexChange,
  alt, 
  children, 
  className = '' 
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const gallery = images.length > 0 ? images : (src ? [src] : []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length > 1) {
      const newIdx = (currentIndex + 1) % gallery.length;
      setCurrentIndex(newIdx);
      onIndexChange?.(newIdx);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length > 1) {
      const newIdx = (currentIndex - 1 + gallery.length) % gallery.length;
      setCurrentIndex(newIdx);
      onIndexChange?.(newIdx);
    }
  };

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

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, gallery.length]);

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
          {isOpen && gallery.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
            >
              {/* Close Button */}
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

              {/* Navigation Arrows */}
              {gallery.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 text-white bg-black/40 hover:bg-black/80 border border-white/10 transition-all z-[110]"
                  >
                    <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 text-white bg-black/40 hover:bg-black/80 border border-white/10 transition-all z-[110]"
                  >
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-[110]">
                    {gallery.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1.5 transition-all ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Image Container */}
              <div 
                className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Image 
                      src={gallery[currentIndex]} 
                      alt={alt || `Image ${currentIndex + 1}`} 
                      fill 
                      className="object-contain drop-shadow-2xl"
                      sizes="100vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
