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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pro Deal Industries Limited | Industrial B2B Supplier in Ghana',
    template: '%s | Pro Deal Industries Limited',
  },
  description:
    'Pro Deal Industries Limited is Ghana\'s premier B2B industrial supplier, offering 3D Signages, Souvenirs & Printing, Disposable Bowls, and Industrial Chemicals. Request a quote today.',
  keywords: [
    'industrial supplier Ghana',
    'B2B supplier Accra',
    '3D signage Ghana',
    'corporate souvenirs Ghana',
    'disposable bowls bulk Ghana',
    'industrial chemicals Ghana',
    'Pro Deal Industries Limited',
  ],
  authors: [{ name: 'Pro Deal Industries Limited', url: siteUrl }],
  creator: 'Pro Deal Industries Limited',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: siteUrl,
    siteName: 'Pro Deal Industries Limited',
    title: 'Pro Deal Industries Limited | Industrial B2B Supplier in Ghana',
    description:
      'Ghana\'s premier B2B industrial supplier. 3D Signages, Souvenirs, Disposable Bowls, and Industrial Chemicals. Request a quote instantly.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Pro Deal Industries Limited — Built for Industry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pro Deal Industries Limited | Industrial B2B Supplier in Ghana',
    description:
      'Ghana\'s premier B2B industrial supplier. 3D Signages, Souvenirs, Disposable Bowls, and Industrial Chemicals.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
