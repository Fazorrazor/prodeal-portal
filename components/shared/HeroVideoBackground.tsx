'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Videos matching construction, painting, and chemicals concepts
const videos = [
  'https://assets.mixkit.co/videos/preview/mixkit-construction-worker-working-at-a-site-with-heavy-equipment-32860-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-painter-painting-a-wall-with-a-roller-38933-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-liquid-chemical-in-a-laboratory-tube-40291-large.mp4'
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
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-brand-deep-blue">
      {/* Dark overlay to ensure text remains readable */}
      <div className="absolute inset-0 bg-brand-deep-blue/80 z-10" />
      
      <AnimatePresence initial={false}>
        <motion.video
          key={index}
          src={videos[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
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
