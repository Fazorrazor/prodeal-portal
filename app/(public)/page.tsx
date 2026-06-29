import { Hero } from '../../components/home/Hero';
import dynamic from 'next/dynamic';

const TrustBadges = dynamic(() => import('../../components/home/TrustBadges').then((mod) => mod.TrustBadges));
const DivisionGrid = dynamic(() => import('../../components/home/DivisionGrid').then((mod) => mod.DivisionGrid));

export const revalidate = 3600;
export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <TrustBadges />
      <DivisionGrid />
    </div>
  );
}
