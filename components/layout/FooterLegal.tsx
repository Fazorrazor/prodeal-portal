import Link from 'next/link';

export function FooterLegal() {
  return (
    <div className="border-t border-brand-border/30 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-xs text-brand-deep-blue/80">
        &copy; {new Date().getFullYear()} Prodeal Systems Ltd. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <Link href="/privacy" className="text-xs text-brand-deep-blue/80 hover:text-brand-blue transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="text-xs text-brand-deep-blue/80 hover:text-brand-blue transition-colors">Terms of Service</Link>
      </div>
    </div>
  );
}
