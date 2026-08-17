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

import { useRouter } from 'next/navigation';


export function InquiryFormClient({ product, divisionSlug, defaultMoq }: InquiryFormClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
      router.push(`/inquiry/success?trackingId=${result.trackingId}&divisionSlug=${divisionSlug}`);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-full">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4 opacity-50" />
        <p className="text-sm font-medium text-brand-deep-blue/70">Redirecting to receipt...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-start justify-center py-12 h-full">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-display font-medium text-3xl text-brand-deep-blue tracking-tight mb-2">Submission Failed.</h3>
        <p className="text-sm text-red-500 mb-8 max-w-sm">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="px-6 py-3 bg-red-50 text-red-600 font-medium text-sm rounded-md hover:bg-red-100 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Minimalist Input Classes
  const inputClass = "w-full bg-white border border-brand-border/40 rounded-xl px-4 py-3 text-sm text-brand-deep-blue font-medium placeholder:text-brand-deep-blue/40 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all shadow-sm";
  const labelClass = "block text-xs font-medium text-brand-deep-blue/70 mb-1.5";
  const errorClass = "text-[10px] text-red-500 font-medium mt-1";

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
        <p className="text-[10px] font-mono font-medium tracking-widest text-brand-deep-blue/60 mb-2">
          — Submit your request
        </p>
        <h2 className="font-display font-medium text-3xl sm:text-4xl text-brand-deep-blue tracking-tight leading-none mb-4">
          Inquiry Details
        </h2>
        <div className="flex items-center gap-2 py-3 border-t border-b border-brand-border/20">
          <span className="text-brand-blue font-mono font-bold text-sm leading-none">→</span>
          <span className="text-xs font-medium text-brand-deep-blue/70">
            Guaranteed response via WhatsApp within 2 hours
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
      <div className="space-y-6">
        <h3 className="font-display font-medium text-xl text-brand-deep-blue tracking-tight border-b border-brand-border/20 pb-2">
          1. Contact Details
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
      <div className="space-y-6">
        <h3 className="font-display font-medium text-xl text-brand-deep-blue tracking-tight border-b border-brand-border/20 pb-2">
          2. Request Details
        </h3>
        <div>
          <label className={labelClass}>What do you need?</label>
          <textarea 
            {...register('inquiry.message')} 
            className={`${inputClass} min-h-[120px] resize-none leading-relaxed`} 
            placeholder="Please describe the specifics of your request, quantities, deadlines, or any other relevant details..." 
          />
          {/* @ts-ignore - Dynamic nested error access */}
          {errors.inquiry?.message && <p className={errorClass}>{errors.inquiry.message.message}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-8 border-t border-brand-border/20">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full h-14 bg-brand-blue text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg hover:bg-brand-deep-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
