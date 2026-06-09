'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { USER_ROLES, ROLE_VALUES } from '../../lib/config/roles';
import { AnimatedBorder } from './AnimatedBorder';

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
    email: '',
    password: '',
    whatsappPhone: '',
    role: USER_ROLES.AGENT as string,
    divisionId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create staff member');
      }

      toast.success('Staff member provisioned successfully');
      setIsOpen(false);
      setFormData({
        fullName: '', email: '', password: '', whatsappPhone: '', role: USER_ROLES.AGENT, divisionId: ''
      });
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-blue hover:text-brand-deep-blue transition-colors px-4 py-2 border border-brand-border/60 hover:border-brand-deep-blue"
      >
        <Plus className="w-3 h-3" /> Add Staff Member
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
                <h2 className="text-2xl font-heading font-bold text-brand-deep-blue tracking-tighter leading-none mb-1">Provision Staff</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60">System Access</p>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="p-2 text-brand-deep-blue/40 hover:text-brand-red transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col pt-6 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="staff-name" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-2">Full Name</label>
                  <input 
                    id="staff-name"
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue py-2 outline-none transition-colors text-sm font-bold text-brand-deep-blue placeholder:font-normal placeholder:text-brand-deep-blue/30"
                    placeholder="e.g. Arnold D"
                  />
                </div>

                <div>
                  <label htmlFor="staff-email" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-2">Email Address</label>
                  <input 
                    id="staff-email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue py-2 outline-none transition-colors text-sm font-bold font-mono text-brand-deep-blue placeholder:font-normal placeholder:font-sans placeholder:text-brand-deep-blue/30"
                    placeholder="agent@prodeal.com"
                  />
                </div>

                <div>
                  <label htmlFor="staff-pass" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-2">Initial Password</label>
                  <input 
                    id="staff-pass"
                    required
                    type="text"
                    minLength={8}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue py-2 outline-none transition-colors text-sm font-bold font-mono text-brand-deep-blue placeholder:font-normal placeholder:font-sans placeholder:text-brand-deep-blue/30"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="staff-phone" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-2">WhatsApp Phone</label>
                  <input 
                    id="staff-phone"
                    required
                    type="tel"
                    value={formData.whatsappPhone}
                    onChange={e => setFormData({...formData, whatsappPhone: e.target.value})}
                    className="w-full bg-transparent border-0 border-b-2 border-brand-border/60 focus:border-brand-blue py-2 outline-none transition-colors text-sm font-bold font-mono text-brand-deep-blue placeholder:font-normal placeholder:font-sans placeholder:text-brand-deep-blue/30"
                    placeholder="+233..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="staff-role" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-2">System Role</label>
                    <select
                      id="staff-role"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value, divisionId: e.target.value === USER_ROLES.ADMIN ? '' : formData.divisionId})}
                      className="w-full bg-transparent border-b-2 border-brand-border/60 pb-2 text-sm font-bold text-brand-deep-blue focus:outline-none focus:border-brand-blue uppercase tracking-widest"
                    >
                      {ROLE_VALUES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="staff-division" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-2">Division</label>
                    <select 
                      id="staff-division"
                      required={formData.role === USER_ROLES.AGENT}
                      disabled={formData.role === USER_ROLES.ADMIN}
                      value={formData.divisionId}
                      onChange={e => setFormData({...formData, divisionId: e.target.value})}
                      className="w-full bg-transparent border-b-2 border-brand-border/60 pb-2 text-sm font-bold text-brand-deep-blue focus:outline-none focus:border-brand-blue uppercase tracking-widest disabled:opacity-50"
                    >
                      <option value="" disabled>Select...</option>
                      {divisions.map(d => (
                        <option key={d.id} value={d.id}>{d.display_name}</option>
                      ))}
                    </select>
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
                    <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</>
                  ) : (
                    'Provision Account'
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
