'use client'

import type { ToolCategory } from './tool-categories'
import { getCategoryTheme } from './tool-categories'

interface ToolActionBarProps {
  category: ToolCategory
  children: React.ReactNode
}

export function ToolActionBar({ category, children }: ToolActionBarProps) {
  const theme = getCategoryTheme(category)

  return (
    <div
      className={`shrink-0 border-t ${theme.border} ${theme.bgSubtle} backdrop-blur-sm px-4 md:px-6 py-3`}
      role="toolbar"
      aria-label="Actions"
    >
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}
