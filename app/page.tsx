import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeroSection } from '@/components/home/hero-section'
import { BentoShowcase } from '@/components/home/bento-showcase'
import { CtaBanner } from '@/components/home/cta-banner'

export const revalidate = 3600

async function LatestBlogPosts() {
  let posts: { slug: string; title: string; description: string; category: string; reading_time_min: number; published_at: string; cover_image_url: string | null }[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, description, category, reading_time_min, published_at, cover_image_url')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(3)
    posts = data ?? []
  } catch {
    // ignore
  }

  if (posts.length === 0) return null

  const categoryLabels: Record<string, string> = {
    'tool-announcement': 'New Tool',
    'how-to-guide': 'How-To',
    'weekly-roundup': 'Roundup',
  }

  return (
    <section className="py-16 px-4 bg-slate-50 dark:bg-[#0c1219]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--tk-color-primary-500)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" />
            </svg>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Latest from the Blog</h2>
          </div>
          <Link href="/blog" className="text-sm font-medium text-[var(--tk-color-primary-500)] hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post) => {
            const gradient = {
              'tool-announcement': 'from-blue-500 to-purple-600',
              'how-to-guide': 'from-green-500 to-teal-500',
              'weekly-roundup': 'from-amber-500 to-orange-500',
            }[post.category] ?? 'from-slate-500 to-slate-600'

            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group rounded-xl overflow-hidden bg-white dark:bg-white/5 backdrop-blur border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none">
                {/* Cover image or gradient fallback */}
                <div className={`relative h-36 ${post.cover_image_url ? '' : `bg-gradient-to-br ${gradient}`}`}>
                  {post.cover_image_url && (
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${post.cover_image_url ? 'bg-black/40 text-white backdrop-blur-sm' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                    {categoryLabels[post.category] || post.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-[var(--tk-color-primary-400)] transition-colors line-clamp-2 mb-1">{post.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{post.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <span>{post.reading_time_min} min read</span>
                    <span>&middot;</span>
                    <time>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  return (
    <div>
      <HeroSection />
      <BentoShowcase />
      <LatestBlogPosts />
      <CtaBanner />
    </div>
  )
}
