'use client'

import { usePathname } from 'next/navigation'
import { StudioShell } from '@/tools/story-studio/studio-shell'

/** Routes that use their own layout (no tab shell) */
const STANDALONE_ROUTES = ['/tools/story-studio/book/', '/tools/story-studio/jobs/']

export default function StoryStudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Book reader and job detail pages have their own layouts
  const isStandalone = STANDALONE_ROUTES.some(prefix => pathname.startsWith(prefix))

  if (isStandalone) {
    return <>{children}</>
  }

  // StudioShell handles mobile detection internally — renders children-only on mobile
  return <StudioShell>{children}</StudioShell>
}
