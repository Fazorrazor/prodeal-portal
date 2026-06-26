'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// The full media roster
const SHOWREEL_MEDIA = [
  { type: 'video', src: '/media/VID-20260507-WA0006.mp4' }, // 5MB high quality
  { type: 'video', src: '/media/VID-20250625-WA0002.mp4' },
  { type: 'image', src: '/media/20260218_174905.jpg' },
  { type: 'image', src: '/media/IMG-20250219-WA0000.jpeg' },
];

export default function ShowreelModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when open
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % SHOWREEL_MEDIA.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + SHOWREEL_MEDIA.length) % SHOWREEL_MEDIA.length);

  if (!isOpen || !isMounted) return null;

  const currentMedia = SHOWREEL_MEDIA[currentIndex];

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-brand-surface/90 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Top Header */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 w-full flex items-center justify-between p-4 sm:p-6 border-b border-brand-border/40 bg-brand-surface z-[100000]"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/60">
            // SYS.ARCHIVE.VIEWER
          </span>
          <span className="font-mono text-sm font-bold text-brand-deep-blue">
            FILE {currentIndex + 1} OF {SHOWREEL_MEDIA.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-brand-surface border border-brand-deep-blue hover:bg-brand-red hover:text-white hover:border-brand-red transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-current" />
        </button>
      </div>

      {/* Media Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[80vh] px-4 sm:px-16 flex items-center justify-center mt-16"
      >
        <div className="relative w-full h-full border-2 border-brand-deep-blue bg-black/5 overflow-hidden shadow-2xl flex items-center justify-center">
          {currentMedia.type === 'video' ? (
            <video
              key={currentMedia.src} // Force unmount/remount to trigger autoplay on new source
              src={currentMedia.src}
              controls
              autoPlay
              preload="none" // FLAW PREVENTION: Do not preload heavy videos until requested
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <img
              key={currentMedia.src}
              src={currentMedia.src}
              alt="Archive media"
              loading="lazy"
              className="w-full h-full object-contain bg-black"
            />
          )}
        </div>

        {/* Navigation Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 p-3 bg-brand-surface border border-brand-deep-blue hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-colors z-[100000]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 p-3 bg-brand-surface border border-brand-deep-blue hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-colors z-[100000]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
