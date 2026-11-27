import { MetadataRoute } from 'next';
import { DIVISIONS_LIST } from '../lib/config/divisions';
import { SOLUTIONS_LIST } from '../lib/config/solutions';

// Revalidate every hour — keeps the sitemap fresh without unnecessary rebuilds
export const revalidate = 3600;

// Update these timestamps only when the corresponding content genuinely changes
// so Googlebot trusts <lastmod> and prioritizes fresh pages accurately.
const CONTENT_LAST_MODIFIED = new Date('2026-11-27T00:00:00Z');
const LEGAL_LAST_MODIFIED = new Date('2026-08-01T00:00:00Z');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.prodealindustries.com';

  // Indexable static routes (utility/private routes like /inquiry/success are intentionally excluded)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/inquiry`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Active division routes only (DIVISIONS_LIST filters isActive === true)
  const divisionRoutes: MetadataRoute.Sitemap = DIVISIONS_LIST.map((division) => ({
    url: `${baseUrl}${division.href}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Dynamic problem-solution guide routes (high SEO/GEO priority)
  const solutionRoutes: MetadataRoute.Sitemap = SOLUTIONS_LIST.map((solution) => ({
    url: `${baseUrl}/solutions/${solution.slug}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'weekly' as const,
    priority: 0.95,
  }));

  return [...staticRoutes, ...divisionRoutes, ...solutionRoutes];
}
