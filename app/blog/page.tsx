import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog — Toolk1t Weekly Insights',
  description: 'Weekly roundups of tool usage, trending tools, and tips for getting the most out of Toolk1t.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Toolk1t',
    description: 'Weekly roundups of tool usage, trending tools, and tips.',
    url: '/blog',
  },
}

export default async function BlogListingPage() {
  let posts: { slug: string; title: string; description: string; post_type: string; published_at: string }[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, description, post_type, published_at')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(50)
    posts = data ?? []
  } catch {
    // Table might not exist yet during build
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 flex-1">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Blog</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Weekly insights, trending tools, and usage stats from Toolk1t.
      </p>

      {posts.length === 0 ? (
        <p className="text-slate-500">No posts yet. Check back soon!</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-slate-200 dark:border-slate-800 pb-6">
              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{post.description}</p>
                <time className="text-sm text-slate-400 mt-2 block">
                  {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
