'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, Building2, FlaskConical, PackageOpen, LayoutTemplate } from 'lucide-react';
import { ContactDetailsSchema, DIVISION_SCHEMAS } from '../../../lib/validators/inquiry';
import { submitInquiry } from '../../../app/actions/submitInquiry';
import { useRouter } from 'next/navigation';

const DIVISIONS = [
  { id: 'chemicals', label: 'Industrial Chemicals', icon: FlaskConical },
  { id: 'bowls', label: 'Wholesale Disposables', icon: PackageOpen },
  { id: 'signages', label: '3D Signages', icon: LayoutTemplate },
  { id: 'printing', label: 'Corporate Printing', icon: Building2 },
];

interface Product {
  id: string;
  name: string;
  divisions: { slug: string } | { slug: string }[];
}

export function GenericInquiryClient({ products = [] }: { products?: Product[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('chemicals');

  const DivisionSpecificSchema = DIVISION_SCHEMAS[selectedDivision as keyof typeof DIVISION_SCHEMAS] || DIVISION_SCHEMAS.chemicals;

  const FormSchema = z.object({
    contact: ContactDetailsSchema,
    inquiry: DivisionSpecificSchema,
  });

  type FormData = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inquiry: {}
    }
  });

  const divisionProducts = products.filter(p => {
    const slugs = Array.isArray(p.divisions) ? p.divisions.map(d => d.slug) : [p.divisions.slug];
    return slugs.includes(selectedDivision);
  });

  // Watch selected product to update productName
  const selectedProductId = watch('inquiry.productId' as any);
  
  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivision(divisionId);
    setValue('inquiry.productId' as any, '');
    setValue('inquiry.productName' as any, '');
  };

  const onSubmit = async (data: FormData) => {
    setStatus('submitting');

    const payload = {
      divisionSlug: selectedDivision,
      contact: data.contact,
      inquiry: {
        ...data.inquiry,
        ...(selectedProductId ? { 
          productId: selectedProductId,
          productName: divisionProducts.find(p => p.id === selectedProductId)?.name || ''
        } : {})
      },
      fileIds: []
    };

    const result = await submitInquiry(payload);

    if (result.success && result.trackingId) {
      router.push(`/inquiry/success?trackingId=${result.trackingId}&divisionSlug=${selectedDivision}`);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-full">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4" />
        <p className="text-xs font-mono font-bold text-brand-deep-blue uppercase tracking-widest">Redirecting to receipt...</p>
      </div>
    );
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

  const inputClass = "w-full bg-transparent border-b border-brand-border/60 rounded-none px-0 py-1.5 text-brand-deep-blue font-bold text-sm placeholder:text-brand-deep-blue/60 focus:outline-none focus:border-brand-blue transition-colors focus:ring-0";
  const labelClass = "block text-[9px] font-bold text-brand-deep-blue/70 uppercase tracking-widest mb-0.5";
  const errorClass = "text-[9px] text-brand-red font-bold tracking-widest uppercase mt-0.5";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-[5%] pb-6 min-h-[calc(100vh-60px)] flex flex-col justify-start transform scale-[1.02] origin-top">
      <div className="mb-4">
        <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-brand-deep-blue/80 mb-2">
          — General Inquiry
        </p>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-deep-blue uppercase tracking-tighter leading-none mb-2">
          Request a Quote
        </h1>
        <p className="text-brand-deep-blue/70 max-w-2xl text-xs lg:text-sm mb-2">
          Select a division and provide your details below. Our team guarantees a response via WhatsApp within 2 hours.
        </p>
        <div className="flex items-center gap-2 py-1 border-t border-b border-brand-border/40">
          <span className="text-brand-red font-mono font-bold text-xs leading-none">→</span>
          <span className="text-[9px] font-mono font-bold text-brand-deep-blue/80 uppercase tracking-[0.18em]">
            B2B Commercial & Industrial Supply Only
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Honeypot Field (Bot Prevention) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="botcheck">Do not fill this out if you are human</label>
          <input id="botcheck" {...register('contact.botcheck')} tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          
          {/* Division Selection */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm lg:text-base text-brand-deep-blue uppercase tracking-tight border-b-2 border-brand-deep-blue pb-1">
              1. Select Division
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DIVISIONS.map((division) => {
                const Icon = division.icon;
                const isSelected = selectedDivision === division.id;
                return (
                  <button
                    key={division.id}
                    type="button"
                    onClick={() => handleDivisionChange(division.id)}
                    className={`flex flex-col items-start gap-2 p-2 lg:p-3 border transition-colors text-left ${
                      isSelected 
                        ? 'border-brand-blue bg-brand-blue/5' 
                        : 'border-brand-border/30 hover:border-brand-blue/50'
                    }`}
                  >
                    <div className={`p-2 ${isSelected ? 'bg-brand-blue text-white' : 'bg-brand-border/10 text-brand-deep-blue'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-brand-deep-blue text-xs uppercase tracking-tight leading-tight">{division.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-sm lg:text-base text-brand-deep-blue uppercase tracking-tight border-b-2 border-brand-deep-blue pb-1">
              2. Contact Details
            </h3>
            <div className="grid grid-cols-1 gap-3">
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
          <div className="space-y-4 flex flex-col h-full">
            <h3 className="font-heading font-bold text-sm lg:text-base text-brand-deep-blue uppercase tracking-tight border-b-2 border-brand-deep-blue pb-1">
              3. Request Details
            </h3>
            
            {divisionProducts.length > 0 ? (
              <div>
                <label className={labelClass}>Select Product (Optional)</label>
                <select 
                  {...register('inquiry.productId' as any)} 
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">General Inquiry</option>
                  {divisionProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-brand-border/5 p-2 border border-brand-border/20">
                <p className="text-[10px] font-mono text-brand-deep-blue/80 leading-relaxed">
                  Catalog updating. <span className="font-bold text-brand-deep-blue">Describe custom request below.</span>
                </p>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              <label className={labelClass}>What do you need?</label>
              <textarea 
                {...register('inquiry.message')} 
                className={`${inputClass} flex-1 min-h-[60px] resize-none leading-relaxed py-1 text-xs`} 
                placeholder="Specifics of your request, quantities..." 
              />
              {/* @ts-ignore - Dynamic nested error access */}
              {errors.inquiry?.message && <p className={errorClass}>{errors.inquiry.message.message}</p>}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4 mt-auto">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full h-10 bg-brand-deep-blue text-white font-heading font-bold text-sm uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing</>
                ) : (
                  'Submit Inquiry'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
