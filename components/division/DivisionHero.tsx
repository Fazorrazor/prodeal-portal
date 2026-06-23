'use client'; // needs framer-motion for load animations
import Link from 'next/link';
import { DivisionHeroBackground } from './DivisionHeroBackground';
import { motion } from 'framer-motion';

interface DivisionHeroProps {
  title: string;
  tagline: string;
  slug: string;
}

export function DivisionHero({ title, tagline, slug }: DivisionHeroProps) {
  return (
    <section className="bg-brand-deep-blue text-white pt-14 pb-14 lg:pt-16 lg:pb-16 relative overflow-hidden border-b border-white/10">
      <DivisionHeroBackground slug={slug} />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Breadcrumb — monospaced metadata style */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 mb-6"
        >
          <Link
            href="/"
            className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/80 active:text-white transition-colors"
          >
            Home
          </Link>
          <span className="text-white/80 font-mono text-xs">›</span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/80">
            {title}
          </span>
        </motion.nav>

        <div className="flex gap-5 sm:gap-8">
          {/* Animated vertical accent line */}
          <div className="flex flex-col items-center shrink-0">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
              style={{ originY: 0 }}
              className="w-[3px] bg-brand-red h-full min-h-[80px]"
            />
          </div>

          {/* Text block */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter uppercase leading-[0.92] mb-4"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-sm sm:text-base text-white/80 max-w-xl font-body leading-relaxed"
            >
              {tagline}
            </motion.p>
          </div>
        </div>

      </div>
    </section>
  );
}
