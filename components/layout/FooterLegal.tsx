import Link from 'next/link';

export function FooterLegal() {
  return (
    <div className="md:border-t md:border-brand-border/30 md:mt-12 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-[10px] text-brand-deep-blue/80 font-mono tracking-widest uppercase text-center md:text-left">
        &copy; {new Date().getFullYear()} Pro Deal Industries Limited All rights reserved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <Link href="/support" className="md:hidden text-[10px] font-bold text-brand-deep-blue hover:text-brand-blue transition-colors uppercase tracking-widest">Support</Link>
        <Link href="/privacy" className="text-[10px] text-brand-deep-blue/80 hover:text-brand-blue transition-colors uppercase tracking-widest">Privacy Policy</Link>
        <Link href="/terms" className="text-[10px] text-brand-deep-blue/80 hover:text-brand-blue transition-colors uppercase tracking-widest">Terms of Service</Link>
      </div>
    </div>
  );
}
