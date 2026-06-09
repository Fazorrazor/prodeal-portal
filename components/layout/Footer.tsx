import { FooterBrand } from './FooterBrand';
import { FooterLinks } from './FooterLinks';
import { FooterLegal } from './FooterLegal';

export function Footer() {
  return (
    <footer className="bg-brand-surface border-t border-brand-border/30 pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-between">
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
