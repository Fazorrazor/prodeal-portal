'use client';

import { useState } from 'react';
import { X, Play } from 'lucide-react';

export function ChemicalVideoModal({ 
  videoUrl, 
  productName, 
  cas 
}: { 
  videoUrl: string; 
  productName: string;
  cas?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-brand-border/5 text-brand-deep-blue hover:bg-brand-border/10 text-[10px] sm:text-xs font-bold transition-colors uppercase tracking-widest border-r border-brand-border/10"
      >
        <Play className="w-3 h-3" />
        Before & After
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div 
            className="relative w-full max-w-4xl bg-white flex flex-col border border-brand-border/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-brand-border/20">
              <div>
                <h3 className="font-heading font-bold text-lg text-brand-deep-blue leading-none">
                  {productName}
                </h3>
                {cas && (
                  <span className="text-[10px] font-mono font-medium text-brand-deep-blue/50 uppercase tracking-widest mt-1 block">
                    CAS: {cas}
                  </span>
                )}
              </div>
              <button 
                onClick={handleClose}
                className="p-2 text-brand-deep-blue/50 hover:text-brand-deep-blue transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center w-full">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
