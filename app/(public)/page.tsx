import { Hero } from '../../components/home/Hero';
import dynamic from 'next/dynamic';
import { OrganizationJsonLd } from '../../components/shared/JsonLd';

const TrustBadges = dynamic(() => import('../../components/home/TrustBadges').then((mod) => mod.TrustBadges));
const DivisionGrid = dynamic(() => import('../../components/home/DivisionGrid').then((mod) => mod.DivisionGrid));

export const revalidate = 3600;
export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';
  return (
    <div className="flex flex-col w-full">
      <OrganizationJsonLd siteUrl={siteUrl} />
      <Hero />
      <TrustBadges />
      <DivisionGrid />
    </div>
  );
}
