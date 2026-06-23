import { Package } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProductImageFallbackProps {
  className?: string;
}

export function ProductImageFallback({ className }: ProductImageFallbackProps) {
  return (
    <div className={cn("w-full h-full bg-brand-deep-blue/5 flex flex-col items-center justify-center border-2 border-dashed border-brand-border/40", className)}>
      <Package className="w-8 h-8 text-brand-deep-blue/20 mb-2" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-deep-blue/80 text-center">
        Image Pending
      </span>
    </div>
  );
}
