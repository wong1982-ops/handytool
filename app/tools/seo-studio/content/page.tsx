import type { Metadata } from 'next'
import ContentCalendar from '@/tools/seo-studio/content-calendar'

export const metadata: Metadata = {
  title: 'SEO Studio — Content Calendar | Toolk1t',
  description: 'Plan, generate, and publish SEO-optimised blog content with AI assistance.',
  alternates: { canonical: '/tools/seo-studio/content' },
  openGraph: {
    title: 'SEO Studio — Content Calendar | Toolk1t',
    description: 'AI-powered content planning and generation for your SEO strategy.',
    url: '/tools/seo-studio/content',
  },
}

export default function ContentPage() {
  return <ContentCalendar />
}
