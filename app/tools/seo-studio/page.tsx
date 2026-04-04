import type { Metadata } from 'next'
import KeywordResearch from '@/tools/seo-studio/keyword-research'

export const metadata: Metadata = {
  title: 'SEO Studio — Keyword Research | Toolk1t',
  description: 'Research keywords, analyze search intent, and discover long-tail opportunities with AI-powered SEO analysis.',
  alternates: { canonical: '/tools/seo-studio' },
  openGraph: {
    title: 'SEO Studio — Keyword Research | Toolk1t',
    description: 'Research keywords and discover SEO opportunities with Gemini AI.',
    url: '/tools/seo-studio',
  },
}

export default function SeoStudioPage() {
  return <KeywordResearch />
}
