// Server Component — no 'use client' needed. This component renders invisible
// JSON-LD script tags that Google's crawler reads to understand exactly what
// each page is about without having to parse the visual HTML.

interface OrganizationJsonLdProps {
  siteUrl: string;
}

/**
 * OrganizationJsonLd — inject on the homepage only.
 * Tells Google: "This is a real, named business with a location and contact details."
 */
export function OrganizationJsonLd({ siteUrl }: OrganizationJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Prodeal Systems Ltd.',
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
    description:
      "Ghana's premier B2B industrial supplier offering 3D Signages, Souvenirs & Printing, Disposable Bowls, and Industrial Chemicals.",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GH',
      addressRegion: 'Greater Accra',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [], // Add social media profile URLs here when available
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface DivisionServiceJsonLdProps {
  title: string;
  tagline: string;
  slug: string;
  siteUrl: string;
}

/**
 * DivisionServiceJsonLd — inject on each division page.
 * Tells Google: "This is a specific type of industrial Service you can request a quote for."
 */
export function DivisionServiceJsonLd({
  title,
  tagline,
  slug,
  siteUrl,
}: DivisionServiceJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description: tagline,
    url: `${siteUrl}/divisions/${slug}`,
    provider: {
      '@type': 'Organization',
      name: 'Prodeal Systems Ltd.',
      url: siteUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Ghana',
    },
    // BreadcrumbList helps Google show the navigation path in search results
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: title,
          item: `${siteUrl}/divisions/${slug}`,
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
