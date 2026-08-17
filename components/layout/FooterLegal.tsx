import Link from 'next/link';

export function FooterLegal() {
  return (
    <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <p className="text-[10px] text-brand-surface/60 font-mono tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Prodeal Industries Ltd. All rights reserved.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/privacy" className="text-[10px] font-bold text-brand-surface hover:text-white transition-colors uppercase tracking-widest">Privacy Policy</Link>
        <Link href="/terms" className="text-[10px] font-bold text-brand-surface hover:text-white transition-colors uppercase tracking-widest">Terms of Service</Link>
        <Link href="/accessibility" className="text-[10px] font-bold text-brand-surface hover:text-white transition-colors uppercase tracking-widest">Accessibility</Link>
      </div>
    </div>
  );
}
