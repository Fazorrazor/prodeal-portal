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

let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';
if (!siteUrl.startsWith('http')) {
  siteUrl = 'https://prodealindustries.com'; // Fallback if $VERCEL_URL or invalid URL is provided without protocol
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Prodeal Industries Ltd | Industrial B2B Supplier in Ghana',
    template: '%s | Prodeal Industries Ltd',
  },
  description:
    'Prodeal Industries Ltd is Ghana\'s premier B2B industrial supplier, offering 3D Signages, Souvenirs & Printing, Disposable Bowls, and Industrial Chemicals. Request a quote today.',
  keywords: [
    'industrial supplier Ghana',
    'B2B supplier Accra',
    '3D signage Ghana',
    'corporate souvenirs Ghana',
    'disposable bowls bulk Ghana',
    'industrial chemicals Ghana',
    'Prodeal Industries Ltd',
  ],
  authors: [{ name: 'Prodeal Industries Ltd', url: siteUrl }],
  creator: 'Prodeal Industries Ltd',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: siteUrl,
    siteName: 'Prodeal Industries Ltd',
    title: 'Prodeal Industries Ltd | Industrial B2B Supplier in Ghana',
    description:
      'Ghana\'s premier B2B industrial supplier. 3D Signages, Souvenirs, Disposable Bowls, and Industrial Chemicals. Request a quote instantly.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Prodeal Industries Ltd — Built for Industry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prodeal Industries Ltd | Industrial B2B Supplier in Ghana',
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
