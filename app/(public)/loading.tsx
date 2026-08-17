'use client';

import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { NavLogo } from '../../components/layout/NavLogo';

export default function PublicLoading() {
  const { displayText } = useScrambleText('CONNECTING TO SECURE PORTAL...');

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-surface">
      <div className="flex flex-col items-center gap-8">
        {/* Soft pulsing minimal logo */}
        <div className="animate-pulse">
          <NavLogo theme="dark" />
        </div>
        
        {/* Animated loader ring */}
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="absolute w-full h-full border-2 border-brand-border/20 rounded-full" />
          <div className="absolute w-full h-full border-2 border-brand-blue rounded-full border-t-transparent animate-spin" />
        </div>
        
        {/* Scrambled minimal text */}
        <div className="text-xs font-medium text-white/50 tracking-[0.2em] uppercase">
          {displayText}
        </div>
      </div>
    </div>
  );
}
