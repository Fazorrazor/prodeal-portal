'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteSupportTicket } from '../../../actions/deleteSupportTicket';
import { ConfirmModal } from '../../../../components/admin/ConfirmModal';

export function DeleteComplaintButton({ ticketId }: { ticketId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    setShowModal(false);
    const result = await deleteSupportTicket(ticketId);
    
    if (!result.success) {
      alert(result.error || 'Failed to delete complaint');
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
        className="p-2 text-brand-red/60 hover:text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-50"
        title="Delete Complaint"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmModal
        isOpen={showModal}
        title="Delete Complaint"
        message="Are you sure you want to permanently delete this complaint? This action cannot be undone and will remove it from the database."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
