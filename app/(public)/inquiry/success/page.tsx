// Force rebuild
import { Suspense } from 'react';
import SuccessReceiptClient from './SuccessReceiptClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inquiry Received | Prodeal Industries',
  robots: { index: false, follow: false },
};

export default function InquirySuccessPage() {
  return (
    <div className="min-h-screen bg-brand-surface pt-[10vh] pb-8">
      <Suspense fallback={<div className="font-mono text-brand-deep-blue text-xs uppercase tracking-widest animate-pulse p-8">Loading Confirmation...</div>}>
        <SuccessReceiptClient />
      </Suspense>
    </div>
  );
}
