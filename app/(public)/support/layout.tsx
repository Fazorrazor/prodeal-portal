import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Support & Complaints',
  description: 'Contact Prodeal Industries Ltd support desk in Ghana for order assistance, technical inquiries, or formal service feedback.',
  alternates: {
    canonical: 'https://www.prodealindustries.com/support',
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
