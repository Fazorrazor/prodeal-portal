'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', colorClass: 'text-brand-red border-brand-red' },
  { value: 'in_progress', label: 'In Progress', colorClass: 'text-amber-600 border-amber-600' },
  { value: 'quoted', label: 'Quoted', colorClass: 'text-brand-blue border-brand-blue' },
  { value: 'closed', label: 'Closed', colorClass: 'text-brand-deep-blue/80 border-brand-deep-blue/40' },
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
      router.refresh(); // Refresh the page to load new timeline events
    } catch {
      toast.error('Could not update status. Please try again.');
      setStatus(currentStatus); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="flex items-center gap-3 relative" ref={dropdownRef}>
      {isUpdating && <Loader2 className="w-3 h-3 text-brand-blue animate-spin absolute -left-5" />}
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 pt-1">
        Status:
      </span>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`py-1 bg-transparent border-0 border-b-2 flex items-center gap-2 outline-none cursor-pointer transition-colors text-sm font-bold uppercase tracking-widest disabled:opacity-50 ${currentOption.colorClass}`}
        >
          {currentOption.label}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#f8f9fa] border-2 border-brand-deep-blue shadow-[4px_4px_0px_rgba(0,0,0,0.1)] z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-4 py-3 text-left text-sm font-bold uppercase tracking-widest transition-colors hover:bg-black/5 ${
                    status === option.value ? option.colorClass.split(' ')[0] : 'text-brand-deep-blue'
                  } ${option.value !== STATUS_OPTIONS[STATUS_OPTIONS.length - 1].value ? 'border-b border-brand-border/40' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
