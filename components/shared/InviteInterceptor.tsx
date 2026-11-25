'use client';

import { useEffect } from 'react';
import { normalizeHostname } from '../../lib/security';

export function InviteInterceptor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      // If the user lands here with an invite or password recovery token, route to the dedicated admin host
      if (hash.includes('type=invite') || hash.includes('type=recovery')) {
        const configuredAdminHost = normalizeHostname(process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN_HOST);
        const currentHost = normalizeHostname(window.location.hostname);

        if (configuredAdminHost && currentHost !== configuredAdminHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
          window.location.href = `https://${configuredAdminHost}/admin/update-password${hash}`;
        } else {
          window.location.href = `/admin/update-password${hash}`;
        }
      }
    }
  }, []);

  return null;
}
