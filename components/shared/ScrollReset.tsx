'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Tell the browser NOT to remember the scroll position on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // 2. Force the window back to the absolute top of the page
    window.scrollTo(0, 0);

    // Cleanup: restore default behavior when the component unmounts
    // (Optional, but good practice so we don't permanently break browser behavior if they leave the portal)
    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, [pathname]);

  // This component doesn't render any visible UI
  return null;
}
