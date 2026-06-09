import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { ZustandProvider } from './providers/ZustandProvider';
import { ToastProvider } from './providers/ToastProvider';
import { QuoteBuilderModal } from '../components/quote-builder/QuoteBuilderModal';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
});

export const metadata: Metadata = {
  title: 'Pro Deal Industries',
  description: 'Built for Industry. Delivered with Precision.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable} ${ibmPlexSans.variable}`}>
      <body className="font-body bg-brand-surface text-brand-deep-blue antialiased">
        <ZustandProvider>
          <ToastProvider>
            {children}
            <QuoteBuilderModal />
          </ToastProvider>
        </ZustandProvider>
      </body>
    </html>
  );
}
