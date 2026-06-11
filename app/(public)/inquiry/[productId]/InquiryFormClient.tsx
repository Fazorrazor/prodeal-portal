'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AlertCircle, Copy, ArrowRight } from 'lucide-react';
import { ContactDetailsSchema, DIVISION_SCHEMAS } from '../../../../lib/validators/inquiry';
import { submitInquiry } from '../../../../app/actions/submitInquiry';
import { FileUploadZone } from '../../../../components/quote-builder/FileUploadZone';
import { UploadedFile } from '../../../../store/quoteStore';
import { useScrambleText } from '../../../../lib/hooks/useScrambleText';
import { AnimatedBorder } from '../../../../components/admin/AnimatedBorder';
import { toast } from 'sonner';

interface InquiryFormClientProps {
  product: any;
  divisionSlug: string;
  defaultMoq: number;
}

function TrackingReceipt({ trackingId, divisionSlug }: { trackingId: string; divisionSlug: string }) {
  const { displayText } = useScrambleText(trackingId, 200, 1500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smoothly scroll this component into view, which automatically handles
    // the fact that this right column is an overflow-y-auto scrolling container.
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingId);
    toast.success('Copied to clipboard!');
  };

  return (
    <div ref={containerRef} className="flex flex-col py-6 md:py-8 h-full scroll-mt-32">
      <h3 className="font-heading font-bold text-3xl md:text-4xl text-brand-deep-blue mb-4 tracking-tighter uppercase">Inquiry Logged.</h3>
      <p className="text-xs font-bold text-brand-red/80 mb-8 uppercase tracking-widest leading-relaxed border-l-2 border-brand-red pl-4">
        Your data has been successfully routed to our specialists via WhatsApp.
        Retain the following code to track progress via the tracking portal.
      </p>

      <div className="border-y-2 border-brand-deep-blue/20 py-6 mb-8 flex items-center justify-between relative overflow-hidden bg-black/5 px-4 md:px-6">
        <AnimatedBorder direction="left" delay={0.2} />
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-1">Decrypted Tracking UUID</p>
          <span className="font-mono font-bold text-xl md:text-2xl text-brand-deep-blue tracking-tight">
            {displayText}
          </span>
        </div>
        <button type="button" onClick={copyTracking} className="p-3 bg-brand-deep-blue text-white hover:bg-brand-blue transition-colors relative z-10" aria-label="Copy tracking ID">
          <Copy className="w-5 h-5" />
        </button>
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const DivisionSpecificSchema = DIVISION_SCHEMAS[divisionSlug as keyof typeof DIVISION_SCHEMAS] || DIVISION_SCHEMAS.signages;

  const FormSchema = z.object({
    contact: ContactDetailsSchema,
    inquiry: DivisionSpecificSchema,
  });

  type FormData = z.infer<typeof FormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      inquiry: {
        productId: product.id,
        productName: product.name,
        quantity: defaultMoq,
        // Set safe defaults to prevent mount errors
        ...(divisionSlug === 'signages' ? { width: 1000, height: 500, signType: '3d_signage' } : {}),
        ...(divisionSlug === 'chemicals' ? { quantityKg: defaultMoq } : {}),
      } as any
    }
  });

  const onSubmit = async (data: FormData) => {
    setStatus('submitting');

    const payload = {
      divisionSlug,
      contact: data.contact,
      inquiry: data.inquiry,
      fileIds: uploadedFiles.map(f => f.url)
    };

    const result = await submitInquiry(payload);

    if (result.success && result.trackingId) {
      setStatus('success');
      setTrackingId(result.trackingId);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong.');
    }
  };

  const handleAddFile = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (url: string) => {
    setUploadedFiles(prev => prev.filter(f => f.url !== url));
  };

  if (status === 'success' && trackingId) {
    return <TrackingReceipt trackingId={trackingId} divisionSlug={divisionSlug} />;
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
  const inputClass = "w-full bg-transparent border-b-2 border-brand-border/60 rounded-none px-0 py-3 text-brand-deep-blue font-bold placeholder:text-brand-deep-blue/20 focus:outline-none focus:border-brand-blue transition-colors focus:ring-0";
  const labelClass = "block text-[10px] font-bold text-brand-deep-blue/60 uppercase tracking-widest mb-1";
  const errorClass = "text-[10px] text-brand-red font-bold tracking-widest uppercase mt-1";

  return (
    <>
      <div className="mb-12">
        <h2 className="font-heading font-bold text-3xl text-brand-deep-blue uppercase tracking-tight mb-2">
          Inquiry Details
        </h2>
        <p className="text-xs font-bold text-brand-red/80 uppercase tracking-widest">
          Please provide the specifications below. A representative will contact you via WhatsApp shortly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-24">
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

      {/* Product Specific Requirements */}
      <div className="space-y-8">
        <h3 className="font-heading font-bold text-xl text-brand-deep-blue uppercase tracking-tight border-b-2 border-brand-deep-blue pb-2">
          2. Specifications
        </h3>

        {/* Signages specific fields */}
        {divisionSlug === 'signages' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Width (mm)</label>
              <input {...register('inquiry.width', { valueAsNumber: true })} type="number" inputMode="numeric" className={inputClass} />
              {(errors.inquiry as any)?.width && <p className={errorClass}>{(errors.inquiry as any).width.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Height (mm)</label>
              <input {...register('inquiry.height', { valueAsNumber: true })} type="number" inputMode="numeric" className={inputClass} />
              {(errors.inquiry as any)?.height && <p className={errorClass}>{(errors.inquiry as any).height.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input {...register('inquiry.quantity', { valueAsNumber: true })} type="number" inputMode="numeric" className={inputClass} />
              {(errors.inquiry as any)?.quantity && <p className={errorClass}>{(errors.inquiry as any).quantity.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Material Preference</label>
              <input {...register('inquiry.materialPref')} className={inputClass} placeholder="e.g. Acrylic, Metal" />
            </div>
          </div>
        )}

        {/* Printing specific fields */}
        {divisionSlug === 'printing' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Quantity</label>
              <input {...register('inquiry.quantity', { valueAsNumber: true })} type="number" inputMode="numeric" className={inputClass} />
              {(errors.inquiry as any)?.quantity && <p className={errorClass}>{(errors.inquiry as any).quantity.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Print Sides</label>
              <select {...register('inquiry.printSides')} className={inputClass}>
                <option value="single">Single Sided</option>
                <option value="double">Double Sided</option>
                <option value="all_over">All Over Print</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 py-2">
              <input type="checkbox" {...register('inquiry.hasArtwork')} id="hasArtwork" className="w-5 h-5 text-brand-deep-blue focus:ring-brand-blue border-brand-border" />
              <label htmlFor="hasArtwork" className="text-sm font-bold text-brand-deep-blue uppercase tracking-widest cursor-pointer">I have print-ready artwork</label>
            </div>
          </div>
        )}

        {/* Bowls specific fields */}
        {divisionSlug === 'bowls' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Quantity</label>
              <input {...register('inquiry.quantity', { valueAsNumber: true })} type="number" inputMode="numeric" className={inputClass} />
              {(errors.inquiry as any)?.quantity && <p className={errorClass}>{(errors.inquiry as any).quantity.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Delivery Address</label>
              <input {...register('inquiry.deliveryAddr')} className={inputClass} placeholder="Full address for delivery" />
              {(errors.inquiry as any)?.deliveryAddr && <p className={errorClass}>{(errors.inquiry as any).deliveryAddr.message}</p>}
            </div>
          </div>
        )}

        {/* Chemicals specific fields */}
        {divisionSlug === 'chemicals' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Quantity (KG)</label>
              <input {...register('inquiry.quantityKg', { valueAsNumber: true })} type="number" inputMode="numeric" className={inputClass} />
              {(errors.inquiry as any)?.quantityKg && <p className={errorClass}>{(errors.inquiry as any).quantityKg.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Grade Requirement</label>
              <select {...register('inquiry.grade')} className={inputClass}>
                <option value="industrial">Industrial Grade</option>
                <option value="lab">Laboratory Grade</option>
                <option value="food">Food Grade</option>
                <option value="pharmaceutical">Pharmaceutical Grade</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Intended Use (Compliance Requirement)</label>
              <textarea {...register('inquiry.intendedUse')} className={`${inputClass} resize-none`} rows={2} placeholder="Please describe the intended application..." />
              {(errors.inquiry as any)?.intendedUse && <p className={errorClass}>{(errors.inquiry as any).intendedUse.message}</p>}
            </div>
            <div className="sm:col-span-2 flex items-center gap-3 py-2">
              <input type="checkbox" {...register('inquiry.hasHazmatExp')} id="hasHazmatExp" className="w-5 h-5 text-brand-deep-blue focus:ring-brand-blue border-brand-border" />
              <label htmlFor="hasHazmatExp" className="text-sm font-bold text-brand-deep-blue uppercase tracking-widest cursor-pointer">Facility handles Hazmat materials</label>
            </div>
          </div>
        )}

        {/* Global Notes */}
        <div className="pt-4">
          <label className={labelClass}>Additional Requirements (Optional)</label>
          <textarea {...register('inquiry.notes')} className={`${inputClass} resize-none`} rows={2} placeholder="Any specific details we should know?" />
        </div>
      </div>

      {/* Attachments Section for Signages/Printing */}
      {(divisionSlug === 'signages' || divisionSlug === 'printing') && (
        <FileUploadZone
          uploadedFiles={uploadedFiles}
          onAddFile={handleAddFile}
          onRemoveFile={handleRemoveFile}
          divisionSlug={divisionSlug}
        />
      )}

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
