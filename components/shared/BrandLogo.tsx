'use client';

import { motion } from 'framer-motion';

interface BrandLogoProps {
  className?: string;
  animate?: boolean;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'lg'; // sm = navbar (compact stacked), lg = loader (large stacked)
}

export function BrandLogo({ className = '', animate = false, theme = 'light', size = 'lg' }: BrandLogoProps) {
  const stroke     = theme === 'dark' ? '#ffffff' : '#333333';
  const textColor1 = theme === 'dark' ? 'text-white' : 'text-brand-deep-blue';
  const textColor2 = theme === 'dark' ? 'text-brand-blue' : 'text-brand-blue';

  const isSm = size === 'sm';

  const draw = (delay: number, duration = 0.7) => ({
    hidden:  { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration, ease: [0.22, 1, 0.36, 1] as const, delay } },
  });

  const fade = (delay: number) => ({
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, delay } },
  });

  const d = animate ? 1 : 0;

  return (
    // Always stacked — warehouse on top, text below, centered
    <div className={`flex flex-col items-center ${isSm ? 'gap-0.5' : 'gap-1.5'} ${className}`}>

      {/* ── Warehouse SVG ── */}
      <svg
        viewBox="0 0 180 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        // sm: 56×28px  |  lg: 160×80px
        className={isSm ? 'w-[56px] h-[28px]' : 'w-[160px] h-[80px]'}
      >
        {/* Extended ground line */}
        <motion.line
          x1="0" y1="80" x2="180" y2="80"
          stroke={stroke} strokeWidth="1.5" strokeLinecap="round"
          variants={draw(d * 0.0, 0.6)}
          initial={animate ? 'hidden' : 'visible'} animate="visible"
        />

        {/* Building outline: vertical walls → angled to center peak */}
        <motion.path
          d="M 22,80 L 22,54 L 90,18 L 158,54 L 158,80"
          stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          variants={draw(d * 0.1, 1.0)}
          initial={animate ? 'hidden' : 'visible'} animate="visible"
        />

        {/* Eave lines */}
        <motion.line x1="22" y1="54" x2="58" y2="54"
          stroke={stroke} strokeWidth="1.5" strokeLinecap="round"
          variants={draw(d * 0.50, 0.4)} initial={animate ? 'hidden' : 'visible'} animate="visible"
        />
        <motion.line x1="122" y1="54" x2="158" y2="54"
          stroke={stroke} strokeWidth="1.5" strokeLinecap="round"
          variants={draw(d * 0.55, 0.4)} initial={animate ? 'hidden' : 'visible'} animate="visible"
        />

        {/* Large roller door */}
        <motion.rect x="56" y="55" width="68" height="25"
          stroke={stroke} strokeWidth="1.5" fill="none"
          variants={draw(d * 0.60, 0.5)} initial={animate ? 'hidden' : 'visible'} animate="visible"
        />
        {[60, 65, 70, 74].map((y, i) => (
          <motion.line key={y} x1="57" y1={y} x2="123" y2={y}
            stroke={stroke} strokeWidth="0.9" opacity={0.65}
            variants={fade(d * (0.68 + i * 0.04))} initial={animate ? 'hidden' : 'visible'} animate="visible"
          />
        ))}

        {/* 3 small windows above door */}
        {[63, 82, 101].map((x, i) => (
          <motion.rect key={x} x={x} y="43" width="14" height="8"
            stroke={stroke} strokeWidth="1.2" fill="none"
            variants={fade(d * (0.80 + i * 0.05))} initial={animate ? 'hidden' : 'visible'} animate="visible"
          />
        ))}

        {/* Left + right side windows */}
        <motion.rect x="28" y="60" width="18" height="10"
          stroke={stroke} strokeWidth="1.2" fill="none"
          variants={fade(d * 0.90)} initial={animate ? 'hidden' : 'visible'} animate="visible"
        />
        <motion.rect x="134" y="60" width="18" height="10"
          stroke={stroke} strokeWidth="1.2" fill="none"
          variants={fade(d * 0.95)} initial={animate ? 'hidden' : 'visible'} animate="visible"
        />


      </svg>

      {/* ── Text below the warehouse ── */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          className={`font-display font-extrabold tracking-tighter uppercase leading-none
            ${isSm ? 'text-[11px]' : 'text-xl sm:text-2xl'} ${textColor1}`}
          initial={animate ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: animate ? 0.9 : 0 }}
        >
          PRODEAL
        </motion.div>
        <motion.div
          className={`font-mono font-bold tracking-[0.12em] uppercase leading-none
            ${isSm ? 'text-[6px] mt-px' : 'text-[9px] sm:text-[11px] mt-1'} ${textColor2}`}
          initial={animate ? { opacity: 0, y: 5 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: animate ? 1.1 : 0 }}
        >
          INDUSTRIES LIMITED
        </motion.div>
      </div>
    </div>
  );
}
