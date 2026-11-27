'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteInquirySafely } from '../../app/actions/deleteInquiry';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from './ConfirmModal';

export function DeleteInquiryButton({ inquiryId }: { inquiryId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const router = useRouter();

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);

    const result = await deleteInquirySafely(inquiryId);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete inquiry');
      setIsDeleting(false);
    } else {
      toast.success('Inquiry permanently deleted');
      router.push('/admin/tickets');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-rose-200/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <h2 className="text-sm font-semibold text-[#0A1628]">Delete Inquiry</h2>
        <p className="text-xs text-slate-500">
          Permanently remove this inquiry record, timeline events, and issued quotations.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isDeleting}
        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.98] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Inquiry</span>
          </>
        )}
      </button>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Inquiry"
        message="Are you sure you want to permanently delete this inquiry? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  );
}
