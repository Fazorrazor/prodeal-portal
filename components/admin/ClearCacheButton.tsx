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
    } catch {
      toast.error('An unexpected error occurred while clearing cache.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <button 
      onClick={handleClearCache}
      disabled={isClearing}
      className="flex items-center justify-center w-full sm:w-auto gap-2 bg-brand-deep-blue text-white py-2.5 px-5 text-sm font-semibold rounded-lg hover:bg-brand-blue transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
    >
      {isClearing ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Purging...</>
      ) : (
        <><RefreshCw className="w-4 h-4" /> Purge Global Cache</>
      )}
    </button>
  );
}
