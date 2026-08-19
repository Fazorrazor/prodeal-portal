'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  FileText,
  Building2,
  Phone,
  User,
  Mail
} from 'lucide-react';
import { useRfqStore, RfqItem } from '@/lib/store/rfqStore';
import { submitInquiry } from '@/app/actions/submitInquiry';

export function RfqTray() {
  const router = useRouter();
  const { 
    items, 
    itemCount, 
    uniqueCount, 
    isOpen, 
    setIsOpen, 
    removeItem, 
    updateQuantity, 
    updateNotes, 
    clear 
  } = useRfqStore();

  const [step, setStep] = useState<'review' | 'contact'>('review');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    generalNotes: '',
    botcheck: '',
  });

  if (uniqueCount === 0 && !isOpen) {
    return null;
  }

  const handlePhoneChange = (val: string) => {
    let cleaned = val.trim();
    if (cleaned && !cleaned.startsWith('+')) {
      if (cleaned.startsWith('0')) {
        cleaned = '+233' + cleaned.substring(1);
      } else if (cleaned.startsWith('233')) {
        cleaned = '+' + cleaned;
      }
    }
    setContact((prev) => ({ ...prev, phone: cleaned }));
  };

  const handleConsolidatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!contact.name || contact.name.trim().length < 2) {
      setErrorMessage('Please enter your full contact name.');
      return;
    }
    if (!contact.email || !contact.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!contact.phone || contact.phone.length < 9) {
      setErrorMessage('Please enter your phone number with country code (e.g. +233 20 123 4567).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine primary division or fallback to 'bowls' / 'chemicals'
      const primaryDivision = items[0]?.divisionSlug || 'bowls';

      const itemsSummary = items
        .map((it, idx) => `${idx + 1}. ${it.name} - Qty: ${it.quantity} ${it.unit || 'units'}${it.notes ? ` (${it.notes})` : ''}`)
        .join('\n');

      const payload = {
        divisionSlug: ['signages', 'printing', 'bowls', 'chemicals'].includes(primaryDivision) 
          ? primaryDivision 
          : 'bowls',
        contact: {
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          companyName: contact.companyName || undefined,
          botcheck: contact.botcheck || undefined,
        },
        inquiry: {
          productName: `Consolidated B2B RFQ (${uniqueCount} SKUs)`,
          items: items.map((it) => ({
            id: it.id,
            name: it.name,
            sku: it.sku,
            quantity: it.quantity,
            unit: it.unit,
            notes: it.notes,
          })),
          message: `Consolidated Multi-Item RFQ Request:\n\n${itemsSummary}\n\nAdditional Notes: ${contact.generalNotes || 'None'}`,
        },
        fileIds: [],
      };

      const result = await submitInquiry(payload);

      if (result.success && result.trackingId) {
        clear();
        setIsOpen(false);
        router.push(`/inquiry/success?trackingId=${result.trackingId}&divisionSlug=${primaryDivision}`);
      } else {
        setErrorMessage(result.error || 'Failed to submit RFQ. Please check your details and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Persistent Floating Bottom-Right Trigger Button */}
      <AnimatePresence>
        {!isOpen && uniqueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-3 bg-brand-deep-blue text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-brand-blue border border-white/20 transition-all duration-300 active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-deep-blue">
                  {uniqueCount}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold block leading-tight">RFQ Tray</span>
                <span className="text-[10px] text-white/70 font-mono block">
                  {itemCount} total unit{itemCount > 1 ? 's' : ''}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Drawer / Modal Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-brand-border/40"
              >
                {/* Header */}
                <div className="p-6 border-b border-brand-border/20 flex items-center justify-between bg-brand-surface">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-blue uppercase tracking-widest block mb-1">
                      Consolidated Procurement
                    </span>
                    <h2 className="font-display font-medium text-2xl text-brand-deep-blue leading-none">
                      RFQ Tray ({uniqueCount})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {uniqueCount > 0 && step === 'review' && (
                      <button
                        onClick={clear}
                        className="text-[11px] text-brand-deep-blue/50 hover:text-brand-red px-2 py-1 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-brand-deep-blue/60 hover:text-brand-deep-blue rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {uniqueCount === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center text-brand-deep-blue/40 mb-4">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <h3 className="font-display font-medium text-lg text-brand-deep-blue mb-1">
                        Your RFQ Tray is empty
                      </h3>
                      <p className="text-xs text-brand-deep-blue/60 max-w-xs font-light">
                        Browse any division catalog (Bowls, Chemicals, Printing, Signages) and click &quot;Add to RFQ&quot; to build a consolidated quote.
                      </p>
                    </div>
                  ) : step === 'review' ? (
                    /* Step 1: Review Items */
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-brand-surface rounded-2xl border border-brand-border/40 flex flex-col gap-3 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-blue block mb-0.5">
                                {item.divisionSlug}
                              </span>
                              <h4 className="text-sm font-semibold text-brand-deep-blue truncate leading-tight">
                                {item.name}
                              </h4>
                              {item.unit && (
                                <p className="text-[11px] text-brand-deep-blue/60 font-light mt-0.5">
                                  {item.unit}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-brand-deep-blue/40 hover:text-brand-red p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quantity & Notes Controls */}
                          <div className="flex items-center justify-between pt-2 border-t border-brand-border/20">
                            <div className="flex items-center border border-brand-border/40 bg-white rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 hover:bg-brand-surface text-brand-deep-blue transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-mono font-bold text-brand-deep-blue">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 hover:bg-brand-surface text-brand-deep-blue transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <input
                              type="text"
                              placeholder="Add spec/notes..."
                              value={item.notes || ''}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="text-xs bg-transparent border-b border-transparent hover:border-brand-border/40 focus:border-brand-blue focus:outline-none px-2 py-1 text-brand-deep-blue/80 placeholder:text-brand-deep-blue/40 w-40 text-right"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Step 2: Contact Details */
                    <form id="rfq-form" onSubmit={handleConsolidatedSubmit} className="space-y-4">
                      {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      {/* Honeypot */}
                      <input
                        type="text"
                        name="botcheck"
                        value={contact.botcheck}
                        onChange={(e) => setContact({ ...contact, botcheck: e.target.value })}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <div>
                        <label className="block text-xs font-medium text-brand-deep-blue/70 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-brand-deep-blue/40 absolute left-3 top-3.5" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Kwame Mensah"
                            value={contact.name}
                            onChange={(e) => setContact({ ...contact, name: e.target.value })}
                            className="w-full bg-brand-surface border border-brand-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-deep-blue font-medium focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-brand-deep-blue/70 mb-1">
                          Corporate Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-brand-deep-blue/40 absolute left-3 top-3.5" />
                          <input
                            type="email"
                            required
                            placeholder="e.g. kwame@enterprise.com"
                            value={contact.email}
                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            className="w-full bg-brand-surface border border-brand-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-deep-blue font-medium focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-brand-deep-blue/70 mb-1">
                          WhatsApp Mobile Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-brand-deep-blue/40 absolute left-3 top-3.5" />
                          <input
                            type="tel"
                            required
                            placeholder="+233 20 123 4567"
                            value={contact.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="w-full bg-brand-surface border border-brand-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-deep-blue font-medium focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <span className="text-[10px] text-brand-deep-blue/50 font-light block mt-1">
                          We send official proforma quotes directly to WhatsApp.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-brand-deep-blue/70 mb-1">
                          Company / Business Name (Optional)
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-brand-deep-blue/40 absolute left-3 top-3.5" />
                          <input
                            type="text"
                            placeholder="e.g. Zenith Hospitality Group"
                            value={contact.companyName}
                            onChange={(e) => setContact({ ...contact, companyName: e.target.value })}
                            className="w-full bg-brand-surface border border-brand-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-brand-deep-blue font-medium focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-brand-deep-blue/70 mb-1">
                          Additional Project / Logistics Notes
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Special delivery location, deadline, or branding notes..."
                          value={contact.generalNotes}
                          onChange={(e) => setContact({ ...contact, generalNotes: e.target.value })}
                          className="w-full bg-brand-surface border border-brand-border/40 rounded-xl p-3 text-sm text-brand-deep-blue font-medium focus:outline-none focus:border-brand-blue resize-none"
                        />
                      </div>
                    </form>
                  )}
                </div>

                {/* Footer Controls */}
                {uniqueCount > 0 && (
                  <div className="p-6 bg-brand-surface border-t border-brand-border/20 space-y-3">
                    {step === 'review' ? (
                      <button
                        type="button"
                        onClick={() => setStep('contact')}
                        className="w-full py-3.5 bg-brand-blue hover:bg-brand-deep-blue text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                      >
                        <span>Proceed to Quote Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setStep('review')}
                          disabled={isSubmitting}
                          className="px-4 py-3.5 bg-white border border-brand-border/40 text-brand-deep-blue text-xs font-semibold rounded-xl hover:bg-brand-surface transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          form="rfq-form"
                          disabled={isSubmitting}
                          className="flex-1 py-3.5 bg-brand-blue hover:bg-brand-deep-blue text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Generating RFQ Receipt...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              <span>Submit Consolidated RFQ</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
