'use client';

import { useState, useEffect } from 'react';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:"<>?~`-=[];\',./';

export function useScrambleText(text: string | number, delayMs: number = 0, durationMs: number = 800) {
  const [displayText, setDisplayText] = useState<string | number>('');
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    const targetString = String(text);
    const length = targetString.length;
    const updateInterval = 30; // ms between updates
    const totalSteps = durationMs / updateInterval;

    // Start empty, wait for delay
    setDisplayText(targetString.replace(/./g, ' '));
    
    let intervalId: NodeJS.Timeout;
    
    const timeoutId = setTimeout(() => {
      setIsScrambling(true);
      let step = 0;

      intervalId = setInterval(() => {
        step++;
        
        if (step >= totalSteps) {
          clearInterval(intervalId);
          setDisplayText(targetString);
          setIsScrambling(false);
          return;
        }

        // Calculate how many actual characters should be revealed by now
        const progress = step / totalSteps;
        const revealCount = Math.floor(progress * length);

        const currentText = targetString.split('').map((char, index) => {
          if (char === ' ') return ' ';
          if (index < revealCount) return char; // Revealed character
          
          // Random character for unscrambled portion
          return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        }).join('');

        setDisplayText(currentText);
      }, updateInterval);
      
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, delayMs, durationMs]);

  return { displayText, isScrambling };
}
