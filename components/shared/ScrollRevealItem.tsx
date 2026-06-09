'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { itemVariants } from './ScrollReveal';

interface ScrollRevealItemProps {
  children: ReactNode;
  className?: string;
}

export function ScrollRevealItem({ children, className = '' }: ScrollRevealItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
