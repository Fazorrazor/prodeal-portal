export function FooterLegal() {
  return (
    <div className="border-t border-brand-border/30 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-xs text-brand-deep-blue/60">
        &copy; {new Date().getFullYear()} Pro Deal Industries. All rights reserved.
      </p>
      <div className="flex items-center gap-4">
        <a href="#" className="text-xs text-brand-deep-blue/60 hover:text-brand-blue transition-colors">Privacy Policy</a>
        <a href="#" className="text-xs text-brand-deep-blue/60 hover:text-brand-blue transition-colors">Terms of Service</a>
      </div>
    </div>
  );
}
