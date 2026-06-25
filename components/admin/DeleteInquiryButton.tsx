'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteInquirySafely } from '../../app/actions/deleteInquiry';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from './ConfirmModal';

export function DeleteInquiryButton({ inquiryId }: { inquiryId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);

    const result = await deleteInquirySafely(inquiryId);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete inquiry');
      setIsDeleting(false);
    } else {
      toast.success('Inquiry permanently deleted');
      // Redirect back to the tickets list
      router.push('/admin/tickets');
    }
  };

  return (
    <div className="pt-8 mt-12 border-t border-brand-red/20">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-red mb-4">
        Danger Zone
      </h3>
      <button 
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-red hover:bg-brand-red hover:text-white border border-brand-red transition-colors px-4 py-3 w-full justify-center disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-brand-red"
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" /> DELETING...
          </>
        ) : (
          'PERMANENTLY DELETE'
        )}
      </button>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Delete Inquiry"
        message="Are you sure you want to permanently delete this inquiry? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
