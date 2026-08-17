import { NavLogo } from './NavLogo';

export function FooterBrand() {
  return (
    <div className="flex flex-col gap-4">
      <NavLogo theme="dark" />
      <p className="text-white/70 max-w-xs mt-2 text-sm leading-relaxed font-medium">
        Direct Access Portal: Industrial Chemicals & Catering Disposables.
      </p>

      <div className="mt-4 border-t border-brand-surface/10 pt-4 max-w-xs">
        <p className="font-display font-medium text-white text-base tracking-tight mb-2">Headquarters</p>
        <address className="text-sm font-medium text-white/60 not-italic leading-relaxed">
          19B Coconut Rd<br />
          Gbawe, Accra, Ghana<br />
          <a href="https://maps.google.com/?q=Prodeal+Systems+LTD,+19B+Coconut+Rd,+Gbawe,+Accra,+Ghana" target="_blank" rel="noreferrer" className="text-brand-blue hover:text-white transition-colors mt-2 inline-flex items-center gap-1 border-b border-brand-blue/30 pb-0.5">
            View on Map <span>↗</span>
          </a>
        </address>
      </div>

      <div className="mt-6 border-t border-brand-surface/10 pt-6 max-w-xs">
        <p className="font-display font-medium text-white/80 text-base tracking-tight mb-3">Reach Us On</p>
        <div className="flex flex-col gap-1">
          <a href="tel:+233551908713" className="text-xl sm:text-2xl font-medium tracking-tight text-white hover:text-brand-blue transition-colors">
            0551908713
          </a>
          <a href="mailto:prodealsystems@hotmail.com" className="text-sm font-medium text-white/70 hover:text-brand-blue transition-colors mt-1">
            prodealsystems@hotmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
