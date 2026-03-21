import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BlogCard } from '@/components/blog/blog-card'
import { BlogFilter } from '@/components/blog/blog-filter'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog — Toolk1t',
  description: 'Tools, guides, and insights for developers and creators.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Toolk1t',
    description: 'Tools, guides, and insights for developers and creators.',
    url: '/blog',
  },
}

interface BlogPost {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  reading_time_min: number
  published_at: string
  tool_slug: string | null
  post_type: string
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  let posts: BlogPost[] = []

  try {
    const supabase = await createClient()
    let query = supabase
      .from('blog_posts')
      .select('slug, title, description, category, tags, reading_time_min, published_at, tool_slug, post_type')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(50)

    if (category) {
      query = query.eq('category', category)
    }

    const { data } = await query
    posts = (data ?? []) as BlogPost[]
  } catch {
    // Table might not exist yet during build
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Blog</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Tools, guides, and insights for developers and creators
      </p>

      <BlogFilter activeCategory={category ?? null} />

      {posts.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No posts yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}
