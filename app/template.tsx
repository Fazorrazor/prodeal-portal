'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ── Brand Overlay Transition ── */}
      <motion.div
        className="fixed inset-0 z-[9999] bg-brand-deep-blue flex flex-col items-center justify-center pointer-events-none"
        initial={{ y: '0%' }}
        animate={{ y: '-100%' }}
        transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 1.2 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {/* Logo Typography matching brutalist design */}
          <div className="flex items-baseline font-display font-extrabold text-white tracking-tighter uppercase leading-none text-3xl sm:text-5xl lg:text-6xl text-center px-4">
            PRODEAL INDUSTRIES<span className="text-brand-blue text-4xl sm:text-6xl lg:text-7xl leading-[0]">.</span>
          </div>
          
          <div className="mt-4 flex gap-3 items-center overflow-hidden">
            <motion.span 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="w-12 h-[2px] bg-brand-blue" 
            />
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="text-[9px] sm:text-[10px] font-mono font-bold text-white/60 uppercase tracking-[0.4em]"
            >
              System Online
            </motion.span>
            <motion.span 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="w-12 h-[2px] bg-brand-blue" 
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* ── Page Content Reveal ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </>
  );
}
