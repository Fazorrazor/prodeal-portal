import { NavLogo } from './NavLogo';

export function FooterBrand() {
  return (
    <div className="flex flex-col gap-4">
      <NavLogo />
      <p className="text-brand-deep-blue/80 max-w-xs mt-2 text-sm leading-relaxed font-mono tracking-widest uppercase text-xs">
        Direct Access Portal: Industrial Chemicals & Catering Disposables.
      </p>
    </div>
  );
}
