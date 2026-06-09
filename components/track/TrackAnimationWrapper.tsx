'use client';

import { motion } from 'framer-motion';

export function TrackAnimationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {children}
    </motion.div>
  );
}
