import { FooterBrand } from './FooterBrand';
import { FooterLinks } from './FooterLinks';
import { FooterLegal } from './FooterLegal';

export function Footer() {
  return (
    <footer className="bg-brand-surface border-t-2 border-brand-deep-blue py-6 md:pt-16 md:pb-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="hidden md:grid md:grid-cols-2 gap-12 justify-between">
          <FooterBrand />
          <div className="md:ml-auto">
            <FooterLinks />
          </div>
        </div>
        <FooterLegal />
      </div>
    </footer>
  );
}
