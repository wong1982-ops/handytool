'use client'

import { ToolHeader } from './tool-header'
import { ToolTabs, type ToolTab } from './tool-tabs'
import { ToolActionBar } from './tool-action-bar'
import { getToolCategory, type ToolCategory } from './tool-categories'

interface ToolFrameProps {
  toolName: string
  toolSlug: string
  category?: ToolCategory
  variant?: 'standard' | 'compact'
  icon?: React.ReactNode
  tabs?: ToolTab[]
  actions?: React.ReactNode
  children: React.ReactNode
}

export function ToolFrame({
  toolName,
  toolSlug,
  category,
  variant = 'standard',
  icon,
  tabs,
  actions,
  children,
}: ToolFrameProps) {
  const resolvedCategory = category || getToolCategory(toolSlug)

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <ToolHeader
        toolName={toolName}
        toolSlug={toolSlug}
        category={resolvedCategory}
        variant={variant}
        icon={icon}
      />

      {variant === 'standard' && tabs && tabs.length > 0 && (
        <ToolTabs tabs={tabs} category={resolvedCategory} />
      )}

      <main
        className={`flex-1 overflow-y-auto min-h-0 ${
          variant === 'standard' ? 'bg-slate-50 dark:bg-slate-950' : ''
        }`}
      >
        {variant === 'standard' ? (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      {actions && (
        <ToolActionBar category={resolvedCategory}>
          {actions}
        </ToolActionBar>
      )}
    </div>
  )
}
