'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { tools } from '@/lib/tools'
import type { DashboardWidget } from '@/tools/dashboard/types'

export function DashboardPreview() {
  const { user, loading: authLoading } = useAuth()
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetch('/api/v1/dashboard/layout')
      .then(r => r.json())
      .then(json => {
        const data = json.data ?? json
        setWidgets((data.widgets || []).slice(0, 6))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || !user) return null
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Dashboard</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-[#1e2631] animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (widgets.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Dashboard</h2>
        <Link href="/dashboard" className="text-sm text-[var(--tk-color-primary-500)] hover:underline">
          Customize →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {widgets.map(w => {
          const slug = w.toolSlug
          const tool = tools.find(t => t.href === `/tools/${slug}`)
          if (!tool) return null
          return (
            <Link
              key={w.id}
              href={tool.href}
              className="flex items-center gap-3 rounded-xl bg-white dark:bg-[#131a23] border border-slate-200 dark:border-[#1e2631] p-3 hover:bg-slate-50 dark:hover:bg-[#1e2631] transition-colors"
            >
              <span className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white [&>svg]:w-4 [&>svg]:h-4">
                {tool.icon}
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{tool.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
