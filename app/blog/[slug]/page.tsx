import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo/schemas'
import { BlogPostRenderer } from '@/components/seo/blog-post-renderer'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: post } = await supabase
      .from('blog_posts')
      .select('title, description, published_at')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .single()
    if (!post) return {}
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: `${post.title} | Toolk1t`,
        description: post.description,
        url: `/blog/${slug}`,
        type: 'article',
        publishedTime: post.published_at,
      },
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .single()
    post = data
  } catch {
    notFound()
  }
  if (!post) notFound()

  const jsonLd = [
    buildArticleSchema({
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedAt: post.published_at,
    }),
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title },
    ]),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="max-w-3xl mx-auto px-6 py-12 flex-1">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{post.title}</h1>
        <time className="text-sm text-slate-400 block mb-8">
          {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </time>
        <BlogPostRenderer content={post.content} />
      </main>
    </>
  )
}
