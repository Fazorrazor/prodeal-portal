// Force rebuild
import { Suspense } from 'react';
import SuccessReceiptClient from './SuccessReceiptClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inquiry Received',
  description: 'Your inquiry has been successfully submitted to Prodeal Industries Ltd.',
};

export default function InquirySuccessPage() {
  return (
    <div className="min-h-screen bg-brand-surface pt-[10vh] pb-8">
      <Suspense fallback={
        <div className="w-full max-w-7xl mx-auto px-4 py-6 text-center">
          <h1 className="font-display font-medium text-3xl text-brand-deep-blue tracking-tight mb-4">Inquiry Received</h1>
          <p className="font-mono text-brand-deep-blue text-xs uppercase tracking-widest animate-pulse">Loading Confirmation...</p>
        </div>
      }>
        <SuccessReceiptClient />
      </Suspense>
    </div>
  );
}
