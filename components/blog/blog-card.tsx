import Link from 'next/link'

interface BlogCardPost {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  reading_time_min: number
  published_at: string
  tool_slug?: string | null
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'tool-announcement': 'from-blue-500 to-purple-600',
  'how-to-guide': 'from-green-500 to-teal-500',
  'weekly-roundup': 'from-amber-500 to-orange-500',
}

export function BlogCard({ post }: { post: BlogCardPost }) {
  const gradient = CATEGORY_GRADIENTS[post.category] ?? 'from-slate-500 to-slate-600'

  return (
    <article className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      {/* Gradient banner */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient}`}>
        <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
          {post.category.replace(/-/g, ' ')}
        </span>
      </div>

      <div className="p-5">
        <Link href={`/blog/${post.slug}`} className="group">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {post.description}
        </p>

        {/* Bottom row */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>{post.reading_time_min} min read</span>
          <span>&middot;</span>
          <time>
            {new Date(post.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
          {post.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
