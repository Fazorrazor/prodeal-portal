'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BackButton } from '../../../components/shared/BackButton';

export default function TrackSearchPage() {
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setIsLoading(true);
    // basic sanitize to prevent URL injection
    const safeId = trackingId.trim().replace(/[^a-zA-Z0-9-]/g, '');
    router.push(`/track/${safeId}`);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-brand-surface py-12 sm:py-24 px-4 flex flex-col items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-2xl relative z-10 px-4 sm:px-0"
      >
        <div className="mb-8 md:hidden">
          <BackButton fallbackHref="/" />
        </div>
        <div className="text-center mb-16">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-brand-deep-blue mb-4 uppercase tracking-tighter">
            Track Inquiry
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-deep-blue/60 max-w-lg mx-auto">
            Enter your 36-character tracking ID below to check the live status of your quote request.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col gap-8 max-w-lg mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-blue">
              <Search className="h-6 w-6 text-brand-deep-blue/40 group-focus-within:text-brand-blue transition-colors" />
            </div>
            <input 
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="E.G. 123E4567-E89B..."
              className="w-full pl-12 pr-4 py-4 rounded-none border-0 border-b-2 border-brand-border/60 focus:border-brand-blue outline-none transition-all font-mono text-brand-deep-blue font-bold text-xl sm:text-2xl bg-transparent placeholder:text-brand-deep-blue/20"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || !trackingId.trim()}
            className="w-full py-5 sm:py-6 bg-brand-deep-blue text-white font-bold text-sm tracking-widest uppercase hover:bg-brand-blue transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <span>Check Status</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
