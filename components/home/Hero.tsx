'use client'; // needs framer-motion for initial load animations
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const ShowreelModal = dynamic(() => import('./ShowreelModal'), { ssr: false });

export function Hero() {
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-brand-surface pt-8 pb-16 lg:pt-11 lg:pb-24 min-h-[92svh] flex flex-col justify-center border-b border-brand-border/40">
      
      {/* Background Video */}
      <video
        src="/media/acrylic_waterproofing_vid.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity z-0 pointer-events-none"
      />

      <div className="container mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 relative z-10">

        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-6 h-px bg-brand-blue" />
          <span className="text-[10px] font-mono font-medium tracking-widest text-brand-deep-blue/70">
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
                className="w-px bg-brand-border h-full min-h-[120px]"
              />
            </div>

            <div className="flex flex-col">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-display font-light text-[3rem] leading-[1.05] sm:text-[4rem] md:text-[5.5rem] lg:text-[7rem] xl:text-[8rem] text-brand-deep-blue tracking-tight"
              >
                Built<br />
                For<br />
                <span className="text-brand-blue">Industry.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="mt-6 text-sm sm:text-base text-brand-deep-blue/80 font-body leading-relaxed max-w-md font-normal"
              >
                Prodeal Industries Ltd is your direct line to industrial-grade procurement. We supply high-volume custom signages, commercial printing, disposable bowls, and chemicals with absolute precision and zero friction.
              </motion.p>
            </div>
          </div>

          {/* Right: Sub-headline, Video Trigger + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col gap-8 lg:max-w-md lg:pb-2 w-full"
          >
            <div>
              <p className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-brand-deep-blue/60 mb-2">
                Delivered With
              </p>
              <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl text-brand-deep-blue tracking-tight leading-none">
                Precision.
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="#divisions"
                className="inline-flex items-center justify-between gap-4 px-6 py-4 bg-brand-blue text-white font-medium text-sm transition-colors hover:bg-brand-deep-blue rounded-md shadow-sm w-full sm:w-auto sm:max-w-xs"
              >
                Request a Quote
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              
              <button
                onClick={() => setIsShowreelOpen(true)}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 border border-brand-border text-brand-deep-blue font-medium text-sm transition-all hover:border-brand-deep-blue/40 hover:bg-brand-surface rounded-md w-full sm:w-auto sm:max-w-xs"
              >
                <Play className="w-4 h-4 shrink-0 fill-current opacity-70" />
                View Work Archive
              </button>
              
              <p className="text-[10px] font-mono text-brand-deep-blue/80 tracking-widest uppercase mt-2">
                No login required — instant WhatsApp routing
              </p>
            </div>
            
            {isShowreelOpen && <ShowreelModal isOpen={isShowreelOpen} onClose={() => setIsShowreelOpen(false)} />}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
