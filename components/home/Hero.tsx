'use client'; // needs framer-motion for initial load animations
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-surface pt-8 pb-16 lg:pt-11 lg:pb-24 min-h-[92svh] flex flex-col justify-center border-b border-brand-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-6 h-px bg-brand-red" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/50">
            Industrial B2B Procurement Portal
          </span>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12 lg:gap-16">
          {/* Left: Main headline block */}
          <div className="flex gap-5 sm:gap-8 flex-1">
            {/* Animated vertical accent line */}
            <div className="flex flex-col items-center pt-2 shrink-0">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                style={{ originY: 0 }}
                className="w-[3px] bg-brand-red h-full min-h-[120px]"
              />
            </div>

            <div className="flex flex-col">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-display font-extrabold text-[3rem] leading-[0.92] sm:text-[4rem] md:text-[5.5rem] lg:text-[7rem] xl:text-[8rem] text-brand-deep-blue tracking-tighter uppercase"
              >
                Built<br />
                For<br />
                <span className="text-brand-blue">Industry.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="mt-6 text-sm sm:text-base text-brand-deep-blue/60 font-body leading-relaxed max-w-md font-normal"
              >
                Prodeal Industries Ltd. is the trusted partner for massive-scale procurement.
                From custom 3D Signages to Industrial Chemicals, we handle the volume you demand without compromise.
              </motion.p>
            </div>
          </div>

          {/* Right: Sub-headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col gap-8 lg:max-w-xs lg:pb-2"
          >
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-deep-blue/40 mb-2">
                Delivered With
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-brand-deep-blue tracking-tighter uppercase leading-none">
                Precision.
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="#divisions"
                className="inline-flex items-center justify-between gap-4 px-6 py-4 bg-brand-blue text-white font-heading font-bold text-sm uppercase tracking-widest transition-colors active:bg-brand-deep-blue w-full sm:w-auto"
              >
                Request a Quote
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <p className="text-[10px] font-mono text-brand-deep-blue/40 tracking-widest uppercase">
                No login required — instant WhatsApp routing
              </p>
            </div>
          </motion.div>
        </div>


      </div>
    </section>
  );
}
