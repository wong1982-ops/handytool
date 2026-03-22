import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Human Benchmark - Brain Games & Cognitive Tests',
  description: 'Test your reaction time, memory, aim, typing speed, and more with 8 interactive brain games. Track your scores and challenge yourself.',
  alternates: { canonical: '/tools/human-benchmark' },
  openGraph: {
    title: 'Human Benchmark | Toolk1t',
    description: 'Test your cognitive abilities with 8 brain games. Online tool.',
    url: '/tools/human-benchmark',
  },
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Human Benchmark',
    description: 'Test your cognitive abilities with 8 brain games including reaction time, memory, aim, and typing tests.',
    url: 'https://toolk1t.com/tools/human-benchmark',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isPartOf: { '@type': 'WebSite', name: 'Toolk1t', url: 'https://toolk1t.com' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolk1t.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://toolk1t.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Human Benchmark' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  )
}
