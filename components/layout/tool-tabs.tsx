'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLAnchorElement>(null)
  const [showFadeRight, setShowFadeRight] = useState(false)
  const [showFadeLeft, setShowFadeLeft] = useState(false)

  // Auto-scroll the active tab into view on mount/navigation
  useEffect(() => {
    if (activeTabRef.current && scrollerRef.current) {
      const tab = activeTabRef.current
      const scroller = scrollerRef.current
      const tabLeft = tab.offsetLeft
      const tabRight = tabLeft + tab.offsetWidth
      const viewLeft = scroller.scrollLeft
      const viewRight = viewLeft + scroller.clientWidth
      if (tabLeft < viewLeft || tabRight > viewRight) {
        scroller.scrollTo({ left: tabLeft - 16, behavior: 'smooth' })
      }
    }
  }, [pathname])

  // Update fade indicators on scroll/resize
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scroller
      setShowFadeLeft(scrollLeft > 4)
      setShowFadeRight(scrollLeft + clientWidth < scrollWidth - 4)
    }
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      scroller.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [tabs.length])

  return (
    <nav
      className={`relative shrink-0 sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 border-b ${theme.border}`}
      aria-label="Tool navigation"
    >
      <div ref={scrollerRef} className="overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href + '/'))
            return (
              <Link
                key={tab.href}
                ref={isActive ? activeTabRef : undefined}
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
      </div>
      {showFadeLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent" />
      )}
      {showFadeRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent" />
      )}
    </nav>
  )
}
