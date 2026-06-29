'use client'; // needs framer-motion for scroll animations
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useScrambleText } from '@/hooks/useScrambleText';

const STATS = [
  {
    value: '10+',
    label: 'Years Experience',
    sub: 'Trusted Manufacturing Partner',
    accent: 'bg-brand-blue',
  },
  {
    value: '4',
    label: 'Specialized Divisions',
    sub: 'Signs, Print, Bowls, Chemicals',
    accent: 'bg-brand-red',
  },
  {
    value: '100%',
    label: 'Quality Assured',
    sub: 'Strict Compliance Standards',
    accent: 'bg-brand-blue',
  },
];

// Helper component to trigger scramble only when scrolled into view
function ScramblingValue({ value }: { value: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const scrambled = useScrambleText(value, isInView, 1200, 40);

  return (
    <span ref={ref} className="font-mono font-bold text-4xl sm:text-5xl text-white tracking-tighter leading-none inline-block min-w-[3ch]">
      {scrambled}
    </span>
  );
}

export function TrustBadges() {
  return (
    <section className="relative z-20 bg-brand-deep-blue overflow-hidden border-b border-brand-border/40">
      {/* Industrial Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Scanning Laser Line Effect */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: ['0%', '1000%', '0%'], opacity: [0, 0.2, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 w-full h-[1px] bg-brand-blue shadow-[0_0_8px_2px_rgba(0,112,243,0.5)] z-0 pointer-events-none"
      />

      <div className="container mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 backdrop-blur-sm bg-brand-deep-blue/40">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="px-6 lg:px-12 py-12 flex flex-col gap-6 relative group hover:bg-white/[0.02] transition-colors"
            >
              {/* Corner accent for brutalist UI */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 opacity-0 group-hover:opacity-100 transition-opacity m-2" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 opacity-0 group-hover:opacity-100 transition-opacity m-2" />

              {/* Accent bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                style={{ originX: 0 }}
                className={`w-12 h-[4px] ${stat.accent}`}
              />

              {/* Scrambling Value */}
              <div className="flex items-baseline gap-2 pt-2">
                <ScramblingValue value={stat.value} />
              </div>

              {/* Labels */}
              <div className="flex flex-col gap-2 border-t border-white/10 pt-5 mt-auto">
                <span className="font-heading font-bold text-sm sm:text-base uppercase tracking-[0.15em] text-white">
                  {stat.label}
                </span>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-brand-red/90 group-hover:text-brand-red transition-colors">
                  // {stat.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
