'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnimatedBorder } from './AnimatedBorder';

// A short, unobtrusive base64 'ping' sound
const pingSoundBase64 = "data:audio/wav;base64,UklGRigCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQCAAC7/wEAxP8GAKv/DACl/w8Aov8RAKH/EwCf/xUAnf8XAJv/GQCZ/xsAmP8dAJb/HwCU/yEAkv8jAJH/JQCQ/ycAjv8pAIz/KwCL/y0Aif8vAIf/MQCG/zMAhP81AIL/NwCB/zkAgP87AH7/PQB8/z8Aev9BAHn/QwB3/0UAdv9HAHT/SQBz/0sAcf9NAHD/TwBu/1EAbf9TAGv/VQBq/1cAaP9ZAGf/WwBl/10AZP9fAGL/YQBh/2MAYP9lAF7/ZwBd/2kAXP9rAFr/bQBZ/28AWP9xAFb/cwBV/3UAVP93AFP/eQBS/3sAUf99AFD/fwBO/4EATf+DAEz/hQBL/4cASv+JAEr/iwBJ/40ASP+PAEf/kQBG/5MASf+VAEr/lwBL/5kATP+bAE3/nQBO/58AT/+hAFD/owBR/6UAUv+nAFP/qQBU/6sAVf+tAFb/rwBX/7EAWP+zAFn/tQBa/7cAW/+5AFz/uwBd/70AXv+/AF//wQBg/8MAYf/FAGL/xwBj/8kAZP/LAGX/zQBm/88AZ//RAGj/0wBq/9UAa//XAGz/2QBu/9sAb//dAHH/3wBz/+EAdP/jAHb/5QB4/+cAev/pAHz/6wB+/+0AgP/vAIL/8QCE//MAhv/1AIj/9wCL//kAjv/7AJL//QCW//8AnAABAKIABA==";

const playAlertSound = () => {
  try {
    const audio = new Audio(pingSoundBase64);
    // Setting volume to avoid it being overly loud
    audio.volume = 0.6;
    audio.play().catch((e) => {
      console.warn("Audio playback was blocked by the browser. Interaction required.", e);
    });
    
    // Play a second beep for a double-beep effect
    setTimeout(() => {
      const audio2 = new Audio(pingSoundBase64);
      audio2.volume = 0.6;
      audio2.play().catch(() => {});
    }, 150);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
};

export function AlertsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch alerts when component mounts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/admin/alerts');
        if (res.ok) {
          const data = await res.json();
          // Filter out locally dismissed alerts
          const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
          const activeAlerts = data.alerts.filter((a: Record<string, unknown>) => !dismissed.includes(a.id));
          setAlerts(activeAlerts);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlerts();

    const channel = supabase
      .channel('admin-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, () => {
        playAlertSound();
        toast.success('New inquiry received!');
        fetchAlerts();
        router.refresh();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'inquiries' }, () => {
        // If a ticket fails to send and gets deleted, automatically clear its alert
        fetchAlerts();
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = alerts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-brand-deep-blue/80 hover:text-brand-deep-blue transition-colors group flex items-center p-2"
      >
        <span className="font-heading font-bold text-xs uppercase tracking-widest group-hover:text-brand-blue transition-colors">Alerts</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 -right-1 w-2 h-2 bg-brand-red rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-80 bg-brand-surface border border-brand-border/60 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 relative">
            <AnimatedBorder direction="bottom" delay={0.1} className="!bg-brand-deep-blue" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80">
              System Notifications
            </h3>
            <div className="absolute top-4 right-4 text-xs font-mono font-bold text-brand-deep-blue">
              {unreadCount} New
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-5 h-5 animate-spin text-brand-deep-blue/80" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs font-mono text-brand-deep-blue/80">No new alerts.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-border/40">
                {alerts.map((alert: Record<string, any>) => (
                  <Link 
                    key={alert.id}
                    href={`/admin/tickets/${alert.id}`}
                    onClick={() => {
                      const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
                      localStorage.setItem('dismissedAlerts', JSON.stringify([...dismissed, alert.id]));
                      setAlerts(current => current.filter(a => a.id !== alert.id));
                      setIsOpen(false);
                    }}
                    className="block p-4 hover:bg-black/5 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">
                        New Inquiry
                      </span>
                      <span className="text-[10px] font-mono text-brand-deep-blue/80">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-brand-deep-blue leading-tight mb-1 group-hover:text-brand-blue transition-colors">
                      {alert.contact_name}
                    </p>
                    <p className="text-xs font-mono text-brand-deep-blue/80 line-clamp-1">
                      {alert.inquiry_payload?.productName || alert.divisions?.display_name} • ID: {alert.tracking_uuid.split('-')[0]}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="p-2 border-t border-brand-border/60 text-center bg-black/5">
              <Link 
                href="/admin/tickets?status=new" 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:text-brand-deep-blue transition-colors"
              >
                View All New Tickets
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
