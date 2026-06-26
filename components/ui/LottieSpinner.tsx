'use client';

import Lottie from 'lottie-react';
import loadingAnimation from '../../public/animations/loading.json';

interface LottieSpinnerProps {
  className?: string;
  size?: number | string;
}

export default function LottieSpinner({ className = '', size = 48 }: LottieSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Lottie 
        animationData={loadingAnimation} 
        loop={true} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
