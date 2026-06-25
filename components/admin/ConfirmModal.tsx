'use client';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Delete', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-brand-surface border-2 border-brand-red max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-brand-border/40 flex items-start gap-4">
          <div className="w-10 h-10 shrink-0 bg-brand-red/10 flex items-center justify-center border border-brand-red/30">
            <AlertTriangle className="w-5 h-5 text-brand-red" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tighter leading-none mb-2">
              {title}
            </h3>
            <p className="text-sm font-medium text-brand-deep-blue/80 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="p-4 bg-black/5 flex justify-end gap-3 border-t border-brand-border/40">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 font-heading font-bold uppercase tracking-widest text-xs text-brand-deep-blue border-2 border-transparent hover:border-brand-border/60 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-brand-red text-white font-heading font-bold uppercase tracking-widest text-xs hover:bg-transparent hover:text-brand-red border-2 border-brand-red transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
