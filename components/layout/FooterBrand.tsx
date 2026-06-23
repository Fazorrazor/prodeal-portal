import { NavLogo } from './NavLogo';

export function FooterBrand() {
  return (
    <div className="flex flex-col gap-4">
      <NavLogo />
      <p className="text-brand-deep-blue/80 max-w-xs mt-2 text-sm leading-relaxed">
        Built for Industry. Delivered with Precision. Prodeal Industries Ltd. handles large-scale B2B orders with unmatched reliability.
      </p>
    </div>
  );
}
