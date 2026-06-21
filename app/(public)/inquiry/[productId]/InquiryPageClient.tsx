'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { InquiryFormClient } from './InquiryFormClient';
import { ImageLightbox } from '../../../../components/shared/ImageLightbox';

const PROCESS_STEPS = [
  { index: '01', label: 'Submit this form', detail: 'Your specifications are encrypted and logged.' },
  { index: '02', label: 'Rep notified instantly', detail: 'Routed to the division team via WhatsApp.' },
  { index: '03', label: 'Quote delivered', detail: 'A specialist contacts you to confirm details.' },
];

export function InquiryPageClient({ product, moq }: { product: any, moq: number }) {
  const divisionName = (product.divisions?.display_name || product.divisions?.slug || 'Division').toUpperCase();

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-brand-surface relative">
      
      {/* Animated vertical divider — desktop only */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:block absolute left-[420px] lg:left-[520px] top-0 bottom-0 w-[2px] bg-brand-border/60 z-10"
      />

      {/* ── LEFT PANEL: Product Context ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full md:w-[420px] lg:w-[520px] flex flex-col bg-brand-surface md:bg-black/[0.03] md:sticky md:top-[64px] md:max-h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide z-0 border-b-2 md:border-b-0 border-brand-border/60"
      >
        {/* Top bar: back + division label */}
        <div className="px-5 py-3.5 border-b border-brand-border/40 flex justify-between items-center shrink-0">
          <Link
            href={`/divisions/${product.divisions.slug}`}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-deep-blue/50 uppercase tracking-[0.2em] active:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <span className="text-[9px] font-mono font-bold text-brand-blue uppercase tracking-[0.2em]">
            {divisionName}
          </span>
        </div>

        {/* ── MOBILE: compact strip (thumb + name) — no full banner ── */}
        <div className="md:hidden flex gap-4 items-center px-5 py-4 border-b border-brand-border/40 shrink-0">
          {product.image_path ? (
            <ImageLightbox
              src={product.image_path}
              alt={product.name}
              className="block w-16 h-16 shrink-0 overflow-hidden bg-black/5"
            >
              <Image
                src={product.image_path}
                alt={product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
              />
            </ImageLightbox>
          ) : (
            <div className="w-16 h-16 shrink-0 bg-black/5 flex items-center justify-center">
              <span className="text-[8px] font-mono text-brand-deep-blue/30 uppercase">No img</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-base text-brand-deep-blue uppercase tracking-tight leading-snug line-clamp-2">
              {product.name}
            </h1>
            <div className="text-[10px] font-mono text-brand-deep-blue/35 mt-0.5 uppercase tracking-widest">
              SKU: {product.id.split('-')[0]}
            </div>
          </div>
        </div>

        {/* ── DESKTOP: full product image ── */}
        <div className="hidden md:block relative w-full aspect-[4/3] bg-black/10 overflow-hidden shrink-0 group">
          {product.image_path ? (
            <ImageLightbox
              src={product.image_path}
              alt={product.name}
              className="block w-full h-full"
            >
              <div className="relative w-full h-full">
                <Image
                  src={product.image_path}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="520px"
                  priority
                />
                <div className="absolute bottom-0 right-0 bg-brand-deep-blue/80 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tap to expand
                </div>
              </div>
            </ImageLightbox>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-brand-deep-blue/30 uppercase tracking-widest">
              No image available
            </div>
          )}
        </div>

        {/* Product name + SKU — desktop */}
        <div className="hidden md:block px-6 pt-5 pb-4 border-b border-brand-border/40 shrink-0">
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-brand-deep-blue uppercase tracking-tighter leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-4">
            <div>
              <span className="block text-[9px] font-mono font-bold text-brand-deep-blue/35 uppercase tracking-[0.2em] mb-0.5">
                Product SKU
              </span>
              <span className="text-sm font-mono font-bold text-brand-deep-blue uppercase tracking-widest">
                {product.id.split('-')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* ── What happens next — fills the void ── */}
        <div className="hidden md:flex flex-col flex-1 px-6 pt-6 pb-8">
          {/* Routing strip */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-brand-border/30">
            <span className="text-brand-red text-base font-mono font-bold leading-none">→</span>
            <span className="text-[10px] font-mono font-bold text-brand-deep-blue/60 uppercase tracking-[0.18em]">
              Routed to {divisionName} team via WhatsApp
            </span>
          </div>

          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-brand-deep-blue/35 mb-4">
            — What happens next
          </p>

          <div className="flex flex-col gap-0">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.index} className="flex gap-4 py-4 border-b border-brand-border/20 last:border-b-0">
                <span className="text-[10px] font-mono font-bold text-brand-deep-blue/25 tracking-widest shrink-0 pt-0.5">
                  {step.index}
                </span>
                <div>
                  <div className="text-sm font-heading font-bold text-brand-deep-blue uppercase tracking-tight leading-snug">
                    {step.label}
                  </div>
                  <div className="text-[11px] text-brand-deep-blue/45 font-body mt-0.5 leading-relaxed">
                    {step.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL: Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-2xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <InquiryFormClient product={product} divisionSlug={product.divisions.slug} defaultMoq={moq} />
        </div>
      </motion.div>
    </div>
  );
}
