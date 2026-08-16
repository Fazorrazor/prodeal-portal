import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.prodealindustries.com';

  return {
    rules: [
      {
        // Google and all standard crawlers
        userAgent: '*',
        allow: '/',
        // Block admin, API routes, and tracking pages (no SEO value, private)
        disallow: ['/admin/', '/api/', '/track/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
