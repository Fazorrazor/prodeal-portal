import Link from 'next/link';

export function FooterLegal() {
  return (
    <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <p className="text-sm text-white/50 font-medium">
        &copy; {new Date().getFullYear()} Prodeal Industries Ltd. All rights reserved.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/privacy" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Terms of Service</Link>
        <Link href="/accessibility" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Accessibility</Link>
      </div>
    </div>
  );
}
