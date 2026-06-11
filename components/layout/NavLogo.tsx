import Link from 'next/link';

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center p-2 -ml-2 group transition-opacity hover:opacity-80">
      <span className="font-display text-2xl md:text-3xl flex items-baseline tracking-tighter">
        <strong className="font-extrabold text-brand-deep-blue mr-1.5">Prodeal</strong>
        <span className="font-light text-brand-blue">SYSTEMS</span>
        <span className="text-brand-red font-extrabold">.</span>
      </span>
    </Link>
  );
}
