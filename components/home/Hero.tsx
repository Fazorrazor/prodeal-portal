'use client'; // needs framer-motion for initial load animations
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const ShowreelModal = dynamic(() => import('./ShowreelModal'), { ssr: false });

export function Hero() {
  const [isShowreelOpen, setIsShowreelOpen] = useState(false);

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
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80">
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
                className="mt-6 text-sm sm:text-base text-brand-deep-blue/80 font-body leading-relaxed max-w-md font-normal"
              >
                Prodeal Industries Ltd. is the trusted partner for massive-scale procurement.
                From custom 3D Signages to Industrial Chemicals, we handle the volume you demand without compromise.
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
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-deep-blue/80 mb-2">
                Delivered With
              </p>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-brand-deep-blue tracking-tighter uppercase leading-none">
                Precision.
              </h2>
            </div>

            {/* Premium Brutalist Video Trigger */}
            <div 
              onClick={() => setIsShowreelOpen(true)}
              className="relative w-full aspect-[21/9] sm:aspect-video overflow-hidden group cursor-pointer border border-brand-border/40 bg-brand-surface"
              role="button"
              aria-label="Open video showreel"
            >
              {/* Technical Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-brand-deep-blue z-20 pointer-events-none transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-brand-deep-blue z-20 pointer-events-none transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-brand-deep-blue z-20 pointer-events-none transition-transform group-hover:-translate-x-1 group-hover:translate-y-1" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-brand-deep-blue z-20 pointer-events-none transition-transform group-hover:translate-x-1 group-hover:translate-y-1" />

              {/* Glassmorphism Metadata Badge */}
              <div className="absolute top-3 left-3 z-20 px-2 py-1 backdrop-blur-md bg-black/40 border border-white/20 rounded-sm">
                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-white/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                  RECENT PROJECTS
                </span>
              </div>
              
              <video
                src="/media/VID-20260625-WA0003.mp4"
                poster="/media/IMG-20260625-WA0001.jpg"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
              />
              
              {/* Overlay Glass Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-deep-blue/20 group-hover:bg-black/10 transition-colors z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-xl bg-white/10 border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 group-hover:bg-brand-blue/90 group-hover:border-brand-blue transition-all duration-500 shadow-2xl mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-white/90 drop-shadow-md">
                  View Work Archive
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="#divisions"
                className="inline-flex items-center justify-between gap-4 px-6 py-4 bg-brand-blue text-white font-heading font-bold text-sm uppercase tracking-widest transition-colors active:bg-brand-deep-blue w-full sm:w-auto"
              >
                Request a Quote
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <p className="text-[10px] font-mono text-brand-deep-blue/80 tracking-widest uppercase">
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
