'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { ContactDetailsSchema, DIVISION_SCHEMAS } from '../../../../lib/validators/inquiry';
import { submitInquiry } from '../../../../app/actions/submitInquiry';

interface InquiryFormClientProps {
  product: any;
  divisionSlug: string;
  defaultMoq: number;
}

function SuccessReceipt({ divisionSlug, trackingId }: { divisionSlug: string; trackingId: string }) {
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(100);
  const DURATION = 6000; // ms
  const INTERVAL = 50;   // ms

  // Auto-redirect countdown
  useEffect(() => {
    const step = (INTERVAL / DURATION) * 100;
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          window.location.href = `/divisions/${divisionSlug}`;
          return 0;
        }
        return next;
      });
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [divisionSlug]);

  const handleDismiss = () => {
    window.location.href = `/divisions/${divisionSlug}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-brand-deep-blue/60 backdrop-blur-sm px-0 sm:px-4 animate-in fade-in duration-300"
      onClick={handleDismiss}
    >
      {/* Modal panel — bottom sheet on mobile, centred box on desktop */}
      <div
        className="relative w-full sm:max-w-md bg-brand-surface border-t-4 sm:border-4 border-brand-deep-blue animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar — drains from full width to 0 */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-brand-border/30 overflow-hidden">
          <div
            className="h-full bg-brand-blue transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-6 pb-4 border-b border-brand-border/30">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-blue mb-1">
              Confirmed
            </p>
            <h3 className="font-heading font-bold text-2xl text-brand-deep-blue tracking-tighter leading-none">
              Inquiry Received.
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-brand-deep-blue/40 hover:text-brand-deep-blue transition-colors mt-0.5 p-1 -mr-1"
            aria-label="Close"
          >
            <span className="text-xl leading-none font-light">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-xs font-mono text-brand-deep-blue/60 uppercase tracking-widest leading-relaxed">
            A representative will reach you via WhatsApp shortly.
          </p>

          {/* Tracking ID block */}
          <div className="bg-brand-deep-blue px-4 py-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/50 mb-2">
              Reference ID
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-bold text-white tracking-wider truncate">
                {trackingId}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors border border-white/20 hover:border-white/50 px-2 py-1"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          </div>

          <p className="text-[10px] font-mono text-brand-deep-blue/40 leading-relaxed">
            Track your inquiry anytime at{' '}
            <span className="text-brand-deep-blue/60 font-bold">prodealindustries.com/track</span>
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pb-safe">
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-[0.2em] text-xs hover:bg-brand-blue transition-colors flex items-center justify-between px-5"
          >
            <span>Return to Catalog</span>
            <span className="text-white/50">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}


export function InquiryFormClient({ product, divisionSlug, defaultMoq }: InquiryFormClientProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [assignedPhone, setAssignedPhone] = useState<string | null>(null);

  const DivisionSpecificSchema = DIVISION_SCHEMAS[divisionSlug as keyof typeof DIVISION_SCHEMAS] || DIVISION_SCHEMAS.signages;

  const FormSchema = z.object({
    contact: ContactDetailsSchema,
    inquiry: DivisionSpecificSchema,
  });

  type FormData = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inquiry: {
        productId: product.id,
        productName: product.name,
      } as any
    }
  });

  const onSubmit = async (data: FormData) => {
    setStatus('submitting');

    const payload = {
      divisionSlug,
      contact: data.contact,
      inquiry: data.inquiry,
      fileIds: []
    };

    const result = await submitInquiry(payload);

    if (result.success && result.trackingId) {
      setStatus('success');
      setTrackingId(result.trackingId);
      if (result.assignedPhone) setAssignedPhone(result.assignedPhone);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return <SuccessReceipt divisionSlug={divisionSlug} trackingId={trackingId} />;
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-start justify-center py-12 h-full">
        <div className="w-16 h-16 bg-brand-red/10 flex items-center justify-center mb-6 border border-brand-red/30">
          <AlertCircle className="w-8 h-8 text-brand-red" />
        </div>
        <h3 className="font-heading font-bold text-3xl text-brand-deep-blue tracking-tighter uppercase mb-2">Submission Failed.</h3>
        <p className="text-xs font-bold text-brand-red mb-8 uppercase tracking-widest max-w-sm">
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
    );
  }

  // Common Brutalist Input Classes
  const inputClass = "w-full bg-transparent border-b-2 border-brand-border/60 rounded-none px-0 py-3 text-brand-deep-blue font-bold placeholder:text-brand-deep-blue/80 focus:outline-none focus:border-brand-blue transition-colors focus:ring-0";
  const labelClass = "block text-[10px] font-bold text-brand-deep-blue/80 uppercase tracking-widest mb-1";
  const errorClass = "text-[10px] text-brand-red font-bold tracking-widest uppercase mt-1";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'TEXTAREA') {
        if (!e.shiftKey) {
          e.preventDefault();
          e.currentTarget.requestSubmit();
        }
        return;
      }

      // Allow buttons to function normally
      if (target.tagName === 'BUTTON') {
        return;
      }

      e.preventDefault();
      
      const form = e.currentTarget;
      const elements = Array.from(form.elements) as HTMLElement[];
      const index = elements.indexOf(target);
      
      if (index > -1) {
        let nextElement = null;
        for (let i = index + 1; i < elements.length; i++) {
          const el = elements[i] as HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement;
          if (!el.disabled && el.tabIndex !== -1 && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'BUTTON')) {
            nextElement = el;
            break;
          }
        }
        
        if (nextElement) {
          if (nextElement.tagName === 'BUTTON' && (nextElement as HTMLButtonElement).type === 'submit') {
            form.requestSubmit();
          } else {
            nextElement.focus();
          }
        }
      }
    }
  };

  return (
    <>
      <div className="mb-10">
        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-2">
          — Submit your request
        </p>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-deep-blue uppercase tracking-tighter leading-none mb-4">
          Inquiry Details
        </h2>
        <div className="flex items-center gap-2 py-3 border-t border-b border-brand-border/40">
          <span className="text-brand-red font-mono font-bold text-sm leading-none">→</span>
          <span className="text-[10px] font-mono font-bold text-brand-deep-blue/80 uppercase tracking-[0.18em]">
            A representative will contact you via WhatsApp shortly
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-12 pb-24">
      
      {/* Honeypot Field (Bot Prevention) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="botcheck">Do not fill this out if you are human</label>
        <input id="botcheck" {...register('contact.botcheck')} tabIndex={-1} autoComplete="off" />
      </div>

      {/* Contact Details Section */}
      <div className="space-y-8">
        <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tight border-b-2 border-brand-deep-blue pb-2">
          1. Contact Credentials
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Full Name</label>
            <input {...register('contact.name')} className={inputClass} placeholder="John Doe" />
            {errors.contact?.name && <p className={errorClass}>{errors.contact.name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input {...register('contact.email')} type="email" inputMode="email" className={inputClass} placeholder="john@company.com" />
            {errors.contact?.email && <p className={errorClass}>{errors.contact.email.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone (WhatsApp Active)</label>
            <input {...register('contact.phone')} type="tel" inputMode="tel" className={inputClass} placeholder="+233541234567" defaultValue="+233" />
            {errors.contact?.phone && <p className={errorClass}>{errors.contact.phone.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Company (Optional)</label>
            <input {...register('contact.companyName')} className={inputClass} placeholder="Corp Ltd." />
          </div>
        </div>
      </div>

      {/* Request Details Section */}
      <div className="space-y-8">
        <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tight border-b-2 border-brand-deep-blue pb-2">
          2. Request Details
        </h3>
        <div>
          <label className={labelClass}>What do you need?</label>
          <textarea 
            {...register('inquiry.message')} 
            className={`${inputClass} min-h-[120px] resize-y leading-relaxed`} 
            placeholder="Please describe the specifics of your request, quantities, deadlines, or any other relevant details..." 
          />
          {/* @ts-ignore - Dynamic nested error access */}
          {errors.inquiry?.message && <p className={errorClass}>{errors.inquiry.message.message}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-8 border-t-2 border-brand-border/60">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full h-14 bg-brand-deep-blue text-white font-heading font-bold text-lg uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'submitting' ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
          ) : (
            'Submit Inquiry'
          )}
        </button>
      </div>
      </form>
    </>
  );
}
