'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Loader2, AlertCircle } from 'lucide-react';
import { useQuoteStore } from '../../store/quoteStore';
import { FileUploadZone } from './FileUploadZone';
import { submitInquiry } from '../../app/actions/submitInquiry';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ContactDetailsSchema, DIVISION_SCHEMAS } from '../../lib/validators/inquiry';
import { toast } from 'sonner';
import { useScrambleText } from '../../lib/hooks/useScrambleText';
import { AnimatedBorder } from '../admin/AnimatedBorder';

function TrackingReceipt({ trackingId, onClose }: { trackingId: string, onClose: () => void }) {
  const { displayText } = useScrambleText(trackingId, 200, 1500);
  
  const copyTracking = () => {
    navigator.clipboard.writeText(trackingId);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="flex flex-col py-8 h-full">
      <h3 className="font-heading font-bold text-3xl md:text-4xl text-brand-deep-blue mb-2 tracking-tighter uppercase">Inquiry Logged.</h3>
      <p className="text-[10px] font-bold text-brand-deep-blue/60 mb-12 uppercase tracking-widest max-w-sm leading-relaxed">
        Your data has been successfully routed. Retain the following code to track progress via the tracking portal.
      </p>
      
      <div className="border-y-2 border-brand-deep-blue/20 py-8 mb-12 flex items-center justify-between relative overflow-hidden">
        <AnimatedBorder direction="left" delay={0.2} />
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Decrypted Tracking UUID</p>
          <span className="font-mono font-bold text-2xl md:text-3xl text-brand-deep-blue tracking-tight">
            {displayText}
          </span>
        </div>
        <button type="button" onClick={copyTracking} className="p-4 bg-brand-deep-blue/5 hover:bg-brand-blue hover:text-white transition-colors relative z-10" aria-label="Copy tracking ID">
          <Copy className="w-5 h-5" />
        </button>
      </div>
      
      <button 
        type="button"
        onClick={onClose}
        className="w-full sm:w-auto px-8 py-4 bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-xs border-2 border-brand-deep-blue hover:bg-transparent hover:text-brand-deep-blue transition-colors self-start"
      >
        Acknowledge Session
      </button>
    </div>
  );
}

export function QuoteBuilderModal() {
  const { isOpen, closeBuilder, division, uploadedFiles, reset: resetStore } = useQuoteStore();
  
  // Status states: 'idle' | 'submitting' | 'success' | 'error'
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [trackingId, setTrackingId] = useState('');

  // Close handler to reset local state too
  const handleClose = () => {
    closeBuilder();
    setTimeout(() => {
      setStatus('idle');
      setTrackingId('');
      resetStore(); // Clear all data only after the modal has visually closed
    }, 300);
  };

  const activeSlug = division || 'signages';
  const DivisionSpecificSchema = DIVISION_SCHEMAS[activeSlug as keyof typeof DIVISION_SCHEMAS] || DIVISION_SCHEMAS.signages;

  const FormSchema = z.object({
    contact: ContactDetailsSchema,
    inquiry: DivisionSpecificSchema,
  });

  type FormData = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inquiry: {
        quantity: 100, // Safe default to help bypass MOQ issues on mount
        width: 1000,
        height: 500,
      } as any
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount just in case
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    setStatus('submitting');
    
    const payload = {
      divisionSlug: activeSlug,
      contact: data.contact,
      inquiry: data.inquiry,
      fileIds: uploadedFiles.map(f => f.url) // the url is the storage path
    };

    const result = await submitInquiry(payload);

    if (result.success && result.trackingId) {
      setStatus('success');
      setTrackingId(result.trackingId);
      // We no longer call resetStore() here, otherwise it instantly closes the modal!
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong.');
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-deep-blue/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-brand-surface w-full max-w-2xl sm:rounded-none rounded-t-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative border-x border-t sm:border-brand-border/60"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-brand-border bg-white sticky top-0 z-10">
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between p-6 pt-3 sm:pt-6">
              <div>
                <h2 className="font-heading font-bold text-2xl text-brand-deep-blue uppercase tracking-wide">
                Quote Request
              </h2>
              <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mt-1">
                Division: {activeSlug}
              </p>
            </div>
            <button 
              onClick={handleClose}
              disabled={status === 'submitting'}
              className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-deep-blue/40 hover:text-brand-red transition-colors disabled:opacity-50 bg-brand-surface rounded-full"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            
            {status === 'success' && (
              <TrackingReceipt trackingId={trackingId} onClose={handleClose} />
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <div className="w-16 h-16 bg-brand-red/10 flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-brand-red" />
                </div>
                <h3 className="font-heading font-bold text-3xl text-brand-deep-blue tracking-tighter uppercase mb-2">Submission Failed.</h3>
                <p className="text-[10px] font-bold text-brand-deep-blue/60 mb-8 uppercase tracking-widest max-w-sm">
                  {errorMessage}
                </p>
                <button 
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-8 py-4 bg-brand-red text-white font-heading font-bold uppercase tracking-widest text-xs hover:bg-transparent hover:text-brand-red border-2 border-brand-red transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {(status === 'idle' || status === 'submitting') && (
              <form id="quote-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Contact Section */}
                <section>
                  <h3 className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-6 border-b-2 border-brand-border/60 pb-2">
                    Contact Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                    <div>
                      <label htmlFor="contact-name" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Full Name *</label>
                      <input 
                        id="contact-name"
                        {...register('contact.name')} 
                        className={`w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors ${errors.contact?.name ? 'border-brand-red text-brand-red' : 'border-brand-border/60 text-brand-deep-blue focus:border-brand-blue'}`}
                        placeholder="JOHN DOE"
                      />
                      {errors.contact?.name && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{errors.contact.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-company" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Company (Optional)</label>
                      <input 
                        id="contact-company"
                        {...register('contact.companyName')} 
                        className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue"
                        placeholder="ACME CORP"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Email *</label>
                      <input 
                        id="contact-email"
                        type="email"
                        {...register('contact.email')} 
                        className={`w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors ${errors.contact?.email ? 'border-brand-red text-brand-red' : 'border-brand-border/60 text-brand-deep-blue focus:border-brand-blue'}`}
                        placeholder="USER@DOMAIN.COM"
                      />
                      {errors.contact?.email && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{errors.contact.email.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">WhatsApp Phone *</label>
                      <input 
                        id="contact-phone"
                        type="tel"
                        {...register('contact.phone')} 
                        className={`w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors ${errors.contact?.phone ? 'border-brand-red text-brand-red' : 'border-brand-border/60 text-brand-deep-blue focus:border-brand-blue'}`}
                        placeholder="+233..."
                      />
                      {errors.contact?.phone && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{errors.contact.phone.message}</p>}
                    </div>
                  </div>
                </section>

                {/* Division Specific Section */}
                <section>
                  <h3 className="text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-6 border-b-2 border-brand-border/60 pb-2">
                    Inquiry Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                    
                    {activeSlug === 'signages' && (
                      <>
                        <div>
                          <label htmlFor="inquiry-signtype" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Sign Type</label>
                          <select id="inquiry-signtype" {...register('inquiry.signType' as any)} className="w-full py-3 min-h-[48px] text-sm font-bold uppercase tracking-widest bg-transparent border-0 border-b-2 border-brand-border/60 outline-none focus:border-brand-blue transition-colors cursor-pointer text-brand-deep-blue">
                            <option value="3d_lettering">3D Lettering</option>
                            <option value="lightbox">Lightbox</option>
                            <option value="standee">Standee</option>
                            <option value="vehicle_wrap">Vehicle Wrap</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="inquiry-qty1" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Quantity</label>
                          <input id="inquiry-qty1" type="number" {...register('inquiry.quantity' as any, { valueAsNumber: true })} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" />
                        </div>
                        <div>
                          <label htmlFor="inquiry-width" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Width (mm)</label>
                          <input id="inquiry-width" type="number" {...register('inquiry.width' as any, { valueAsNumber: true })} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" />
                        </div>
                        <div>
                          <label htmlFor="inquiry-height" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Height (mm)</label>
                          <input id="inquiry-height" type="number" {...register('inquiry.height' as any, { valueAsNumber: true })} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" />
                        </div>
                      </>
                    )}

                    {activeSlug === 'printing' && (
                      <>
                        <div className="sm:col-span-2">
                          <label htmlFor="inquiry-productType" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Product Type</label>
                          <input id="inquiry-productType" {...register('inquiry.productType' as any)} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" placeholder="E.G. BRANDED SHIRTS" />
                          {(errors as any)?.inquiry?.productType && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{(errors as any).inquiry.productType.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="inquiry-qty2" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Quantity</label>
                          <input id="inquiry-qty2" type="number" {...register('inquiry.quantity' as any, { valueAsNumber: true })} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" />
                        </div>
                        <div className="flex items-center gap-3 mt-4 sm:mt-6">
                          <input type="checkbox" id="hasArtwork" {...register('inquiry.hasArtwork' as any)} className="w-5 h-5 border-2 border-brand-border/60 accent-brand-blue" />
                          <label htmlFor="hasArtwork" className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue cursor-pointer">I have print-ready artwork</label>
                        </div>
                      </>
                    )}

                    {activeSlug === 'bowls' && (
                      <>
                        <div>
                          <label htmlFor="inquiry-sku" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Product SKU / Type</label>
                          <input id="inquiry-sku" {...register('inquiry.productSku' as any)} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" placeholder="E.G. BOWL-500ML" />
                          {(errors as any)?.inquiry?.productSku && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{(errors as any).inquiry.productSku.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="inquiry-qty3" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Quantity (MOQ 100)</label>
                          <input id="inquiry-qty3" type="number" {...register('inquiry.quantity' as any, { valueAsNumber: true })} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" />
                          {(errors as any)?.inquiry?.quantity && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{(errors as any).inquiry.quantity.message}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="inquiry-delivery" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Delivery Address</label>
                          <input id="inquiry-delivery" {...register('inquiry.deliveryAddr' as any)} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" placeholder="FULL ADDRESS" />
                          {(errors as any)?.inquiry?.deliveryAddr && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{(errors as any).inquiry.deliveryAddr.message}</p>}
                        </div>
                      </>
                    )}

                    {activeSlug === 'chemicals' && (
                      <>
                        <div className="sm:col-span-2">
                          <label htmlFor="inquiry-chemname" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Chemical Name</label>
                          <input id="inquiry-chemname" {...register('inquiry.productName' as any)} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" placeholder="E.G. SODIUM HYDROXIDE" />
                          {(errors as any)?.inquiry?.productName && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{(errors as any).inquiry.productName.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="inquiry-grade" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Grade</label>
                          <select id="inquiry-grade" {...register('inquiry.grade' as any)} className="w-full py-3 min-h-[48px] text-sm font-bold uppercase tracking-widest bg-transparent border-0 border-b-2 border-brand-border/60 outline-none focus:border-brand-blue transition-colors cursor-pointer text-brand-deep-blue">
                            <option value="industrial">Industrial</option>
                            <option value="lab">Laboratory</option>
                            <option value="food">Food</option>
                            <option value="pharmaceutical">Pharmaceutical</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="inquiry-qtykg" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Quantity (Kg/L)</label>
                          <input id="inquiry-qtykg" type="number" step="0.1" {...register('inquiry.quantityKg' as any, { valueAsNumber: true })} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue" />
                          {(errors as any)?.inquiry?.quantityKg && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{(errors as any).inquiry.quantityKg.message}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="inquiry-use" className="block text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/60 mb-1">Intended Use (Mandatory)</label>
                          <textarea id="inquiry-use" {...register('inquiry.intendedUse' as any)} className="w-full py-3 min-h-[48px] text-base font-bold bg-transparent border-0 border-b-2 outline-none transition-colors border-brand-border/60 text-brand-deep-blue focus:border-brand-blue h-20" placeholder="REQUIRED FOR REGULATORY COMPLIANCE" />
                          {(errors as any)?.inquiry?.intendedUse && <p className="text-brand-red text-[10px] uppercase font-bold tracking-widest mt-2">{(errors as any).inquiry.intendedUse.message}</p>}
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                          <input type="checkbox" id="hasHazmatExp" {...register('inquiry.hasHazmatExp' as any)} className="w-5 h-5 border-2 border-brand-border/60 accent-brand-blue" />
                          <label htmlFor="hasHazmatExp" className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue cursor-pointer">Facility is equipped for HAZMAT handling</label>
                        </div>
                      </>
                    )}

                  </div>
                </section>

                <section>
                  <FileUploadZone />
                </section>

              </form>
            )}

          </div>

          {/* Footer CTA */}
          {(status === 'idle' || status === 'submitting') && (
            <div className="p-4 border-t border-brand-border bg-brand-surface sticky bottom-0 z-10 flex justify-end">
              <button
                type="submit"
                form="quote-form"
                disabled={status === 'submitting'}
                className="w-full sm:w-auto px-10 py-4 min-h-[48px] bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-xs hover:bg-transparent hover:text-brand-deep-blue border-2 border-brand-deep-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  'Transmit Request'
                )}
              </button>
            </div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
