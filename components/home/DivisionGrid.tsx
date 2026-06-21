'use client'; // needs framer-motion for scroll animations
import { motion } from 'framer-motion';
import { DivisionCard } from './DivisionCard';
import { DIVISIONS_LIST } from '../../lib/config/divisions';

export function DivisionGrid() {
  return (
    <section id="divisions" className="py-16 lg:py-24 bg-brand-surface relative z-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b-2 border-brand-deep-blue pb-6"
        >
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/40 mb-2">
              — 04 Active Services
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-brand-deep-blue tracking-tighter uppercase leading-none">
              Our Services
            </h2>
          </div>
          <p className="text-xs text-brand-deep-blue/50 font-body max-w-xs leading-relaxed">
            Select a service to browse catalogs, check live inventory, or submit a direct inquiry.
          </p>
        </motion.div>

        {/* Division list */}
        <div className="flex flex-col">
          {DIVISIONS_LIST.map((div, i) => (
            <motion.div
              key={div.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <DivisionCard
                title={div.title}
                description={div.tagline}
                href={div.href}
                accent={div.accent}
                index={i}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
