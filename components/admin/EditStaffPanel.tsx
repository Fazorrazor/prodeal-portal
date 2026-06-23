'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Pen } from 'lucide-react';
import { toast } from 'sonner';
import { USER_ROLES, ROLE_VALUES } from '../../lib/config/roles';
import { AnimatedBorder } from './AnimatedBorder';

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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 transition-colors text-brand-deep-blue/80 hover:text-brand-blue"
        title="Edit Staff Member"
        aria-label="Edit Staff Member"
      >
        <Pen className="w-4 h-4" />
      </button>

      {/* Slide Over Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-brand-surface/80 backdrop-blur-sm"
          onClick={() => !isSubmitting && setIsOpen(false)}
        >
          {/* Panel */}
          <div 
            className="absolute top-0 right-0 h-full w-full max-w-md bg-brand-surface border-l border-brand-border/60 shadow-2xl p-6 lg:p-8 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-6 relative shrink-0">
              <AnimatedBorder direction="bottom" delay={0.2} className="!bg-brand-deep-blue" />
              <div>
                <h2 className="text-2xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">Edit Staff</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80">System Access</p>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="p-2 text-brand-deep-blue/80 hover:text-brand-red transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-6 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-2">Full Name</label>
                  <input 
                    id="edit-name"
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue py-2 outline-none transition-colors text-sm font-bold text-brand-deep-blue placeholder:font-normal placeholder:text-brand-deep-blue/80"
                  />
                </div>

                <div>
                  <label htmlFor="edit-phone" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-2">WhatsApp Phone</label>
                  <input 
                    id="edit-phone"
                    required
                    type="tel"
                    value={formData.whatsappPhone}
                    onChange={e => setFormData({...formData, whatsappPhone: e.target.value})}
                    className="w-full bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue py-2 outline-none transition-colors text-sm font-bold font-mono text-brand-deep-blue placeholder:font-normal placeholder:font-sans placeholder:text-brand-deep-blue/80"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-role" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-2">System Role</label>
                    <select 
                      id="edit-role"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value, divisionIds: e.target.value === USER_ROLES.ADMIN ? [] : formData.divisionIds})}
                      className="w-full bg-transparent border-b-2 border-brand-border/60 pb-2 text-sm font-bold text-brand-deep-blue focus:outline-none focus:border-brand-blue uppercase tracking-widest"
                    >
                      {ROLE_VALUES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className={formData.role === USER_ROLES.ADMIN ? 'opacity-50 pointer-events-none' : ''}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 mb-2">Services</label>
                    <div className="space-y-3 mt-2">
                      {divisions.map(d => (
                        <label key={d.id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={formData.divisionIds.includes(d.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked 
                                ? [...formData.divisionIds, d.id] 
                                : formData.divisionIds.filter(id => id !== d.id);
                              setFormData({...formData, divisionIds: newIds});
                            }}
                            className="w-4 h-4 rounded-none border-2 border-brand-border/60 text-brand-deep-blue focus:ring-brand-blue"
                          />
                          <span className="text-sm font-bold text-brand-deep-blue group-hover:text-brand-blue transition-colors">
                            {d.display_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-deep-blue text-brand-surface py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    'Save Changes'
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
