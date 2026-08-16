'use client';

import { motion } from 'framer-motion';
import { BrandLogo } from '../components/shared/BrandLogo';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ── Brand Overlay Transition ── */}
      <motion.div
        className="fixed inset-0 z-[9999] bg-brand-deep-blue flex flex-col items-center justify-center pointer-events-none"
        initial={{ y: '0%' }}
        animate={{ y: '-100%' }}
        transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 2.2 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {/* Animated Native Logo */}
          <div className="flex justify-center px-4 py-8">
            <BrandLogo animate={true} theme="dark" className="scale-125 sm:scale-150 lg:scale-[1.75]" />
          </div>
          
          <div className="mt-6 flex gap-4 items-center overflow-hidden">
            <motion.span 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
              className="w-16 h-[2px] bg-brand-deep-blue/20" 
            />
            <motion.span 
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="text-[10px] sm:text-xs font-mono font-bold text-brand-deep-blue uppercase tracking-[0.5em]"
            >
              System Online
            </motion.span>
            <motion.span 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
              className="w-16 h-[2px] bg-brand-deep-blue/20" 
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* ── Page Content Reveal ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 1.8 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </>
  );
}
