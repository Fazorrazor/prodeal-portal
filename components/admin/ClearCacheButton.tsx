'use client';

import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { clearPlatformCache } from '../../app/actions/cache';

export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const res = await clearPlatformCache();
      if (res.success) {
        toast.success('Platform cache purged successfully. All static pages have been rebuilt.');
      } else {
        toast.error(`Failed to clear cache: ${res.error}`);
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred while clearing cache.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <button 
      onClick={handleClearCache}
      disabled={isClearing}
      className="flex items-center gap-2 bg-brand-deep-blue text-brand-surface py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-brand-blue transition-colors disabled:opacity-50"
    >
      {isClearing ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Purging...</>
      ) : (
        <><RefreshCw className="w-4 h-4" /> Purge Global Cache</>
      )}
    </button>
  );
}
