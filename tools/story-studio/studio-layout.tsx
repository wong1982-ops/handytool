'use client'

/**
 * @deprecated Use StudioShell from './studio-shell' instead.
 * This file is kept for backward compatibility during the modular redesign migration.
 * Will be removed after all references are updated.
 */

import { StudioShell } from '@/tools/story-studio/studio-shell'

interface StudioLayoutProps {
  children: React.ReactNode
  bookCount?: number
  seriesCount?: number
}

export function StudioLayout({ children }: StudioLayoutProps) {
  // StudioShell handles everything now — bookCount/seriesCount are ignored
  return <StudioShell>{children}</StudioShell>
}
