'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Bell, ChevronRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const pingSoundBase64 =
  'data:audio/wav;base64,UklGRigCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQCAAC7/wEAxP8GAKv/DACl/w8Aov8RAKH/EwCf/xUAnf8XAJv/GQCZ/xsAmP8dAJb/HwCU/yEAkv8jAJH/JQCQ/ycAjv8pAIz/KwCL/y0Aif8vAIf/MQCG/zMAhP81AIL/NwCB/zkAgP87AH7/PQB8/z8Aev9BAHn/QwB3/0UAdv9HAHT/SQBz/0sAcf9NAHD/TwBu/1EAbf9TAGv/VQBq/1cAaP9ZAGf/WwBl/10AZP9fAGL/YQBh/2MAYP9lAF7/ZwBd/2kAXP9rAFr/bQBZ/28AWP9xAFb/cwBV/3UAVP93AFP/eQBS/3sAUf99AFD/fwBO/4EATf+DAEz/hQBL/4cASv+JAEr/iwBJ/40ASP+PAEf/kQBG/5MASf+VAEr/lwBL/5kATP+bAE3/nQBO/58AT/+hAFD/owBR/6UAUv+nAFP/qQBU/6sAVf+tAFb/rwBX/7EAWP+zAFn/tQBa/7cAW/+5AFz/uwBd/70AXv+/AF//wQBg/8MAYf/FAGL/xwBj/8kAZP/LAGX/zQBm/88AZ//RAGj/0wBq/9UAa//XAGz/2QBu/9sAb//dAHH/3wBz/+EAdP/jAHb/5QB4/+cAev/pAHz/6wB+/+0AgP/vAIL/8QCE//MAhv/1AIj/9wCL//kAjv/7AJL//QCW//8AnAABAKIABA==';

const playAlertSound = () => {
  try {
    const audio = new Audio(pingSoundBase64);
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Autoplay blocked by browser policy
    });
  } catch {
    // Ignore audio context errors
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
          const activeAlerts = data.alerts.filter(
            (a: Record<string, unknown>) => !dismissed.includes(a.id)
          );
          setAlerts(activeAlerts);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    const channel = supabase
      .channel('admin-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, () => {
        playAlertSound();
        toast.success('New inquiry received');
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
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const unreadCount = alerts.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#0A1628] hover:bg-slate-100 transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] cursor-pointer"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/10 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed sm:absolute top-16 sm:top-full left-3 sm:left-auto right-3 sm:right-0 mt-1.5 w-auto sm:w-[360px] max-h-[75vh] sm:max-h-[440px] bg-white rounded-xl border border-slate-200/90 shadow-[0_12px_32px_rgba(15,23,42,0.1)] z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-[#0A1628]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="px-6 py-10 text-center space-y-1">
                  <p className="text-sm font-medium text-[#0A1628]">All caught up</p>
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
                      setAlerts((current) => current.filter((a) => a.id !== alert.id));
                      setIsOpen(false);
                    }}
                    className="block px-4 py-3 hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        New Inquiry
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#0A1628] group-hover:text-[#1A56DB] transition-colors">
                      {alert.contact_name}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {alert.divisions?.display_name || 'Industrial'} ·{' '}
                      <span className="font-mono text-[11px] text-slate-400">
                        #{alert.tracking_uuid.substring(0, 8).toUpperCase()}
                      </span>
                    </p>
                  </Link>
                ))
              )}
            </div>

            {alerts.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 text-center shrink-0">
                <Link
                  href="/admin/tickets?status=new"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1A56DB] hover:text-[#0A1628] transition-colors"
                >
                  <span>View all new inquiries</span>
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
