import type { MetadataRoute } from 'next'
import { tools } from '@/lib/tools'
import { landingPages } from '@/lib/seo/landing-pages'
import { useCases } from '@/lib/seo/use-cases'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolk1t.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, published_at')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })

    blogEntries = (posts ?? []).map((post: { slug: string; published_at: string }) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // Supabase unavailable during build — skip blog entries
  }

  // Sub-pages for specific tools
  const subPages = [
    '/tools/story-studio/bookshelf',
    '/tools/story-studio/series',
    '/tools/story-studio/scan',
    '/tools/story-studio/build',
    '/tools/story-studio/characters',
    '/tools/ecard-studio/ai-business-card',
  ]

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...tools.map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...subPages.map((page) => ({
      url: `${SITE_URL}${page}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...landingPages.map((p) => ({
      url: `${SITE_URL}/free/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...useCases.map((uc) => ({
      url: `${SITE_URL}/use-cases/${uc.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...blogEntries,
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
