'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  staggerChildren?: number;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: { staggerChildren: staggerDelay }
  })
};

export const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } }
};

export function ScrollReveal({ children, staggerChildren = 0.1, className = '' }: ScrollRevealProps) {
  return (
    <motion.div
      custom={staggerChildren}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
