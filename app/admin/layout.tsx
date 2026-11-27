import type { Metadata } from 'next';
import localFont from 'next/font/local';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
});

const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Prodeal Desk',
    template: '%s · Prodeal Desk',
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#F8FAFC] text-[#0A1628] antialiased selection:bg-[#1A56DB]/15 selection:text-[#0A1628]`}
      style={{
        fontFamily: 'var(--font-geist-sans), var(--font-montserrat), system-ui, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
