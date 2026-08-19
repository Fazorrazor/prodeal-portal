'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Pen, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { USER_ROLES, ROLE_VALUES } from '../../lib/config/roles';

interface Division {
  id: string;
  display_name: string;
}

interface StaffMember {
  id: string;
  full_name: string;
  whatsapp_phone: string;
  role: string;
  division_ids: string[] | null;
}

export function EditStaffPanel({ staff, divisions }: { staff: StaffMember, divisions: Division[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: staff.full_name,
    whatsappPhone: staff.whatsapp_phone,
    role: (staff.role || USER_ROLES.STAFF) as string,
    divisionIds: staff.division_ids || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update staff member');
      }

      toast.success('Staff member updated successfully');
      setIsOpen(false);
      router.refresh();
      
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDivision = (divId: string) => {
    setFormData(prev => {
      const current = prev.divisionIds;
      if (current.includes(divId)) {
        return { ...prev, divisionIds: current.filter(id => id !== divId) };
      } else {
        return { ...prev, divisionIds: [...current, divId] };
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 transition-all"
        title="Edit Staff Member"
        aria-label="Edit Staff Member"
      >
        <Pen className="w-3.5 h-3.5" />
      </button>

      {/* Slide Over Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end sm:block animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setIsOpen(false)}
        >
          {/* Panel */}
          <div 
            className="relative sm:absolute sm:top-0 sm:right-0 w-full sm:max-w-md h-[90vh] sm:h-full bg-white rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border-l border-slate-100 p-6 sm:p-8 overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-brand-deep-blue leading-tight">Edit Staff Member</h2>
                  <p className="text-xs text-slate-400">Manage permissions & service assignment</p>
                </div>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-deep-blue hover:bg-slate-50 transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-6 gap-5">
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input 
                    id="edit-name"
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full h-11 px-3.5 bg-slate-50/70 focus:bg-white rounded-xl border border-slate-200/80 text-sm font-semibold text-brand-deep-blue focus:border-brand-blue/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="edit-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    WhatsApp Phone Number
                  </label>
                  <input 
                    id="edit-phone"
                    required
                    type="tel"
                    value={formData.whatsappPhone}
                    onChange={e => setFormData({...formData, whatsappPhone: e.target.value})}
                    className="w-full h-11 px-3.5 bg-slate-50/70 focus:bg-white rounded-xl border border-slate-200/80 text-sm font-mono font-semibold text-brand-deep-blue focus:border-brand-blue/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="edit-role" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    System Authorization Role
                  </label>
                  <select
                    id="edit-role"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full h-11 px-3.5 bg-slate-50/70 focus:bg-white rounded-xl border border-slate-200/80 text-sm font-semibold text-brand-deep-blue focus:border-brand-blue/50 outline-none transition-all cursor-pointer"
                  >
                    {ROLE_VALUES.map(role => (
                      <option key={role} value={role}>{role.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Division Assignments */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Assigned Business Divisions
                  </label>
                  <div className="space-y-2">
                    {divisions.map((div) => {
                      const isAssigned = formData.divisionIds.includes(div.id);
                      return (
                        <label
                          key={div.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                            isAssigned 
                              ? 'bg-brand-blue/[0.04] border-brand-blue/30 text-brand-deep-blue font-semibold' 
                              : 'bg-slate-50/60 border-slate-200/70 text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => toggleDivision(div.id)}
                            className="w-4 h-4 rounded text-brand-blue border-slate-300 focus:ring-brand-blue"
                          />
                          <span className="text-xs">{div.display_name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 pb-4 sm:pb-0">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-brand-deep-blue hover:bg-brand-blue text-white text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...</>
                  ) : (
                    'Save Staff Updates'
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
