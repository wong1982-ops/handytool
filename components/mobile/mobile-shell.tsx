'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'
import { useAuth } from '@/lib/hooks/use-auth'
import { MobileHeader } from '@/components/mobile/mobile-header'
import { BottomTabBar, type TabId } from '@/components/mobile/bottom-tab-bar'
import { TabSwipeContainer } from '@/components/mobile/tab-swipe-container'
import { FavoritesTab } from '@/components/mobile/favorites-tab'
import { BillingTab } from '@/components/mobile/billing-tab'
import { ProfileTab } from '@/components/mobile/profile-tab'
import { ToolsTab } from '@/components/mobile/tools-tab'

/** Routes that opt out of MobileShell wrapping (custom full-screen layout) */
const FULL_SCREEN_PATHS = ['/tools/story-studio']

interface MobileShellProps {
  children: React.ReactNode // the tools content (existing page)
}

const TAB_KEY = 'toolk1t-active-tab'

export function MobileShell({ children }: MobileShellProps) {
  const isMobile = useMobileShell()
  const pathname = usePathname()
  const { user } = useAuth()

  // Story Studio uses its own custom full-screen layout — skip MobileShell
  const isFullScreen = FULL_SCREEN_PATHS.some(p => pathname.startsWith(p))
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window === 'undefined') return 'tools'
    const saved = sessionStorage.getItem(TAB_KEY) as TabId | null
    return saved === 'favorites' || saved === 'billing' || saved === 'profile' ? saved : 'tools'
  })

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    sessionStorage.setItem(TAB_KEY, tab)
  }, [])

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

  // Full-screen routes (e.g. Story Studio) render children directly — no tabs, no bottom bar
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-slate-950">
        {children}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50 dark:bg-slate-950">
      <MobileHeader dark={dark} onToggleTheme={toggleTheme} />

      <TabSwipeContainer activeTab={activeTab} onTabChange={handleTabChange}>
        {/* Tools tab — drill-down navigation with back button */}
        <div className="pb-16"><ToolsTab>{children}</ToolsTab></div>

        {/* Favorites tab */}
        <div className="pb-16"><FavoritesTab onNavigate={() => handleTabChange('tools')} /></div>

        {/* Billing tab */}
        <div className="pb-16"><BillingTab /></div>

        {/* Profile tab */}
        <div className="pb-16"><ProfileTab /></div>
      </TabSwipeContainer>

      <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} user={user} />
    </div>
  )
}
