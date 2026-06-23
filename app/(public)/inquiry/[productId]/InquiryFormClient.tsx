'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import { ContactDetailsSchema, DIVISION_SCHEMAS } from '../../../../lib/validators/inquiry';
import { submitInquiry } from '../../../../app/actions/submitInquiry';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';

interface InquiryFormClientProps {
  product: any;
  divisionSlug: string;
  defaultMoq: number;
}

function SuccessReceipt({ divisionSlug, phone, assignedPhone, trackingId }: { divisionSlug: string; phone: string; assignedPhone?: string | null; trackingId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  let displayPhone = assignedPhone || '233 (0) 54 000 0000';
  // If it's a local Ghana number, format it nicely for display
  if (displayPhone.startsWith('0') && displayPhone.length === 10) {
    displayPhone = `233 (0) ${displayPhone.substring(1, 3)} ${displayPhone.substring(3, 6)} ${displayPhone.substring(6)}`;
  }

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="flex flex-col py-6 md:py-8 h-full scroll-mt-32">
      <h3 className="font-heading font-bold text-3xl md:text-4xl text-brand-deep-blue mb-4 tracking-tighter uppercase">Inquiry Logged.</h3>
      
      <div className="border-l-2 border-brand-deep-blue pl-4 mb-8">
        <p className="text-sm font-bold text-brand-deep-blue/80 uppercase tracking-widest leading-relaxed mb-4">
          Your request has been prioritized and routed to our division specialists.
        </p>
        <p className="text-sm font-bold text-brand-deep-blue uppercase tracking-widest leading-relaxed">
          A representative will initiate contact via WhatsApp at <span className="text-brand-blue font-mono">{phone}</span> shortly to finalize your requirements.
        </p>
      </div>

      {/* Tracking ID Section */}
      <div className="bg-brand-deep-blue p-6 md:p-8 mb-8 border border-brand-deep-blue relative overflow-hidden">
        <AnimatedBorder direction="top" delay={0.1} />
        <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] mb-2">
          Your Booking Reference
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="font-mono text-2xl md:text-3xl font-bold text-white tracking-widest">
            {trackingId}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
          >
            {copied ? (
              <><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy ID</>
            )}
          </button>
        </div>
        <p className="text-xs font-medium text-white/80 mt-4 max-w-lg leading-relaxed">
          Save this code to check your inquiry status anytime at 
          <span className="font-bold text-white ml-1">prodealindustries.com/track</span>
        </p>
      </div>

      <div className="border-y-2 border-brand-deep-blue/20 py-6 mb-8 relative overflow-hidden bg-black/5 px-4 md:px-6">
        <AnimatedBorder direction="left" delay={0.2} />
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest mb-2 flex items-center gap-2">
            <AlertCircle className="w-3 h-3" /> Priority Support Escallation
          </p>
          <p className="text-xs font-bold text-brand-deep-blue/80 uppercase tracking-widest leading-relaxed">
            If you do not receive a response within 12 hours, please contact our priority line at <br/>
            <span className="font-mono text-brand-deep-blue text-sm mt-1 block">+{displayPhone}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.href = `/divisions/${divisionSlug}`}
        className="w-full sm:w-auto px-8 py-4 bg-brand-deep-blue text-white font-heading font-bold uppercase tracking-widest text-xs border-2 border-brand-deep-blue hover:bg-transparent hover:text-brand-deep-blue transition-colors self-start flex items-center justify-center gap-2"
      >
        Return to Catalog <ArrowRight className="w-4 h-4" />
      </button>
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
    return <SuccessReceipt divisionSlug={divisionSlug} phone={getValues('contact.phone')} assignedPhone={assignedPhone} trackingId={trackingId} />;
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
