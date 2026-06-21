'use client';

import { useState, useEffect } from 'react';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type TrackingStatus = 'new' | 'in_progress' | 'quoted' | 'closed' | 'cancelled';

interface TrackingTimelineProps {
  trackingId: string;
  status: TrackingStatus;
  createdAt: string;
  updatedAt: string;
}

const STEPS: { id: TrackingStatus; label: string; desc: string }[] = [
  { id: 'new', label: 'RECEIVED', desc: 'Inquiry registered' },
  { id: 'in_progress', label: 'REVIEWING', desc: 'Agent assigned & processing' },
  { id: 'quoted', label: 'QUOTED', desc: 'Proposal ready for review' },
  { id: 'closed', label: 'CLOSED', desc: 'Inquiry finalized' },
];

export function TrackingTimeline({ trackingId, status: initialStatus, updatedAt: initialUpdatedAt }: TrackingTimelineProps) {
  const [currentStatus, setCurrentStatus] = useState<TrackingStatus>(initialStatus);
  const [currentUpdatedAt, setCurrentUpdatedAt] = useState<string>(initialUpdatedAt);
  const supabase = createClientComponentClient();
  
  const { displayText } = useScrambleText(trackingId, 200, 1000);
  
  useEffect(() => {
    const channel = supabase
      .channel(`public:inquiries:${trackingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inquiries',
          filter: `tracking_uuid=eq.${trackingId}`,
        },
        (payload) => {
          if (payload.new) {
            setCurrentStatus(payload.new.status as TrackingStatus);
            if (payload.new.updated_at) {
              setCurrentUpdatedAt(payload.new.updated_at);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, trackingId]);

  // Find current active index (ignore cancelled from standard flow)
  const isCancelled = currentStatus === 'cancelled';
  const currentIndex = STEPS.findIndex(s => s.id === currentStatus);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12">
      <div className="border-t-2 border-brand-deep-blue pt-8 pb-12 mb-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter leading-none text-brand-deep-blue mb-4">
          INQUIRY STATUS
        </h1>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">
              Tracking ID
            </p>
            <p className="text-xl md:text-2xl font-mono text-brand-deep-blue font-bold tracking-widest">
              {displayText}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">
              Last Updated
            </p>
            <p className="text-sm font-mono text-brand-deep-blue">
              {format(new Date(currentUpdatedAt), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {isCancelled ? (
        <div className="border-l-4 border-brand-red pl-6 py-4">
          <h2 className="text-2xl font-heading font-bold text-brand-red tracking-tight mb-2 uppercase">
            Inquiry Cancelled
          </h2>
          <p className="text-brand-deep-blue/70">
            This inquiry has been marked as cancelled. Please contact our support team if you believe this is an error.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line connecting steps */}
          <div className="absolute left-[11px] top-4 bottom-8 w-0.5 bg-brand-border/30 z-0 hidden md:block" />

          <div className="flex flex-col gap-10 relative z-10">
            {STEPS.map((step, index) => {
              const isActive = index === currentIndex;
              const isPast = index < currentIndex;
              
              return (
                <div key={step.id} className="flex gap-6 md:gap-8 items-start group">
                  <div className="flex flex-col items-center mt-1">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.15 }}
                      className={`w-6 h-6 shrink-0 flex items-center justify-center border-2 
                        ${isActive ? 'border-brand-blue bg-brand-blue/10' : 
                          isPast ? 'border-brand-deep-blue bg-brand-deep-blue' : 
                          'border-brand-border/50 bg-transparent'}`}
                    >
                      {isPast && (
                        <div className="w-2 h-2 bg-white" />
                      )}
                      {isActive && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="w-2 h-2 bg-brand-blue" 
                        />
                      )}
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 pb-6 border-b border-brand-border/30 group-last:border-0 group-last:pb-0">
                    <motion.h3 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (index * 0.15) + 0.1 }}
                      className={`text-xl md:text-2xl font-heading font-bold tracking-tight mb-2 uppercase
                        ${isActive ? 'text-brand-blue' : 
                          isPast ? 'text-brand-deep-blue' : 
                          'text-brand-deep-blue/40'}`}
                    >
                      {step.label}
                    </motion.h3>
                    <p className={`text-sm md:text-base font-body
                      ${isActive || isPast ? 'text-brand-deep-blue/80' : 'text-brand-deep-blue/40'}`}>
                      {step.desc}
                    </p>
                    {isActive && step.id === 'new' && (
                      <div className="mt-4 text-xs font-mono bg-brand-blue/5 text-brand-blue p-3 border-l-2 border-brand-blue">
                        Awaiting assignment. You will receive a WhatsApp message shortly.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="mt-16 pt-8 border-t border-brand-border/30">
        <p className="text-xs text-brand-deep-blue/60 uppercase tracking-widest text-center font-bold">
          Need immediate assistance? <a href="/contact" className="text-brand-blue hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
