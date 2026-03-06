'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BlogPost {
  slug: string
  title: string
  description: string
  published_at: string
}

export function BlogSheetContent() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('blog_posts')
          .select('slug, title, description, published_at')
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(20)
        setPosts(data ?? [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blog</h2>
        <p className="text-xs text-slate-500 mt-1">Insights, trending tools, and usage stats.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-1.5" />
              <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded mb-1" />
              <div className="h-3 w-1/3 bg-slate-200 dark:bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">No posts yet. Check back soon!</p>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block py-3 first:pt-0"
            >
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{post.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{post.description}</p>
              <time className="text-xs text-slate-400 mt-1 block">
                {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
