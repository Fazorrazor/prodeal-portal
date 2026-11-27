import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.prodealindustries.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Never advertise admin paths in robots.txt — admin routes are isolated to
        // ADMIN_SUBDOMAIN_HOST and enforce X-Robots-Tag: noindex, nofollow, noarchive.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
