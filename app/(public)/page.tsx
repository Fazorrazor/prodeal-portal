import { Hero } from '../../components/home/Hero';
import { DivisionGrid } from '../../components/home/DivisionGrid';
import { TrustBadges } from '../../components/home/TrustBadges';

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
