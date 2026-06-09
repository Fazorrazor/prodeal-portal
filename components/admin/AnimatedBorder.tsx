'use client';

import { motion } from 'framer-motion';

interface AnimatedBorderProps {
  direction?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
  duration?: number;
}

export function AnimatedBorder({ 
  direction = 'bottom', 
  className = '', 
  delay = 0,
  duration = 0.8 
}: AnimatedBorderProps) {
  const isHorizontal = direction === 'top' || direction === 'bottom';
  
  const baseClasses = "absolute bg-brand-border/60 pointer-events-none";
  
  // Position classes
  const positionClasses = {
    top: "top-0 left-0 h-px",
    bottom: "bottom-0 left-0 h-px",
    left: "top-0 left-0 w-px",
    right: "top-0 right-0 w-px"
  };

  const initial = isHorizontal ? { width: 0 } : { height: 0 };
  const animate = isHorizontal ? { width: '100%' } : { height: '100%' };

  return (
    <motion.div
      className={`${baseClasses} ${positionClasses[direction]} ${className}`}
      initial={initial}
      animate={animate}
      transition={{ duration, delay, ease: "circOut" }}
    />
  );
}
