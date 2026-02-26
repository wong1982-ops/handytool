const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'

export function buildWebAppSchema(opts: {
  name: string
  description: string
  url: string
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    applicationCategory: opts.category || 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: { '@type': 'WebSite', name: 'Toolk1t', url: SITE_URL },
  }
}

export function buildBreadcrumbSchema(items: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  }
}

export function buildArticleSchema(opts: {
  title: string
  description: string
  url: string
  publishedAt: string
  modifiedAt?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: `${SITE_URL}${opts.url}`,
    datePublished: opts.publishedAt,
    dateModified: opts.modifiedAt || opts.publishedAt,
    author: { '@type': 'Organization', name: 'Toolk1t', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Toolk1t',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }
}
