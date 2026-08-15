import { FooterBrand } from './FooterBrand';
import { FooterLinks } from './FooterLinks';
import { FooterLegal } from './FooterLegal';

export function Footer() {
  return (
    <footer className="bg-brand-surface border-t-2 border-brand-deep-blue pt-12 pb-8 md:pt-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-12 border-b border-brand-border/30">
          <div className="md:col-span-5 lg:col-span-4">
            <FooterBrand />
          </div>
          <div className="md:col-span-7 lg:col-span-8 lg:ml-auto">
            <FooterLinks />
          </div>
        </div>
        <FooterLegal />
      </div>
    </footer>
  );
}
