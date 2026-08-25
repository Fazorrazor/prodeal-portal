import { MetadataRoute } from 'next';
import { DIVISIONS_LIST } from '../lib/config/divisions';
import { SOLUTIONS_LIST } from '../lib/config/solutions';

// Revalidate every hour — keeps the sitemap fresh without unnecessary rebuilds
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.prodealindustries.com';
  const now = new Date();

  // Static routes — these are fixed pages that always exist
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  // Dynamic division routes
  const divisionRoutes: MetadataRoute.Sitemap = DIVISIONS_LIST.map((division) => ({
    url: `${baseUrl}${division.href}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Dynamic problem-solution guide routes (high SEO/GEO priority)
  const solutionRoutes: MetadataRoute.Sitemap = SOLUTIONS_LIST.map((solution) => ({
    url: `${baseUrl}/solutions/${solution.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.95,
  }));

  return [...staticRoutes, ...divisionRoutes, ...solutionRoutes];
}
