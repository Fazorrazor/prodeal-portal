'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
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

export function StaffActions({
  member,
  divisions,
  currentUserId,
}: {
  member: StaffMember;
  divisions: Division[];
  currentUserId?: string;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticActive, setOptimisticActive] = useState(member.is_active);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const router = useRouter();

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

      toast.success(`${member.full_name} removed from team`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      setIsDeleting(false);
    }
  };

  const toggleStatus = async () => {
    const nextState = !optimisticActive;
    setOptimisticActive(nextState);
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`Account ${nextState ? 'activated' : 'suspended'}`);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      setOptimisticActive(member.is_active);
    } finally {
      setIsUpdating(false);
    }
  };

  const isSelf = currentUserId === member.auth_user_id;

  if (isSelf) {
    return (
      <div className="flex items-center justify-end">
        <span className="text-[11px] font-medium text-slate-400">Current account</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
      <EditStaffPanel staff={member} divisions={divisions} />

      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isUpdating || isDeleting}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150 disabled:opacity-50 cursor-pointer"
        title="Delete account"
        aria-label={`Delete ${member.full_name}`}
      >
        {isDeleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={optimisticActive}
        onClick={toggleStatus}
        disabled={isUpdating || isDeleting}
        className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-200 ease-out cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A56DB]/40 ${
          optimisticActive ? 'bg-emerald-500' : 'bg-slate-200'
        }`}
        title={optimisticActive ? 'Suspend account' : 'Activate account'}
      >
        <span className="sr-only">Toggle account access</span>
        <span
          className={`inline-flex items-center justify-center w-4 h-4 bg-white rounded-full shadow-xs transform transition-transform duration-200 ease-out ${
            optimisticActive ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        >
          {isUpdating ? <Loader2 className="w-2.5 h-2.5 text-slate-400 animate-spin" /> : null}
        </span>
      </button>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Remove Team Member"
        message={`Permanently delete ${member.full_name}'s account? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
