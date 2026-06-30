import Link from 'next/link';

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center py-2 sm:p-2 sm:-ml-2 group transition-opacity">
      <span className="font-display text-base sm:text-xl md:text-3xl flex items-baseline tracking-tighter whitespace-nowrap">
        <strong className="font-extrabold text-brand-deep-blue mr-1.5 uppercase">Prodeal</strong>
        <span className="font-light text-brand-blue uppercase">Systems Ltd</span>
        <span className="text-brand-red font-extrabold">.</span>
      </span>
    </Link>
  );
}
