'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { InquiryFormClient } from './InquiryFormClient';

export function InquiryPageClient({ product, moq }: { product: any, moq: number }) {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-72px)] bg-brand-surface relative">
      {/* Animated Vertical Divider (Desktop) */}
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:block absolute left-[400px] lg:left-[500px] top-0 bottom-0 w-[2px] bg-brand-border/60 z-10"
      />

      {/* Left Column: Product Context */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full md:w-[400px] lg:w-[500px] flex flex-col bg-brand-surface md:bg-black/5 md:sticky md:top-[72px] md:max-h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide z-0 border-b-2 md:border-b-0 border-brand-border/60"
      >
        {/* Header Bar */}
        <div className="p-4 border-b-2 border-brand-border/60 bg-brand-surface shrink-0 flex justify-between items-center">
          <Link 
            href={`/divisions/${product.divisions.slug}`}
            className="inline-flex items-center gap-2 text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest hover:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
            {product.divisions.display_name}
          </span>
        </div>

        <div className="relative w-full aspect-[21/9] bg-black/10 overflow-hidden shrink-0 border-b-2 border-brand-border/60">
          {product.image_path ? (
            <Image 
              src={product.image_path}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-brand-deep-blue/40 uppercase tracking-widest text-xs">
              No Image Available
            </div>
          )}
        </div>
        
        <div className="p-6 flex flex-col bg-brand-surface md:bg-transparent">
          <h1 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl text-brand-deep-blue uppercase tracking-tighter leading-none mb-4">
            {product.name}
          </h1>
          
          <div className="pt-4 relative">
            {/* Animated Horizontal Border */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
              className="absolute top-0 left-0 h-[2px] bg-brand-border/60"
            />
            <div>
              <span className="block text-[10px] font-bold text-brand-deep-blue/40 uppercase tracking-widest mb-1">
                Product SKU
              </span>
              <span className="text-sm font-bold text-brand-deep-blue uppercase tracking-widest font-mono">
                {product.id.split('-')[0]}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Inquiry Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-2xl mx-auto p-6 md:p-12">
          <InquiryFormClient product={product} divisionSlug={product.divisions.slug} defaultMoq={moq} />
        </div>
      </motion.div>
    </div>
  );
}
