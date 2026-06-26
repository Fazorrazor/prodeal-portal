'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Video, Image as ImageIcon, Grid } from 'lucide-react';
import { SHOWREEL_MEDIA } from '../../lib/config/media';

type Category = 'all' | 'video' | 'image';

export default function ShowreelModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(true);

  // Filter media based on category
  const filteredMedia = SHOWREEL_MEDIA.filter(
    (m) => activeCategory === 'all' || m.type === activeCategory
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset index when category changes so we don't go out of bounds
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const currentMedia = filteredMedia[currentIndex];

  // Reset loading state when the active media file changes
  useEffect(() => {
    setIsMediaLoading(true);
  }, [currentMedia?.src]);

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
  }, [isOpen, currentIndex, filteredMedia.length]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);

  if (!isOpen || !isMounted || filteredMedia.length === 0) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-brand-surface/90 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Top Header */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 w-full flex items-center justify-between p-4 sm:p-6 border-b border-brand-border/40 bg-brand-surface z-[100000]"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/60">
            // PRODEAL WORK GALLERY
          </span>
          <span className="font-mono text-sm font-bold text-brand-deep-blue">
            MEDIA {currentIndex + 1} OF {filteredMedia.length}
          </span>
        </div>

        {/* Category Filters */}
        <div className="hidden sm:flex items-center gap-2 border-2 border-brand-deep-blue p-1 bg-black/5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              activeCategory === 'all' ? 'bg-brand-deep-blue text-white' : 'text-brand-deep-blue hover:bg-black/5'
            }`}
          >
            <Grid className="w-3 h-3" /> All
          </button>
          <button
            onClick={() => setActiveCategory('video')}
            className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              activeCategory === 'video' ? 'bg-brand-deep-blue text-white' : 'text-brand-deep-blue hover:bg-black/5'
            }`}
          >
            <Video className="w-3 h-3" /> Videos
          </button>
          <button
            onClick={() => setActiveCategory('image')}
            className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
              activeCategory === 'image' ? 'bg-brand-deep-blue text-white' : 'text-brand-deep-blue hover:bg-black/5'
            }`}
          >
            <ImageIcon className="w-3 h-3" /> Photos
          </button>
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
          
          {/* Brutalist Loading Spinner */}
          {isMediaLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-surface/80 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-brand-deep-blue/20 border-t-brand-red animate-spin" />
              <span className="mt-4 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-brand-deep-blue animate-pulse">
                Fetching Data
              </span>
            </div>
          )}

          {currentMedia.type === 'video' ? (
            <video
              key={currentMedia.src} // Force unmount/remount to trigger autoplay on new source
              src={currentMedia.src}
              controls
              autoPlay
              preload="none"
              playsInline
              onLoadedData={() => setIsMediaLoading(false)}
              className={`w-full h-full object-contain bg-black transition-opacity duration-300 ${isMediaLoading ? 'opacity-0' : 'opacity-100'}`}
            />
          ) : (
            <img
              key={currentMedia.src}
              src={currentMedia.src}
              alt="Archive media"
              loading="lazy"
              onLoad={() => setIsMediaLoading(false)}
              className={`w-full h-full object-contain bg-black transition-opacity duration-300 ${isMediaLoading ? 'opacity-0' : 'opacity-100'}`}
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
      
      {/* Mobile Category Filters (Hidden on Desktop) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="sm:hidden flex items-center gap-1 mt-4 border-2 border-brand-deep-blue p-1 bg-black/5 z-[100000]"
      >
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            activeCategory === 'all' ? 'bg-brand-deep-blue text-white' : 'text-brand-deep-blue'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveCategory('video')}
          className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            activeCategory === 'video' ? 'bg-brand-deep-blue text-white' : 'text-brand-deep-blue'
          }`}
        >
          Vids
        </button>
        <button
          onClick={() => setActiveCategory('image')}
          className={`px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
            activeCategory === 'image' ? 'bg-brand-deep-blue text-white' : 'text-brand-deep-blue'
          }`}
        >
          Pics
        </button>
      </div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
}
