'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  {
    value: 'new',
    label: 'New',
    dot: 'bg-rose-500',
    pill: 'text-rose-700 bg-rose-50/70 border-rose-200/70',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    dot: 'bg-amber-500',
    pill: 'text-amber-700 bg-amber-50/70 border-amber-200/70',
  },
  {
    value: 'quoted',
    label: 'Quoted',
    dot: 'bg-[#1A56DB]',
    pill: 'text-[#1A56DB] bg-blue-50/70 border-blue-200/70',
  },
  {
    value: 'closed',
    label: 'Closed',
    dot: 'bg-emerald-500',
    pill: 'text-emerald-700 bg-emerald-50/70 border-emerald-200/70',
  },
];

export function StatusUpdater({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const handleStatusChange = async (newStatus: string) => {
    setIsOpen(false);
    if (newStatus === status) return;

    setStatus(newStatus);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success('Status updated');
      router.refresh();
    } catch {
      toast.error('Could not update status. Please try again.');
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];

  return (
    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
      {isUpdating && <Loader2 className="w-3.5 h-3.5 text-[#1A56DB] animate-spin" />}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          aria-expanded={isOpen}
          className={`h-9 px-3.5 rounded-lg border flex items-center gap-2 outline-none cursor-pointer transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] text-xs font-medium disabled:opacity-50 ${currentOption.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentOption.dot}`} />
          <span>{currentOption.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-200/90 shadow-[0_10px_28px_rgba(15,23,42,0.1)] p-1 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-0.5">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  className={`px-2.5 py-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    status === option.value
                      ? 'text-[#0A1628] font-semibold bg-slate-100'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-[#0A1628]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${option.dot}`} />
                    {option.label}
                  </span>
                  {status === option.value && <Check className="w-3.5 h-3.5 text-[#1A56DB]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
