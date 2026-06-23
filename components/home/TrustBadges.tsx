'use client'; // needs framer-motion for scroll animations
import { motion } from 'framer-motion';

const STATS = [
  {
    value: 'B2B',
    label: 'Procurement Model',
    sub: 'Enterprise & Commercial',
    accent: 'bg-brand-blue',
  },
  {
    value: '<2h',
    label: 'Response Target',
    sub: 'Via WhatsApp Direct',
    accent: 'bg-brand-red',
  },
  {
    value: '0',
    label: 'Client Logins Required',
    sub: 'Fully Anonymous Inquiry',
    accent: 'bg-brand-blue',
  },
];

export function TrustBadges() {
  return (
    <section className="bg-brand-deep-blue relative z-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="px-6 lg:px-10 py-10 flex flex-col gap-4"
            >
              {/* Accent bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                style={{ originX: 0 }}
                className={`w-8 h-[3px] ${stat.accent}`}
              />

              {/* Value */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold text-4xl sm:text-5xl text-white tracking-tighter leading-none">
                  {stat.value}
                </span>
              </div>

              {/* Labels */}
              <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
                <span className="font-heading font-bold text-sm uppercase tracking-widest text-white">
                  {stat.label}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
                  {stat.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
