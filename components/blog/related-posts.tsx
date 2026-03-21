import Link from 'next/link'

interface RelatedPost {
  slug: string
  title: string
  description: string
  category: string
  published_at: string
}

export function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition-shadow"
          >
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
              {post.category.replace(/-/g, ' ')}
            </span>
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
              {post.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
              {post.description}
            </p>
            <time className="text-xs text-slate-400">
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </Link>
        ))}
      </div>
    </section>
  )
}
