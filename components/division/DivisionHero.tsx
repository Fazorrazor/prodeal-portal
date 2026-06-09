'use client'; // needs framer-motion for load animations
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GlobalQuoteCTA } from '../shared/GlobalQuoteCTA';
import { DivisionHeroBackground } from './DivisionHeroBackground';
import { motion } from 'framer-motion';

interface DivisionHeroProps {
  title: string;
  tagline: string;
  slug: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
};

export function DivisionHero({ title, tagline, slug }: DivisionHeroProps) {
  return (
    <section className="bg-brand-deep-blue text-white pt-16 pb-20 relative overflow-hidden">
      <DivisionHeroBackground slug={slug} />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Breadcrumbs */}
          <motion.nav variants={itemVariants} className="flex items-center gap-2 text-sm text-white/60 mb-8 font-body">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{title}</span>
          </motion.nav>

          <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-6xl tracking-wide mb-4 uppercase">
            {title}
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-white/70 max-w-2xl font-body leading-relaxed">
            {tagline}
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-8">
            <GlobalQuoteCTA slug={slug} theme="light" />
          </motion.div>
        </motion.div>
        
      </div>
      
    </section>
  );
}
