import { DivisionHero } from './DivisionHero';
import { DivisionContent } from './DivisionContent';
import { CrossDivisionLinks } from './CrossDivisionLinks';

interface DivisionLayoutProps {
  children: React.ReactNode;
  title: string;
  tagline: string;
  slug: string;
}

export function DivisionLayout({ children, title, tagline, slug }: DivisionLayoutProps) {
  return (
    <div className="flex flex-col w-full">
      <DivisionHero title={title} tagline={tagline} slug={slug} />
      <DivisionContent>
        {children}
        <CrossDivisionLinks currentSlug={slug} />
      </DivisionContent>
    </div>
  );
}
