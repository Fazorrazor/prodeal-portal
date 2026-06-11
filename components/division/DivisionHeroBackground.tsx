'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DIVISION_IMAGES = {
  signages: [
    '/images/hero_signages_1781187227132.png',
    '/images/signages_1_1781121563487.png',
    '/images/signages_2_1781121573976.png',
    'https://images.unsplash.com/photo-1506220926022-cc5c12acdb35?auto=format&fit=crop&w=1920&q=80',
  ],
  printing: [
    '/images/hero_printing_1781187237328.png',
    'https://images.unsplash.com/photo-1562664377-709f2c337eb2?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1620002093394-4aa4858daec6?auto=format&fit=crop&w=1920&q=80',
    '/images/hero_printing_last_1781189643433.png',
  ],
  bowls: [
    '/images/hero_bowls_1781187248846.png',
    'https://images.unsplash.com/photo-1589363460779-e3144a2b97f0?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1615598686419-f018e6922572?auto=format&fit=crop&w=1920&q=80',
  ],
  chemicals: [
    '/images/hero_chemicals_1781187261491.png',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1920&q=80',
  ]
};

interface Props {
  slug: string;
}

export function DivisionHeroBackground({ slug }: Props) {
  const images = DIVISION_IMAGES[slug as keyof typeof DIVISION_IMAGES] || DIVISION_IMAGES.signages;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Preload images to avoid flickering
    images.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-brand-deep-blue">
      {/* Lighter overlay so the images are more visible while keeping text readable */}
      <div className="absolute inset-0 bg-brand-deep-blue/70 z-10 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep-blue via-transparent to-transparent z-10 opacity-80" />
      
      <AnimatePresence>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.80, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
          role="presentation"
        />
      </AnimatePresence>
    </div>
  );
}
