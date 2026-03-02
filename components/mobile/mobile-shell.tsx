'use client'

import { useState, useCallback } from 'react'
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { BottomTabBar, type TabId } from '@/components/mobile/bottom-tab-bar'
import { TabSwipeContainer } from '@/components/mobile/tab-swipe-container'
import { FavoritesTab } from '@/components/mobile/favorites-tab'
import { ProfileTab } from '@/components/mobile/profile-tab'

interface MobileShellProps {
  children: React.ReactNode // the tools content (existing page)
}

export function MobileShell({ children }: MobileShellProps) {
  const isMobile = useMobileShell()
  const [activeTab, setActiveTab] = useState<TabId>('tools')

  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('ht-theme') !== 'light'
  })

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('ht-theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  if (!isMobile) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader dark={dark} onToggleTheme={toggleTheme} />

      <TabSwipeContainer activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Tools tab — render the existing page content */}
        <div className="pb-16">{children}</div>

        {/* Favorites tab */}
        <div className="pb-16"><FavoritesTab /></div>

        {/* Profile tab */}
        <div className="pb-16"><ProfileTab /></div>
      </TabSwipeContainer>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
