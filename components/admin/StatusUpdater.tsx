'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', colorClass: 'text-brand-red bg-red-50/80 border-red-200/80' },
  { value: 'in_progress', label: 'In Progress', colorClass: 'text-amber-700 bg-amber-50/80 border-amber-200/80' },
  { value: 'quoted', label: 'Quoted', colorClass: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20' },
  { value: 'closed', label: 'Closed', colorClass: 'text-slate-600 bg-slate-100 border-slate-200' },
];

export function StatusUpdater({ inquiryId, currentStatus }: { inquiryId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    setIsOpen(false);
    if (newStatus === status) return;
    
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      toast.success('Status updated successfully');
      router.refresh();
    } catch {
      toast.error('Could not update status. Please try again.');
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {isUpdating && <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />}
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`h-9 px-3.5 rounded-full border flex items-center gap-2 outline-none cursor-pointer transition-all text-xs font-semibold shadow-2xs hover:shadow-xs active:scale-[0.98] disabled:opacity-50 ${currentOption.colorClass}`}
        >
          <span>{currentOption.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between hover:bg-slate-50 ${
                    status === option.value ? 'text-brand-blue font-bold bg-brand-blue/5' : 'text-slate-600'
                  }`}
                >
                  <span>{option.label}</span>
                  {status === option.value && <Check className="w-3.5 h-3.5 text-brand-blue" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
