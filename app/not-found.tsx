import Link from 'next/link';
import { NavLogo } from '../components/layout/NavLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-deep-blue font-body">
      {/* Minimal Header for Navigation Context */}
      <header className="p-6 border-b border-brand-border/40">
        <Link href="/">
          <NavLogo />
        </Link>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="border-t-2 border-brand-red pt-8 max-w-2xl w-full">
          <h1 className="text-[5rem] sm:text-[8rem] font-display font-extrabold tracking-tighter text-brand-red uppercase leading-none mb-4">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-tight mb-6">
            System Route Unreachable.
          </h2>
          <p className="text-sm font-mono tracking-[0.15em] uppercase text-brand-deep-blue/80 mb-12">
            The requested asset or sector does not exist in the active directory.
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center py-4 px-8 bg-transparent border-2 border-brand-deep-blue text-brand-deep-blue font-mono font-bold uppercase tracking-[0.2em] hover:bg-brand-deep-blue hover:text-white active:scale-[0.98] transition-all"
          >
            Return to Base
          </Link>
        </div>
      </main>
    </div>
  );
}
