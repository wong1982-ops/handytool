'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ToolBreadcrumb } from '@/components/ui/tool-breadcrumb'
import { useSeriesList } from '@/tools/story-studio/use-series'

type NavItem = 'create' | 'bookshelf' | 'series' | 'scan'

interface StudioLayoutProps {
  children: React.ReactNode
  bookCount?: number
  seriesCount?: number
}

export function StudioLayout({ children, bookCount, seriesCount: seriesCountProp }: StudioLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { series } = useSeriesList()
  const seriesCount = seriesCountProp ?? series.length

  const activeNav: NavItem = pathname.startsWith('/tools/story-studio/series') ? 'series'
    : pathname.startsWith('/tools/story-studio/scan') ? 'scan'
    : 'create'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Fantasy header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 20%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 25% 60%, #c4b5fd, transparent),
              radial-gradient(1px 1px at 40% 15%, #fff, transparent),
              radial-gradient(2px 2px at 55% 45%, #fbbf24, transparent),
              radial-gradient(1px 1px at 70% 75%, #c4b5fd, transparent),
              radial-gradient(1.5px 1.5px at 85% 30%, #fff, transparent),
              radial-gradient(1px 1px at 95% 80%, #fbbf24, transparent),
              radial-gradient(2px 2px at 15% 85%, #a78bfa, transparent),
              radial-gradient(1px 1px at 50% 90%, #fff, transparent),
              radial-gradient(1.5px 1.5px at 75% 10%, #fbbf24, transparent)
            `,
            animation: 'starfield-drift 12s ease-in-out infinite alternate',
          }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              radial-gradient(1px 1px at 5% 50%, #fff, transparent),
              radial-gradient(2px 2px at 30% 35%, #a78bfa, transparent),
              radial-gradient(1px 1px at 60% 65%, #fbbf24, transparent),
              radial-gradient(1.5px 1.5px at 80% 50%, #c4b5fd, transparent),
              radial-gradient(1px 1px at 45% 25%, #fff, transparent)
            `,
            animation: 'starfield-drift 16s ease-in-out 3s infinite alternate-reverse',
          }} />
          <div className="absolute bottom-0 left-1/4 w-1/2 h-24 bg-gradient-to-t from-amber-500/10 via-purple-500/5 to-transparent blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-5 pb-6 md:pt-6 md:pb-8">
          <ToolBreadcrumb toolName="Story Studio" toolSlug="story-studio" />

          <div className="mt-4 flex items-center gap-3">
            <div className="relative">
              <svg className="w-9 h-9 md:w-10 md:h-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: '"Palatino Linotype", Palatino, "Book Antiqua", serif' }}>
                Story Studio
              </h1>
              <p className="text-purple-300/70 text-sm mt-0.5">
                Where imagination becomes illustrated tales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="max-w-7xl mx-auto flex">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 left-4 z-30 md:hidden w-12 h-12 rounded-full bg-indigo-900 text-white shadow-lg flex items-center justify-center cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left sidebar */}
        <aside className={`
          fixed md:sticky top-0 md:top-0 left-0 z-20 md:z-0
          w-64 md:w-56 lg:w-64 shrink-0 h-screen md:h-auto
          bg-white dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent
          border-r border-slate-200 dark:border-slate-800 md:border-r-0
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          px-3 md:px-4 pt-4 md:pt-6
        `}>
          <nav className="space-y-1">
            <Link
              href="/tools/story-studio"
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeNav === 'create'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{ minHeight: '44px' }}
            >
              <svg className={`w-5 h-5 ${activeNav === 'create' ? 'text-indigo-500' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Build
            </Link>
            <Link
              href="/tools/story-studio"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Bookshelf
              {bookCount !== undefined && bookCount > 0 && (
                <span className="ml-auto text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                  {bookCount}
                </span>
              )}
            </Link>
            <Link
              href="/tools/story-studio/series"
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeNav === 'series'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{ minHeight: '44px' }}
            >
              <svg className={`w-5 h-5 ${activeNav === 'series' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              Series
              {seriesCount > 0 && (
                <span className="ml-auto text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                  {seriesCount}
                </span>
              )}
            </Link>
            <Link
              href="/tools/story-studio/scan"
              onClick={() => setSidebarOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeNav === 'scan'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{ minHeight: '44px' }}
            >
              <svg className={`w-5 h-5 ${activeNav === 'scan' ? 'text-indigo-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              Scan
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 md:px-6 py-6 md:py-8 max-w-4xl">
          {children}
        </main>
      </div>
    </div>
  )
}
