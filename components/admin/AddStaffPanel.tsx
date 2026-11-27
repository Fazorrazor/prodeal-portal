'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Plus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { USER_ROLES, ROLE_VALUES } from '../../lib/config/roles';

interface Division {
  id: string;
  display_name: string;
}

export function AddStaffPanel({ divisions }: { divisions: Division[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    whatsappPhone: '',
    email: '',
    role: USER_ROLES.STAFF as string,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create staff member');
      }

      toast.success('Invitation sent and account provisioned');
      setIsOpen(false);
      setFormData({
        fullName: '',
        whatsappPhone: '',
        email: '',
        role: USER_ROLES.STAFF,
      });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-11 px-3.5 bg-slate-50/80 focus:bg-white rounded-lg border border-slate-200/90 focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/15 text-base sm:text-sm text-[#0A1628] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-slate-400';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-[#0A1628] hover:bg-[#1A56DB] text-white text-xs font-medium rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-[background-color,transform] duration-150 ease-out active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Member</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-staff-title"
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-end sm:block animate-in fade-in duration-150"
          onClick={() => !isSubmitting && setIsOpen(false)}
        >
          <div
            className="relative sm:absolute sm:top-0 sm:right-0 w-full sm:max-w-md h-[90vh] sm:h-full bg-white rounded-t-2xl sm:rounded-none sm:rounded-l-2xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] border-l border-slate-200/80 p-6 sm:p-7 overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-right duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-[#0A1628] shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="add-staff-title" className="text-base font-semibold text-[#0A1628]">
                    Add Team Member
                  </h2>
                  <p className="text-xs text-slate-500">
                    Invite staff to {divisions.length || 'active'} division workspace
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0A1628] hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-6 gap-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="staff-name" className="block text-xs font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    id="staff-name"
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Kwame Mensah"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="staff-phone" className="block text-xs font-medium text-slate-700">
                    WhatsApp Phone Number
                  </label>
                  <input
                    id="staff-phone"
                    required
                    type="tel"
                    value={formData.whatsappPhone}
                    onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                    className={`${inputClass} font-mono`}
                    placeholder="+233201234567"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="staff-email" className="block text-xs font-medium text-slate-700">
                    Corporate Email Address
                  </label>
                  <input
                    id="staff-email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                    placeholder="member@prodealindustries.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="staff-role" className="block text-xs font-medium text-slate-700">
                    Authorization Role
                  </label>
                  <select
                    id="staff-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {ROLE_VALUES.map((role) => (
                      <option key={role} value={role}>
                        {role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-auto pt-6 pb-4 sm:pb-0 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-[#0A1628] hover:bg-[#1A56DB] text-white text-sm font-medium rounded-lg transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning account...</span>
                    </>
                  ) : (
                    <span>Send Invite &amp; Provision</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
