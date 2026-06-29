import { DivisionHero } from './DivisionHero';
import { DivisionContent } from './DivisionContent';
import { CrossDivisionLinks } from './CrossDivisionLinks';
import { DivisionServiceJsonLd } from '../shared/JsonLd';

interface DivisionLayoutProps {
  children: React.ReactNode;
  title: string;
  tagline: string;
  slug: string;
}

export function DivisionLayout({ children, title, tagline, slug }: DivisionLayoutProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';
  return (
    <div className="flex flex-col w-full">
      <DivisionServiceJsonLd title={title} tagline={tagline} slug={slug} siteUrl={siteUrl} />
      <DivisionHero title={title} tagline={tagline} slug={slug} />
      <DivisionContent>
        {children}
        <CrossDivisionLinks currentSlug={slug} />
      </DivisionContent>
    </div>
  );
}
