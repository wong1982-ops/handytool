'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface TabItem {
  label: string
  href: string
  icon: React.ReactNode
  /** If true, tab requires an active book to be enabled */
  requiresBook?: boolean
}

const TABS: TabItem[] = [
  {
    label: 'Stories',
    href: '/tools/story-studio',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    label: 'Characters',
    href: '/tools/story-studio/characters',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    label: 'Illustrations',
    href: '/tools/story-studio/illustrations',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v14.25a1.5 1.5 0 0 0 1.5 1.5Z" />
      </svg>
    ),
    requiresBook: true,
  },
  {
    label: 'Narration',
    href: '/tools/story-studio/narration',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
      </svg>
    ),
    requiresBook: true,
  },
]

interface TabNavigationProps {
  hasActiveBook: boolean
}

export function TabNavigation({ hasActiveBook }: TabNavigationProps) {
  const pathname = usePathname()

  function getActiveTab(): string {
    if (pathname.startsWith('/tools/story-studio/characters')) return '/tools/story-studio/characters'
    if (pathname.startsWith('/tools/story-studio/illustrations')) return '/tools/story-studio/illustrations'
    if (pathname.startsWith('/tools/story-studio/narration')) return '/tools/story-studio/narration'
    // Default: Stories tab (covers /tools/story-studio, /tools/story-studio/bookshelf, etc.)
    return '/tools/story-studio'
  }

  const activeHref = getActiveTab()

  return (
    <nav
      className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      aria-label="Story Studio navigation"
    >
      {TABS.map((tab) => {
        const isActive = activeHref === tab.href
        const isDisabled = tab.requiresBook && !hasActiveBook

        if (isDisabled) {
          return (
            <span
              key={tab.href}
              aria-disabled={true}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                text-slate-300 dark:text-slate-600 cursor-not-allowed
                border-b-2 border-transparent"
              style={{ minHeight: '44px' }}
              title="Select a book first"
            >
              {tab.icon}
              {tab.label}
            </span>
          )
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
              border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            style={{ minHeight: '44px' }}
          >
            {tab.icon}
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
