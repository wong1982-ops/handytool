'use client'

import { usePageTracking } from '@/lib/hooks/use-page-tracking'

export function ToolsLayoutClient({ children }: { children: React.ReactNode }) {
  usePageTracking()
  return <>{children}</>
}
