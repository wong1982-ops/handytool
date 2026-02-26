import Link from 'next/link'
import { tools } from '@/lib/tools'

export default function ToolsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Free Online Tools
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} shadow-md group-hover:scale-105 transition-transform flex items-center justify-center text-white shrink-0`}>
              <div className="w-6 h-6 [&>svg]:w-6 [&>svg]:h-6">{tool.icon}</div>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white">{tool.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2" title={tool.description}>{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
