'use client'; // needs framer-motion for scroll animations
import { motion } from 'framer-motion';
import { DivisionCard } from './DivisionCard';
import { DIVISIONS_LIST } from '../../lib/config/divisions';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
};

export function DivisionGrid() {

  return (
    <section id="divisions" className="py-24 bg-white relative z-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-4xl md:text-5xl text-brand-deep-blue tracking-wide mb-4">OUR DIVISIONS</h2>
          <p className="text-brand-deep-blue/70 font-body">
            Select a division below to browse catalogs, check live inventory, or submit a direct inquiry.
          </p>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col max-w-4xl mx-auto -mx-4 sm:mx-auto border-t border-brand-border/40"
        >
          {DIVISIONS_LIST.map((div) => (
            <motion.div key={div.title} variants={itemVariants}>
              <DivisionCard 
                title={div.title}
                description={div.tagline}
                href={div.href}
                accent={div.accent}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
