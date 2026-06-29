import { MetadataRoute } from 'next';
import { DIVISIONS_LIST } from '../lib/config/divisions';

// Revalidate every hour — keeps the sitemap fresh without unnecessary rebuilds
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://prodealindustries.com';
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

  // Dynamic division routes — generated from the config so if you add a new
  // division to DIVISION_DATA, it automatically appears in the sitemap.
  const divisionRoutes: MetadataRoute.Sitemap = DIVISIONS_LIST.map((division) => ({
    url: `${baseUrl}${division.href}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...divisionRoutes];
}
