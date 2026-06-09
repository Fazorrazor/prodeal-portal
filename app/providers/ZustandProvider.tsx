'use client';

import { useEffect, useState } from 'react';

export function ZustandProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Hydration guard
  }

  return <>{children}</>;
}
