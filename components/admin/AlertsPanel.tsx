'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AnimatedBorder } from './AnimatedBorder';

export function AlertsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch alerts when component mounts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/admin/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlerts();
    // Optional: could poll every 30 seconds here
  }, []);

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
        className="relative text-brand-deep-blue/60 hover:text-brand-deep-blue transition-colors group flex items-center p-2"
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
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">
              System Notifications
            </h3>
            <div className="absolute top-4 right-4 text-xs font-mono font-bold text-brand-deep-blue">
              {unreadCount} New
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-5 h-5 animate-spin text-brand-deep-blue/40" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs font-mono text-brand-deep-blue/40">No new alerts.</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-border/40">
                {alerts.map((alert: any) => (
                  <Link 
                    key={alert.id}
                    href={`/admin/tickets/${alert.id}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-4 hover:bg-black/5 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-red">
                        New Inquiry
                      </span>
                      <span className="text-[10px] font-mono text-brand-deep-blue/40">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-brand-deep-blue leading-tight mb-1 group-hover:text-brand-blue transition-colors">
                      {alert.contact_name}
                    </p>
                    <p className="text-xs font-mono text-brand-deep-blue/60">
                      {alert.divisions?.display_name} • ID: {alert.tracking_uuid.split('-')[0]}
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
