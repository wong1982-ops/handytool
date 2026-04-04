import type { Metadata } from 'next'
import SocialGenerator from '@/tools/seo-studio/social-generator'

export const metadata: Metadata = {
  title: 'SEO Studio — Social Content | Toolk1t',
  description: 'Generate optimized social media posts for Twitter, LinkedIn, Instagram, Facebook, and TikTok.',
}

export default function SocialPage() {
  return <SocialGenerator />
}
