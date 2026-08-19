'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EditStaffPanel } from './EditStaffPanel';
import { ConfirmModal } from './ConfirmModal';

interface StaffMember {
  id: string;
  full_name: string;
  whatsapp_phone: string;
  role: string;
  division_ids: string[] | null;
  is_active: boolean;
  auth_user_id: string;
}

interface Division {
  id: string;
  display_name: string;
}

export function StaffActions({ member, divisions, currentUserId }: { member: StaffMember, divisions: Division[], currentUserId?: string }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticActive, setOptimisticActive] = useState(member.is_active);
  const router = useRouter();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete staff member');
      }
      
      toast.success(`Staff member ${member.full_name} deleted successfully`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      setIsDeleting(false); 
    }
  };

  const toggleStatus = async () => {
    // Optimistically snap the switch immediately for a tactile hardware feel
    setOptimisticActive(!optimisticActive);
    setIsUpdating(true);
    
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !optimisticActive })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      toast.success(`Staff member ${!optimisticActive ? 'activated' : 'deactivated'} successfully`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      // Revert the switch if the request fails
      setOptimisticActive(member.is_active);
    } finally {
      setIsUpdating(false);
    }
  };

  const isSelf = currentUserId === member.auth_user_id;

  if (isSelf) {
    return (
      <div className="flex items-center justify-end">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80">
          Current User
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3">
      <EditStaffPanel staff={member} divisions={divisions} />
      
      <button
        onClick={handleDeleteClick}
        disabled={isUpdating || isDeleting}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Delete Account"
      >
        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>

      {/* Premium Toggle Switch */}
      <button
        onClick={toggleStatus}
        disabled={isUpdating || isDeleting}
        className={`
          relative inline-flex items-center w-11 h-6 rounded-full 
          transition-colors duration-300 ease-in-out cursor-pointer disabled:opacity-50 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue/50
          ${optimisticActive ? 'bg-emerald-500' : 'bg-slate-200'}
        `}
        title={optimisticActive ? 'Deactivate Account' : 'Activate Account'}
      >
        <span className="sr-only">Toggle staff status</span>
        <span
          className={`
            inline-flex items-center justify-center w-5 h-5 bg-white rounded-full shadow-sm 
            transform transition-transform duration-300 ease-out
            ${optimisticActive ? 'translate-x-5' : 'translate-x-0.5'}
          `}
        >
          {isUpdating ? (
            <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
          ) : null}
        </span>
      </button>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Delete Staff"
        message={`Are you sure you want to permanently delete ${member.full_name}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
