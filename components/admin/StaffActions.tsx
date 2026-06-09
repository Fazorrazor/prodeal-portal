'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { EditStaffPanel } from './EditStaffPanel';

export function StaffActions({ member, divisions }: { member: any, divisions: any[] }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    // Prevent accidental clicking
    if (!confirm(`Are you sure you want to ${member.is_active ? 'deactivate' : 'activate'} this staff member?`)) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      
      toast.success(`Staff member ${member.is_active ? 'deactivated' : 'activated'} successfully`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <EditStaffPanel staff={member} divisions={divisions} />
      <button 
        onClick={toggleStatus}
        disabled={isUpdating}
        className={`p-2 transition-colors disabled:opacity-50 ${member.is_active ? 'text-brand-deep-blue/40 hover:text-brand-red' : 'text-brand-red hover:text-emerald-600'}`}
        title={member.is_active ? 'Deactivate Account' : 'Activate Account'}
      >
        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
      </button>
    </div>
  );
}
