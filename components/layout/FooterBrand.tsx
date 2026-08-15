import { NavLogo } from './NavLogo';

export function FooterBrand() {
  return (
    <div className="flex flex-col gap-4">
      <NavLogo />
      <p className="text-brand-deep-blue/80 max-w-xs mt-2 text-sm leading-relaxed font-mono tracking-widest uppercase text-[10px]">
        Direct Access Portal: Industrial Chemicals & Catering Disposables.
      </p>

      <div className="mt-4 border-t border-brand-border/30 pt-4 max-w-xs">
        <p className="font-heading font-bold text-brand-deep-blue text-[11px] uppercase tracking-widest mb-2">Headquarters</p>
        <address className="text-[10px] font-mono text-brand-deep-blue/70 not-italic uppercase tracking-widest leading-relaxed">
          19B Coconut Rd<br />
          Gbawe, Accra, Ghana<br />
          <a href="https://maps.google.com/?q=Prodeal+Systems+LTD,+19B+Coconut+Rd,+Gbawe,+Accra,+Ghana" target="_blank" rel="noreferrer" className="text-brand-blue hover:text-brand-deep-blue transition-colors mt-2 inline-flex items-center gap-1 border-b border-brand-blue/30 pb-0.5">
            View on Map <span>↗</span>
          </a>
        </address>
      </div>
    </div>
  );
}
