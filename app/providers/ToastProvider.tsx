'use client';

import { Toaster } from 'sonner';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" richColors />
      {children}
    </>
  );
}
