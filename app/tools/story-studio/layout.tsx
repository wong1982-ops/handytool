'use client'

import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useMobileShell } from '@/lib/hooks/use-mobile-shell'
import { StudioMobileHeader } from '@/tools/story-studio/mobile-header'
import { StudioMobileSidebar } from '@/tools/story-studio/mobile-sidebar'

const PAGE_TITLES: Record<string, string> = {
  '/tools/story-studio': 'Story Studio',
  '/tools/story-studio/bookshelf': 'Bookshelf',
  '/tools/story-studio/series': 'Series',
  '/tools/story-studio/scan': 'Scan & Create',
}

function getTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Series detail
  if (pathname.startsWith('/tools/story-studio/series/')) return 'Series'
  // Book page
  if (pathname.startsWith('/tools/story-studio/book/')) return 'Story Studio'
  // Job detail
  if (pathname.startsWith('/tools/story-studio/jobs/')) return 'Job Progress'
  return 'Story Studio'
}

export default function StoryStudioLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMobileShell()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  // Desktop: transparent wrapper, pages handle their own layout
  if (!isMobile) {
    return <>{children}</>
  }

  // Mobile: custom header + sidebar + full-height content
  const title = getTitle(pathname)

  return (
    <div className="flex flex-col h-full">
      <StudioMobileHeader title={title} onMenuToggle={toggleSidebar} />
      <StudioMobileSidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
