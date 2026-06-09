import { DivisionHero } from './DivisionHero';
import { DivisionContent } from './DivisionContent';

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
      </DivisionContent>
    </div>
  );
}
