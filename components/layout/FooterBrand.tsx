import { NavLogo } from './NavLogo';

export function FooterBrand() {
  return (
    <div className="flex flex-col gap-4">
      <NavLogo theme="dark" />
      <p className="text-brand-surface/80 max-w-xs mt-2 text-sm leading-relaxed font-mono tracking-widest uppercase text-[10px]">
        Direct Access Portal: Industrial Chemicals & Catering Disposables.
      </p>

      <div className="mt-4 border-t border-brand-surface/20 pt-4 max-w-xs">
        <p className="font-heading font-bold text-white text-[11px] uppercase tracking-widest mb-2">Headquarters</p>
        <address className="text-[10px] font-mono text-brand-surface/70 not-italic uppercase tracking-widest leading-relaxed">
          19B Coconut Rd<br />
          Gbawe, Accra, Ghana<br />
          <a href="https://maps.google.com/?q=Prodeal+Systems+LTD,+19B+Coconut+Rd,+Gbawe,+Accra,+Ghana" target="_blank" rel="noreferrer" className="text-brand-blue hover:text-white transition-colors mt-2 inline-flex items-center gap-1 border-b border-brand-blue/30 pb-0.5">
            View on Map <span>↗</span>
          </a>
        </address>
      </div>

      <div className="mt-6 border-t border-brand-surface/20 pt-6 max-w-xs">
        <p className="font-heading font-bold text-brand-surface/60 text-[11px] uppercase tracking-widest mb-3">Reach Us On</p>
        <div className="flex flex-col gap-1">
          <a href="tel:+233551908713" className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white hover:text-brand-blue transition-colors">
            0551908713
          </a>
          <a href="mailto:prodealsystems@hotmail.com" className="text-xs sm:text-sm font-mono font-bold tracking-wider text-white hover:text-brand-blue transition-colors mt-1">
            PRODEALSYSTEMS@HOTMAIL.COM
          </a>
        </div>
      </div>
    </div>
  );
}
