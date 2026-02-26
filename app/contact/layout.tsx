import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Support',
  description:
    'Get in touch with the Toolk1t team. Send us a message for feedback, bug reports, or feature requests.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Support | Toolk1t',
    description:
      'Get in touch with the Toolk1t team for feedback, bug reports, or feature requests.',
    url: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
