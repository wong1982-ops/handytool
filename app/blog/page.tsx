import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
  cover_image_url: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  'tool-announcement': 'New Tool',
  'how-to-guide': 'How-To Guide',
  'weekly-roundup': 'Weekly Roundup',
  'comparison': 'Comparison',
}

const CATEGORY_COLORS: Record<string, string> = {
  'tool-announcement': 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300',
  'how-to-guide': 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300',
  'weekly-roundup': 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  'comparison': 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'tool-announcement': 'from-blue-500 to-purple-600',
  'how-to-guide': 'from-green-500 to-teal-500',
  'weekly-roundup': 'from-amber-500 to-orange-500',
  'comparison': 'from-purple-500 to-pink-500',
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const gradient = CATEGORY_GRADIENTS[post.category] ?? 'from-slate-500 to-slate-600'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative col-span-1 md:col-span-2 rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row">
        {/* Cover image */}
        <div className={`relative h-56 md:h-auto md:w-1/2 ${post.cover_image_url ? '' : `bg-gradient-to-br ${gradient}`}`}>
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" loading="eager" />
          )}
          <span className={`absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm ${CATEGORY_COLORS[post.category] || 'bg-white/20 text-white'}`}>
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[var(--tk-color-primary-500)] transition-colors mb-3 line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
            {post.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{post.reading_time_min} min read</span>
            <span>&middot;</span>
            <time>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
          </div>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function BentoCard({ post, size = 'default' }: { post: BlogPost; size?: 'default' | 'tall' }) {
  const gradient = CATEGORY_GRADIENTS[post.category] ?? 'from-slate-500 to-slate-600'

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col ${
        size === 'tall' ? 'md:row-span-2' : ''
      }`}
    >
      {/* Cover image */}
      <div className={`relative ${size === 'tall' ? 'h-48 md:h-64' : 'h-40'} ${post.cover_image_url ? '' : `bg-gradient-to-br ${gradient}`}`}>
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm ${CATEGORY_COLORS[post.category] || 'bg-white/20 text-white'}`}>
          {CATEGORY_LABELS[post.category] || post.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h2 className="font-bold text-slate-900 dark:text-white group-hover:text-[var(--tk-color-primary-500)] transition-colors mb-1.5 line-clamp-2 text-sm">
          {post.title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
          {post.description}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{post.reading_time_min} min</span>
          <span>&middot;</span>
          <time>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
          {post.tags?.[0] && (
            <>
              <span>&middot;</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">{post.tags[0]}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
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
      .select('slug, title, description, category, tags, reading_time_min, published_at, tool_slug, post_type, cover_image_url')
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

  const featured = posts[0] ?? null
  const rest = posts.slice(1)

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-1">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Blog
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Tools, guides, and insights for developers and creators
        </p>
      </div>

      <BlogFilter activeCategory={category ?? null} />

      {posts.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-20">No posts yet. Check back soon!</p>
      ) : (
        <div className="space-y-8">
          {/* Featured post — full width */}
          {featured && <FeaturedCard post={featured} />}

          {/* Bento grid for remaining posts */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((post, i) => (
                <BentoCard
                  key={post.slug}
                  post={post}
                  size={i === 0 || i === 5 ? 'tall' : 'default'}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
