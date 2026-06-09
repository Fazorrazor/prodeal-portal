'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function StatusUpdater({ inquiryId, currentStatus }: { inquiryId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
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
    } catch (error) {
      toast.error('Could not update status. Please try again.');
      setStatus(currentStatus); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-baseline gap-3 relative">
      {isUpdating && <Loader2 className="w-3 h-3 text-brand-blue animate-spin absolute -left-5 top-1" />}
      <label htmlFor={`status-updater-${inquiryId}`} className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">
        Status:
      </label>
      <select 
        id={`status-updater-${inquiryId}`}
        value={status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`py-1 bg-transparent border-0 border-b-2 outline-none cursor-pointer transition-colors text-sm font-bold uppercase tracking-widest disabled:opacity-50
          ${status === 'new' ? 'text-brand-red border-brand-red' : ''}
          ${status === 'in_progress' ? 'text-amber-600 border-amber-600' : ''}
          ${status === 'quoted' ? 'text-brand-blue border-brand-blue' : ''}
          ${status === 'closed' ? 'text-brand-deep-blue/40 border-brand-deep-blue/40' : ''}
        `}
      >
        <option value="new">New</option>
        <option value="in_progress">In Progress</option>
        <option value="quoted">Quoted</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  );
}
