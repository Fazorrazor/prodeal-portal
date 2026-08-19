'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Bell, ChevronRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const pingSoundBase64 = "data:audio/wav;base64,UklGRigCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQCAAC7/wEAxP8GAKv/DACl/w8Aov8RAKH/EwCf/xUAnf8XAJv/GQCZ/xsAmP8dAJb/HwCU/yEAkv8jAJH/JQCQ/ycAjv8pAIz/KwCL/y0Aif8vAIf/MQCG/zMAhP81AIL/NwCB/zkAgP87AH7/PQB8/z8Aev9BAHn/QwB3/0UAdv9HAHT/SQBz/0sAcf9NAHD/TwBu/1EAbf9TAGv/VQBq/1cAaP9ZAGf/WwBl/10AZP9fAGL/YQBh/2MAYP9lAF7/ZwBd/2kAXP9rAFr/bQBZ/28AWP9xAFb/cwBV/3UAVP93AFP/eQBS/3sAUf99AFD/fwBO/4EATf+DAEz/hQBL/4cASv+JAEr/iwBJ/40ASP+PAEf/kQBG/5MASf+VAEr/lwBL/5kATP+bAE3/nQBO/58AT/+hAFD/owBR/6UAUv+nAFP/qQBU/6sAVf+tAFb/rwBX/7EAWP+zAFn/tQBa/7cAW/+5AFz/uwBd/70AXv+/AF//wQBg/8MAYf/FAGL/xwBj/8kAZP/LAGX/zQBm/88AZ//RAGj/0wBq/9UAa//XAGz/2QBu/9sAb//dAHH/3wBz/+EAdP/jAHb/5QB4/+cAev/pAHz/6wB+/+0AgP/vAIL/8QCE//MAhv/1AIj/9wCL//kAjv/7AJL//QCW//8AnAABAKIABA==";

const playAlertSound = () => {
  try {
    const audio = new Audio(pingSoundBase64);
    audio.volume = 0.6;
    audio.play().catch((e) => {
      console.warn("Audio playback was blocked by the browser.", e);
    });
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

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/admin/alerts');
        if (res.ok) {
          const data = await res.json();
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
        fetchAlerts();
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

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
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-brand-deep-blue hover:bg-slate-100/80 transition-all group"
        aria-label="System Notifications"
      >
        <Bell className="w-4 h-4 text-slate-600 group-hover:text-brand-deep-blue transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full ring-2 ring-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Invisible Backdrop for outside tap dismiss */}
          <div 
            className="fixed inset-0 z-40 bg-black/10 sm:bg-transparent animate-in fade-in duration-150" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Popover Dropdown (Fixed left-3 right-3 on mobile, absolute on desktop) */}
          <div className="fixed sm:absolute top-16 sm:top-full left-3 sm:left-auto right-3 sm:right-0 mt-2 w-auto sm:w-[360px] sm:max-w-[380px] max-h-[75vh] sm:max-h-[460px] bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.18)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-blue" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-deep-blue">
                  Notifications
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">
                  {unreadCount} New
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <p className="text-sm font-semibold text-brand-deep-blue">All caught up</p>
                  <p className="text-xs text-slate-400">No unread inquiry alerts.</p>
                </div>
              ) : (
                alerts.map((alert: Record<string, any>) => (
                  <Link 
                    key={alert.id}
                    href={`/admin/tickets/${alert.id}`}
                    onClick={() => {
                      const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
                      localStorage.setItem('dismissedAlerts', JSON.stringify([...dismissed, alert.id]));
                      setAlerts(current => current.filter(a => a.id !== alert.id));
                      setIsOpen(false);
                    }}
                    className="block p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-brand-red border border-red-100">
                        New RFQ
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-brand-deep-blue group-hover:text-brand-blue transition-colors">
                      {alert.contact_name}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {alert.inquiry_payload?.productName || alert.divisions?.display_name} • Ref: {alert.tracking_uuid.substring(0, 8)}
                    </p>
                  </Link>
                ))
              )}
            </div>
            
            {alerts.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
                <Link 
                  href="/admin/tickets?status=new" 
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-deep-blue transition-colors"
                >
                  <span>View All New Inquiries</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
