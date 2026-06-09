import { Info, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface PolicyBannerProps {
  title: string;
  children: ReactNode;
  variant?: 'info' | 'warning';
}

export function PolicyBanner({ title, children, variant = 'info' }: PolicyBannerProps) {
  const isWarning = variant === 'warning';
  
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm max-w-3xl mx-auto mt-12 mb-8 ${
      isWarning 
        ? 'from-red-50 to-white border-red-200' 
        : 'from-brand-blue/5 to-white border-brand-blue/20'
    }`}>
      {/* Bold Left Accent */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${isWarning ? 'bg-brand-red' : 'bg-brand-blue'}`} />
      
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start">
        <div className={`flex-shrink-0 mt-1 flex items-center justify-center w-12 h-12 rounded-full ${
          isWarning ? 'bg-red-100 text-brand-red' : 'bg-blue-50 text-brand-blue'
        }`}>
          {isWarning ? (
            <AlertTriangle className="w-6 h-6 animate-[pulse_3s_ease-in-out_infinite]" />
          ) : (
            <Info className="w-6 h-6 animate-[pulse_3s_ease-in-out_infinite]" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className={`font-heading font-bold text-lg mb-2 ${isWarning ? 'text-brand-red' : 'text-brand-deep-blue'}`}>
            {title}
          </h4>
          <div className="text-sm sm:text-base text-brand-deep-blue/70 font-body leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
