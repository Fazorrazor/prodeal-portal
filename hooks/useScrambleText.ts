'use client';

import { useState, useEffect } from 'react';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export function useScrambleText(
  text: string,
  startScrambling: boolean = true,
  durationMs: number = 800,
  scrambleSpeedMs: number = 30
) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!startScrambling || !text) return;

    let iterations = 0;
    const maxIterations = Math.floor(durationMs / scrambleSpeedMs);
    
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split('')
          .map((char, index) => {
            // Lock in characters gradually from left to right
            if (index < (iterations / maxIterations) * text.length) {
              return text[index];
            }
            // Preserve spaces
            if (text[index] === ' ') return ' ';
            
            // Random character
            return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          })
          .join('')
      );

      iterations++;

      if (iterations > maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, scrambleSpeedMs);

    return () => clearInterval(interval);
  }, [text, startScrambling, durationMs, scrambleSpeedMs]);

  return displayText;
}
