import type { Metadata } from 'next';
import './globals.css';
import { ZustandProvider } from './providers/ZustandProvider';
import { ToastProvider } from './providers/ToastProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { Montserrat, Roboto } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prodeal Industries Ltd.',
  description: 'Built for Industry. Delivered with Precision.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-body bg-brand-surface text-brand-deep-blue antialiased" suppressHydrationWarning>
        <ZustandProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ZustandProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
