'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackHref?: string;
  className?: string;
}

export function BackButton({ fallbackHref = '/', className = '' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button 
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={`flex items-center gap-2 text-brand-deep-blue font-bold uppercase tracking-widest text-[10px] md:hover:text-brand-blue active:opacity-70 transition-all ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );
}
