import type { Metadata } from 'next';
import './globals.css';
import { ZustandProvider } from './providers/ZustandProvider';
import { ToastProvider } from './providers/ToastProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import NextTopLoader from 'nextjs-toploader';
import { RfqTray } from '../components/shared/RfqTray';

import { Montserrat, Roboto } from 'next/font/google';

const montserrat = Montserrat({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
});

const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  preload: true,
});

const siteUrl = 'https://www.prodealindustries.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Prodeal Industries Ltd | Industrial Chemical Suppliers & Wholesale B2B',
    template: '%s | Prodeal Industries Ltd',
  },
  description:
    'Ghana\'s premier B2B supplier for Industrial Chemicals, Wholesale Disposable Bowls, 3D Signages, and Corporate Souvenirs. Request a quote today.',
  keywords: [
    'industrial chemical suppliers Ghana',
    'wholesale laboratory chemicals',
    'B2B supplier Accra',
    '3D signage makers Ghana',
    'corporate souvenirs Ghana',
    'wholesale disposable bowls in Ghana',
    'industrial chemicals Accra',
    'Prodeal Industries Ltd',
  ],
  authors: [{ name: 'Prodeal Industries Ltd', url: siteUrl }],
  creator: 'Prodeal Industries Ltd',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: siteUrl,
    siteName: 'Prodeal Industries Ltd',
    title: 'Prodeal Industries Ltd | Industrial Chemical Suppliers & B2B Wholesale',
    description:
      'Ghana\'s premier B2B industrial supplier. Industrial Chemicals, Wholesale Disposable Bowls, 3D Signages, and Souvenirs. Request a quote instantly.',
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
    title: 'Prodeal Industries Ltd | Industrial Chemical Suppliers & B2B Wholesale',
    description:
      'Ghana\'s premier B2B industrial supplier. Industrial Chemicals, Wholesale Disposable Bowls, 3D Signages, and Souvenirs.',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'LocalBusiness', 'WholesaleStore'],
              name: 'Pro Deal Industries',
              url: siteUrl,
              logo: `${siteUrl}/warehouse-icon.png`,
              image: `${siteUrl}/warehouse-icon.png`,
              description: "Ghana's premier B2B industrial supplier specializing in Industrial Chemicals, 3D Signages, Corporate Souvenirs, and Wholesale Disposable Bowls.",
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'GH',
                addressLocality: 'Accra',
                addressRegion: 'Greater Accra',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '5.6037', // General Accra coordinates, update if exact is known
                longitude: '-0.1870'
              },
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                areaServed: ['GH', 'West Africa'],
                availableLanguage: ['English'],
              },
              knowsAbout: [
                'Industrial Chemicals',
                'Laboratory Chemicals',
                'Wholesale Laboratory Chemicals',
                'Catering Disposables',
                'Wholesale Disposable Bowls in Ghana',
                'Eco-friendly Food Packaging',
                '3D Signages',
                'Corporate Branding',
                'Corporate Souvenirs',
                'Commercial Printing',
              ],
            }),
          }}
        />
        <NextTopLoader 
          color="#1A56DB"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1A56DB,0 0 5px #1A56DB"
          zIndex={1600}
          showAtBottom={false}
        />
        <ZustandProvider>
          <ToastProvider>
            {children}
            <RfqTray />
          </ToastProvider>
        </ZustandProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
