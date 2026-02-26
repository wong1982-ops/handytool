import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ECard Studio - Design Professional E-Cards',
  description:
    'Design and customize professional e-cards for business occasions. Choose templates, personalize messages, and download instantly. Free online tool.',
  alternates: { canonical: '/tools/ecard-studio' },
  openGraph: {
    title: 'ECard Studio | Toolk1t',
    description:
      'Design professional e-cards for business occasions. Free online tool.',
    url: '/tools/ecard-studio',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ECard Studio',
    description:
      'Design and customize professional e-cards for business occasions. Choose templates, personalize messages, and download instantly.',
    url: 'https://toolk1t.com/tools/ecard-studio',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Toolk1t',
      url: 'https://toolk1t.com',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://toolk1t.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: 'https://toolk1t.com/tools',
      },
      { '@type': 'ListItem', position: 3, name: 'ECard Studio' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'html, body { height: 100dvh !important; min-height: 100dvh !important; overflow: hidden !important; } body > footer { display: none !important; }' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
