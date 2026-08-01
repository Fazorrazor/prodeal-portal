'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Local videos uploaded by user in public/media
const videos = [
  '/media/VID-20250625-WA0002.mp4',
  '/media/VID-20260507-WA0006.mp4',
  '/media/VID-20260625-WA0005.mp4'
];

export function HeroVideoBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Switch video every 8 seconds
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % videos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-black">
      {/* Dark overlay to ensure text remains readable */}
      <div className="absolute inset-0 bg-brand-deep-blue/60 z-10" />
      
      <AnimatePresence initial={false}>
        <motion.video
          key={index}
          src={videos[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
    </div>
  );
}
