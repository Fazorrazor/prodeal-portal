import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DivisionCardProps {
  title: string;
  description: string;
  href: string;
  accent: 'blue' | 'red';
}

export function DivisionCard({ title, description, href, accent }: DivisionCardProps) {
  return (
    <Link 
      href={href}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between bg-white px-6 py-6 hover:bg-brand-surface/50 transition-colors duration-200 border-b border-brand-border/40"
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 scale-y-0 origin-center transition-transform duration-300 group-hover:scale-y-100",
        accent === 'blue' ? "bg-brand-blue" : "bg-brand-red"
      )} />
      
      <div className="flex-1 pr-6">
        <h3 className="font-heading font-bold text-xl text-brand-deep-blue mb-1">{title}</h3>
        <p className="text-brand-deep-blue/70 text-sm leading-relaxed">{description}</p>
      </div>
      
      <div className="flex items-center gap-2 font-heading font-semibold text-sm text-brand-blue mt-4 sm:mt-0 transition-transform duration-300 group-hover:translate-x-2">
        <span className="sm:hidden">Request Quote</span>
        <ArrowRight className="w-5 h-5 text-brand-deep-blue/30 group-hover:text-brand-blue transition-colors" />
      </div>
    </Link>
  );
}
