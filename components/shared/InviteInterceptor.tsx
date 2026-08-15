'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function InviteInterceptor() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      // If the user lands here with an invite or password recovery token
      if (hash.includes('type=invite') || hash.includes('type=recovery')) {
        // Redirect to the update password page, carrying the hash along so the Supabase client can authenticate them
        router.push(`/admin/update-password${hash}`);
      }
    }
  }, [router]);

  return null;
}
