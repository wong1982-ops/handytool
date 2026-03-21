import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildArticleSchema, buildBreadcrumbSchema, buildFaqSchema } from '@/lib/seo/schemas'
import { BlogPostRenderer } from '@/components/seo/blog-post-renderer'
import { MarkdownRenderer } from '@/components/blog/markdown-renderer'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { FaqSection } from '@/components/blog/faq-section'
import { ShareButtons } from '@/components/blog/share-buttons'
import { CtaBanner } from '@/components/blog/cta-banner'
import { RelatedPosts } from '@/components/blog/related-posts'
import { TOOL_ENTRIES } from '@/lib/blog/tool-slugs'

export const revalidate = 3600

const LEGACY_POST_TYPES = ['weekly-roundup', 'trending', 'tool-spotlight']

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: post } = await supabase
      .from('blog_posts')
      .select('title, description, published_at, category, tags, keywords, cover_image_url')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .single()
    if (!post) return {}
    return {
      title: post.title,
      description: post.description,
      keywords: post.keywords ?? undefined,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: `${post.title} | Toolk1t`,
        description: post.description,
        url: `/blog/${slug}`,
        type: 'article',
        publishedTime: post.published_at,
        ...(post.cover_image_url ? { images: [{ url: post.cover_image_url }] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let post: any = null
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

  const isLegacy = LEGACY_POST_TYPES.includes(post.post_type)

  // Build JSON-LD schemas
  const jsonLd: object[] = [
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

  // Add FAQ schema if present
  const faq = !isLegacy && post.content?.faq?.length ? post.content.faq : null
  if (faq) {
    jsonLd.push(buildFaqSchema(faq))
  }

  // Tool info for CTA
  const toolEntry = post.tool_slug
    ? TOOL_ENTRIES.find((t) => t.slug === post.tool_slug)
    : null

  // Related posts
  let relatedPosts: { slug: string; title: string; description: string; category: string; published_at: string }[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, title, description, category, published_at')
      .not('published_at', 'is', null)
      .neq('slug', slug)
      .overlaps('tags', post.tags ?? [])
      .order('published_at', { ascending: false })
      .limit(3)
    relatedPosts = data ?? []
  } catch {
    // ignore
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-slate-400 mb-6">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-slate-600 dark:hover:text-slate-300">Home</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-slate-600 dark:hover:text-slate-300">Blog</Link></li>
            <li>/</li>
            <li className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            {post.author && <span>By {post.author}</span>}
            <time>
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.reading_time_min && <span>&middot; {post.reading_time_min} min read</span>}
            {post.category && (
              <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {post.category.replace(/-/g, ' ')}
              </span>
            )}
          </div>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {isLegacy ? (
          /* Legacy post types: weekly-roundup, trending, tool-spotlight */
          <BlogPostRenderer content={post.content} />
        ) : (
          <>
            {/* Mobile ToC */}
            {post.content?.toc?.length > 0 && (
              <div className="lg:hidden">
                <TableOfContents toc={post.content.toc} />
              </div>
            )}

            {/* Content + Sidebar */}
            <div className="flex gap-8">
              <article className="flex-1 min-w-0">
                <MarkdownRenderer content={post.content?.markdown ?? ''} />
              </article>
              {post.content?.toc?.length > 0 && (
                <aside className="hidden lg:block w-64 shrink-0">
                  <TableOfContents toc={post.content.toc} />
                </aside>
              )}
            </div>

            {/* FAQ */}
            {faq && <FaqSection faq={faq} />}
          </>
        )}

        {/* Share */}
        <ShareButtons url={`/blog/${slug}`} title={post.title} />

        {/* CTA */}
        {toolEntry && <CtaBanner toolName={toolEntry.name} toolHref={toolEntry.href} />}

        {/* Related posts */}
        <RelatedPosts posts={relatedPosts} />
      </main>
    </>
  )
}
