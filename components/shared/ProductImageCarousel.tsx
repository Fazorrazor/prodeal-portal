'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ProductImageFallback } from './ProductImageFallback';

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  priority?: boolean;
}

export function ProductImageCarousel({ images, alt, priority = false }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  // Fallback if no images
  if (!images || images.length === 0) {
    return <ProductImageFallback />;
  }

  // If only one image, just render it statically
  if (images.length === 1) {
    return (
      <Image
        src={images[0]}
        alt={alt}
        width={400}
        height={300}
        priority={priority}
        className="w-full h-full object-cover"
      />
    );
  }

  // Auto-play continuously with a random stagger offset
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Random delay between 0 and 2000ms so they don't all slide in unison
    const startDelay = Math.random() * 2000;
    
    const timeout = setTimeout(() => {
      // First slide
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
      
      // Then start interval
      interval = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [images.length]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 1,
    }),
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`${alt} - view ${currentIndex + 1}`}
            width={400}
            height={300}
            priority={priority && currentIndex === 0}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Indicator dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
