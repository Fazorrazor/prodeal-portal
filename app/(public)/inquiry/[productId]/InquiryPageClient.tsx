'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InquiryFormClient } from './InquiryFormClient';
import { ImageLightbox } from '../../../../components/shared/ImageLightbox';



export function InquiryPageClient({ product, moq, similarProducts = [] }: { product: any, moq: number, similarProducts?: any[] }) {
  const divisionName = (product.divisions?.display_name || product.divisions?.slug || 'Division').toUpperCase();

  const metadataGallery = (product.metadata as any)?.gallery_images || [];
  const rootGallery = product.gallery_images || [];
  
  let galleryImages = Array.from(new Set([
    product.image_path, 
    ...rootGallery, 
    ...metadataGallery
  ].filter(Boolean))) as string[];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

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
        initial={false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full md:w-[420px] lg:w-[520px] flex flex-col bg-brand-surface md:bg-black/[0.03] md:sticky md:top-[64px] md:max-h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide z-0 border-b-2 md:border-b-0 border-brand-border/60"
      >
        {/* Top bar: back + division label */}
        <div className="px-5 py-3.5 border-b border-brand-border/40 flex justify-between items-center shrink-0">
          <Link
            href={`/divisions/${product.divisions.slug}`}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-deep-blue/80 uppercase tracking-[0.2em] active:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <span className="text-[9px] font-mono font-bold text-brand-blue uppercase tracking-[0.2em]">
            {divisionName}
          </span>
        </div>

        {/* ── PRODUCT IMAGE (Mobile & Desktop) ── */}
        <div className="relative w-full aspect-square md:aspect-[4/3] bg-black/10 overflow-hidden shrink-0 group">
          {galleryImages.length > 0 ? (
            <ImageLightbox
              src={galleryImages[currentImageIndex]}
              images={galleryImages}
              initialIndex={currentImageIndex}
              onIndexChange={setCurrentImageIndex}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="block w-full h-full"
            >
              <div className="relative w-full h-full overflow-hidden bg-white/5">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={galleryImages[currentImageIndex]}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 520px"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {galleryImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-8 md:h-8 bg-black/20 hover:bg-black/50 text-white flex items-center justify-center rounded-none opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <ChevronLeft className="w-6 h-6 md:w-5 md:h-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-8 md:h-8 bg-black/20 hover:bg-black/50 text-white flex items-center justify-center rounded-none opacity-100 md:opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <ChevronRight className="w-6 h-6 md:w-5 md:h-5" />
                    </button>
                    
                    {/* Image indicator dots */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {galleryImages.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 md:h-1 transition-all ${i === currentImageIndex ? 'w-5 md:w-4 bg-white' : 'w-2 md:w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                <div className="absolute top-0 right-0 bg-brand-deep-blue/80 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  Tap to expand
                </div>
              </div>
            </ImageLightbox>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-brand-deep-blue/80 uppercase tracking-widest">
              No image available
            </div>
          )}
        </div>

        {/* ── PRODUCT INFO (Mobile & Desktop) ── */}
        <div className="px-5 md:px-6 pt-6 pb-6 border-b border-brand-border/40 shrink-0 flex flex-col gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-brand-deep-blue uppercase tracking-tighter leading-tight mb-2">
              {product.name}
            </h1>
            <div className="text-[10px] font-mono font-bold text-brand-deep-blue/80 uppercase tracking-[0.2em]">
              SKU: {product.id.split('-')[0]}
            </div>
          </div>
          
          {/* Description shown under title on mobile, remains on right panel for desktop */}
          <div className="md:hidden mt-2 flex flex-col gap-6">
            {product.description && (
              <p className="text-sm font-body leading-relaxed text-brand-deep-blue">
                {product.description}
              </p>
            )}
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-brand-deep-blue text-white text-[10px] font-mono font-bold uppercase tracking-[0.2em] active:scale-[0.98] transition-all"
            >
              <span>Proceed to Inquiry</span>
              <span>↓</span>
            </button>
          </div>
        </div>



        {/* ── SIMILAR PRODUCTS ── */}
        {similarProducts.length > 0 && (
          <div className="flex flex-col flex-1 px-5 md:px-6 pt-6 pb-8">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-brand-deep-blue mb-4 border-b border-brand-border/40 pb-2">
              — Similar Products
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {similarProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/inquiry/${p.id}?from=${product.divisions?.slug}`}
                  className="group flex flex-col border border-brand-border/40 p-3 hover:bg-black/[0.02] active:bg-black/5 transition-colors"
                >
                  <div className="w-full aspect-square bg-black/5 mb-3 relative overflow-hidden shrink-0">
                    {p.image_path ? (
                      <Image
                        src={p.image_path}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 50vw, 250px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-mono font-bold text-brand-deep-blue/50 uppercase tracking-widest">
                        No img
                      </div>
                    )}
                  </div>
                  <h4 className="font-heading font-bold text-[11px] sm:text-xs text-brand-deep-blue uppercase tracking-tight leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {p.name}
                  </h4>
                  {p.description && (
                    <p className="text-[10px] font-body text-brand-deep-blue/70 mt-1.5 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  <div className="text-[9px] font-mono text-brand-deep-blue/80 mt-auto pt-3 uppercase tracking-widest">
                    {p.id.split('-')[0]}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── RIGHT PANEL: Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="flex-1 overflow-y-auto"
      >
        <div id="inquiry-form" className="max-w-2xl mx-auto px-5 py-8 md:px-10 md:py-10 scroll-mt-16">
          {/* DESCRIPTION ON THE RIGHT (Desktop Only) */}
          {product.description && (
            <div className="hidden md:block mb-10 pb-8 border-b-2 border-brand-border/60">
              <h3 className="text-[10px] font-mono font-bold text-brand-deep-blue/60 uppercase tracking-[0.25em] mb-3">
                Product Description
              </h3>
              <p className="text-base font-body leading-relaxed text-brand-deep-blue">
                {product.description}
              </p>
            </div>
          )}
          
          <InquiryFormClient product={product} divisionSlug={product.divisions.slug} defaultMoq={moq} />
        </div>
      </motion.div>
    </div>
  );
}
