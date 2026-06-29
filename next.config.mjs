/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'abfphaytysoeghuzisiw.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://abfphaytysoeghuzisiw.supabase.co https://via.placeholder.com; font-src 'self'; connect-src 'self' https://abfphaytysoeghuzisiw.supabase.co wss://abfphaytysoeghuzisiw.supabase.co https://vitals.vercel-insights.com; frame-ancestors 'none';",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
