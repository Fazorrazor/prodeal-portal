'use client';

import { useEffect, useState } from 'react';

function createFallbackRef(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().slice(0, 12).toUpperCase();
  }
  return `ERR-${Date.now().toString(36).toUpperCase()}`;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [fallbackRef] = useState(createFallbackRef);
  const referenceId = error.digest || fallbackRef;

  useEffect(() => {
    console.error('[Global ErrorBoundary]', {
      referenceId,
      digest: error.digest ?? null,
    });
  }, [error.digest, referenceId]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          color: '#0B1F3A',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: '24px',
        }}
      >
        <main
          style={{
            maxWidth: '560px',
            width: '100%',
            borderTop: '3px solid #D92D20',
            paddingTop: '28px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#D92D20',
              fontWeight: 700,
              margin: '0 0 12px',
            }}
          >
            Pro Deal Industries — System Notice
          </p>
          <h1 style={{ fontSize: '28px', margin: '0 0 12px', textTransform: 'uppercase' }}>
            Temporary Service Interruption
          </h1>
          <p style={{ fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px', opacity: 0.85 }}>
            Something unexpected happened while loading this page. You can retry now or return to the homepage.
          </p>
          <p
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '12px',
              letterSpacing: '0.12em',
              margin: '0 0 28px',
            }}
          >
            REFERENCE ID: {referenceId}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0B1F3A',
                color: '#FFFFFF',
                border: '2px solid #0B1F3A',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            <a
              href="/"
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#0B1F3A',
                border: '2px solid #0B1F3A',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Return Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
