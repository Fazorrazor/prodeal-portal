import { Hero } from '../../components/home/Hero';
import { DivisionGrid } from '../../components/home/DivisionGrid';
import { TrustBadges } from '../../components/home/TrustBadges';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <TrustBadges />
      <DivisionGrid />
    </div>
  );
}
