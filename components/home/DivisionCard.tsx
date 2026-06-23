import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DivisionCardProps {
  title: string;
  description: string;
  href: string;
  accent: 'blue' | 'red';
  index: number;
}

export function DivisionCard({ title, description, href, accent, index }: DivisionCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center justify-between py-6 sm:py-7 border-b border-brand-border/40 gap-4 transition-colors duration-200 active:bg-black/5"
    >
      {/* Left: index number + title block */}
      <div className="flex items-start sm:items-center gap-5 sm:gap-8 flex-1 min-w-0">
        {/* Number */}
        <span className="text-[10px] font-mono font-bold text-brand-deep-blue/25 tracking-widest shrink-0 hidden sm:block">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Animated left accent bar */}
        <div className={cn(
          'hidden sm:block w-[3px] self-stretch shrink-0 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300',
          accent === 'blue' ? 'bg-brand-blue' : 'bg-brand-red'
        )} />

        {/* Mobile accent dot */}
        <div className={cn(
          'sm:hidden w-2 h-2 rounded-full shrink-0 mt-[6px]',
          accent === 'blue' ? 'bg-brand-blue' : 'bg-brand-red'
        )} />

        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="font-heading font-bold text-lg sm:text-xl md:text-2xl text-brand-deep-blue tracking-tight uppercase leading-none group-hover:text-brand-blue transition-colors duration-200">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-brand-deep-blue/80 font-body leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Right: Arrow */}
      <div className="shrink-0 flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight className={cn(
          'w-5 h-5 transition-colors duration-200',
          'text-brand-deep-blue/20 group-hover:' + (accent === 'blue' ? 'text-brand-blue' : 'text-brand-red')
        )} />
      </div>
    </Link>
  );
}
