'use client'; // needs framer-motion for initial load animations
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-surface pt-8 pb-12 lg:pt-16 lg:pb-20 min-h-[90svh] flex flex-col justify-center">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-deep-blue/5 border border-brand-deep-blue/10 mb-5 md:mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-sm font-medium text-brand-deep-blue/80">B2B Procurement Portal</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="font-display text-[2.75rem] leading-[1.1] sm:text-5xl md:text-7xl text-brand-deep-blue md:leading-[0.9] tracking-tight mb-4 md:mb-8 px-2 md:px-0">
            BUILT FOR INDUSTRY.<br className="hidden md:block" />
            <span className="text-brand-blue block mt-2 md:inline md:mt-0">DELIVERED WITH PRECISION.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-sm sm:text-base md:text-xl text-brand-deep-blue/70 max-w-2xl mb-8 md:mb-12 font-body leading-relaxed px-4 md:px-0">
            Pro Deal Industries is the trusted partner for massive-scale procurement.
            From custom 3D Signages to Industrial Chemicals, we handle the volume you demand without compromise.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <Link 
              href="#divisions" 
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-brand-blue text-white font-heading font-bold rounded-lg shadow-lg shadow-brand-blue/30 hover:bg-brand-deep-blue transition-colors flex items-center justify-center gap-2 text-base"
            >
              Request a Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/track" 
              className="w-full sm:w-auto px-8 py-3 sm:py-4 bg-transparent sm:bg-white text-brand-deep-blue/60 sm:text-brand-deep-blue border-none sm:border border-brand-border hover:text-brand-blue sm:hover:border-brand-blue font-heading font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base underline sm:no-underline"
            >
              Track Existing Order
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-brand-blue/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-brand-red/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </section>
  );
}
