import Link from 'next/link'
import { tools } from '@/lib/tools'
import { createClient } from '@/lib/supabase/server'
import { FavoriteButton } from '@/components/ui/favorite-button'

export const revalidate = 3600

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

const RANK_STYLES = [
  'border-yellow-400/60 bg-yellow-50 dark:bg-yellow-900/20',   // #1 gold
  'border-slate-300/60 bg-slate-50 dark:bg-slate-800/40',      // #2 silver
  'border-amber-600/40 bg-amber-50 dark:bg-amber-900/20',      // #3 bronze
  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900', // #4
  'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900', // #5
]

const RANK_BADGE = [
  'bg-yellow-400 text-yellow-900',
  'bg-slate-300 text-slate-700',
  'bg-amber-600 text-white',
  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
]

interface TrendingTool {
  rank: number
  slug: string
  name: string
  icon: React.ReactNode | undefined
  color: string
  href: string
  views: number
}

async function getTrendingTools(): Promise<TrendingTool[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('tool_popularity', { time_range_days: 7 })
    if (!data || data.length === 0) return []

    return data.slice(0, 5).map((item: { tool_slug: string; view_count: number }, i: number) => {
      const slug = item.tool_slug
      const tool = tools.find((t) => t.href === `/tools/${slug}`)
      return {
        rank: i + 1,
        slug,
        name: tool?.name || slug,
        icon: tool?.icon,
        color: tool?.color || 'from-slate-500 to-slate-400',
        href: tool?.href || `/tools/${slug}`,
        views: item.view_count ?? 0,
      }
    })
  } catch {
    return []
  }
}

async function LatestBlogPosts() {
  let posts: { slug: string; title: string; description: string; category: string; reading_time_min: number; published_at: string }[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, description, category, reading_time_min, published_at')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(3)
    posts = data ?? []
  } catch {
    // Table might not have new columns yet
  }

  if (posts.length === 0) return null

  const categoryColors: Record<string, string> = {
    'tool-announcement': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'how-to-guide': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'weekly-roundup': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  }

  const categoryLabels: Record<string, string> = {
    'tool-announcement': 'New Tool',
    'how-to-guide': 'How-To',
    'weekly-roundup': 'Roundup',
  }

  return (
    <section className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" />
          </svg>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Latest from the Blog
          </h2>
        </div>
        <Link href="/blog" className="text-sm font-medium text-[var(--tk-color-primary-500)] hover:underline">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColors[post.category] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {categoryLabels[post.category] || post.category}
              </span>
              <span className="text-xs text-slate-400">{post.reading_time_min} min read</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-[var(--tk-color-primary-500)] transition-colors line-clamp-2 mb-1">
              {post.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{post.description}</p>
            <time className="text-xs text-slate-400 mt-2 block">
              {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </time>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function ToolsPage() {
  const trending = await getTrendingTools()

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Free Online Tools
      </h1>

      {/* Trending This Week */}
      {trending.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trending This Week
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {trending.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border ${RANK_STYLES[item.rank - 1]} hover:shadow-md transition-all`}
              >
                {/* Rank badge */}
                <span className={`absolute -top-2 -left-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${RANK_BADGE[item.rank - 1]}`}>
                  {item.rank}
                </span>
                {/* Tool icon */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center text-white`}>
                  <div className="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5">{item.icon}</div>
                </div>
                {/* Name + count */}
                <p className="text-sm font-bold text-slate-900 dark:text-white text-center leading-tight">
                  {item.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {formatCount(item.views)} uses
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const slug = tool.href.replace('/tools/', '')
          return (
            <Link key={tool.href} href={tool.href} className="group relative flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} shadow-md group-hover:scale-105 transition-transform flex items-center justify-center text-white shrink-0`}>
                  <div className="w-6 h-6 [&>svg]:w-6 [&>svg]:h-6">{tool.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white">{tool.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2" title={tool.description}>{tool.description}</p>
                </div>
                <FavoriteButton slug={slug} name={tool.name} />
            </Link>
          )
        })}
      </div>

      {/* Latest from the Blog */}
      <LatestBlogPosts />
    </main>
  )
}
