import Link from 'next/link'

interface BlogContent {
  hero_stat: string
  top_tools: { name: string; slug: string; views: number; change_pct: number }[]
  highlight: string | null
  weekly_visitors: number
  total_views: number
}

export function BlogPostRenderer({ content }: { content: BlogContent }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">This Week&apos;s Highlights</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{content.total_views.toLocaleString()}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total tool uses</p>
          </div>
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{content.weekly_visitors.toLocaleString()}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Unique visitors</p>
          </div>
        </div>
        {content.highlight && (
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{content.highlight}</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Top 5 Tools</h2>
        {content.top_tools.length === 0 ? (
          <p className="text-slate-500">No tool usage data this week.</p>
        ) : (
          <div className="space-y-3">
            {content.top_tools.map((tool, i) => (
              <div key={tool.slug} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-2xl font-bold text-slate-400 w-8 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link href={`/tools/${tool.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {tool.name}
                  </Link>
                  <p className="text-sm text-slate-500">{tool.views.toLocaleString()} uses</p>
                </div>
                {tool.change_pct !== 0 && (
                  <span className={`text-sm font-medium ${tool.change_pct > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tool.change_pct > 0 ? '+' : ''}{tool.change_pct.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Try These Tools</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Explore all our{' '}
          <Link href="/tools" className="text-blue-600 dark:text-blue-400 hover:underline">online tools</Link>
          {' '}&mdash; from JSON converters to speed tests, passport photo makers to currency converters.
        </p>
      </section>
    </div>
  )
}
