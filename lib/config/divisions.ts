export const DIVISION_DATA = {
  signages: {
    title: '3D Signages',
    tagline: 'Custom fabricated illuminated signs, standees, and lettering for maximum corporate visibility.',
    slug: 'signages',
    href: '/divisions/signages',
    accent: 'blue' as const,
    isActive: false,
  },
  printing: {
    title: 'Souvenirs & Printing',
    tagline: 'High-volume corporate gifts, branded apparel, and commercial printing services.',
    slug: 'printing',
    href: '/divisions/printing',
    accent: 'red' as const,
    isActive: false,
  },
  bowls: {
    title: 'Disposable Bowls',
    tagline: 'Bulk supply of premium catering disposables with live inventory tracking.',
    slug: 'bowls',
    href: '/divisions/bowls',
    accent: 'blue' as const,
    isActive: true,
  },
  chemicals: {
    title: 'Industrial Chemicals',
    tagline: 'Regulated chemical supplies for laboratories, manufacturing, and food processing.',
    slug: 'chemicals',
    href: '/divisions/chemicals',
    accent: 'red' as const,
    isActive: true,
  }
} as const;

export const DIVISIONS_LIST = Object.values(DIVISION_DATA).filter(d => d.isActive);
