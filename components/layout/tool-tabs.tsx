'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ToolCategory } from './tool-categories'
import { getCategoryTheme } from './tool-categories'

export interface ToolTab {
  label: string
  href: string
  icon?: React.ReactNode
}

interface ToolTabsProps {
  tabs: ToolTab[]
  category: ToolCategory
}

export function ToolTabs({ tabs, category }: ToolTabsProps) {
  const pathname = usePathname()
  const theme = getCategoryTheme(category)

  return (
    <nav
      className={`shrink-0 sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 border-b ${theme.border} overflow-x-auto`}
      aria-label="Tool navigation"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href + '/'))
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? `${theme.iconAccent} border-current`
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
