'use client'

import { BackButton } from '@/components/ui/back-button'
import { FavoriteButton } from '@/components/ui/favorite-button'

interface ToolBreadcrumbProps {
  toolName: string
  toolSlug: string
  className?: string
}

export function ToolBreadcrumb({ toolName, toolSlug, className = 'mb-6 md:mb-4' }: ToolBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center justify-between ${className}`}>
      {/* Mobile: iOS-style back button */}
      <BackButton />

      {/* Desktop: breadcrumb */}
      <ol className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-slate-900 dark:text-white font-medium">{toolName}</li>
      </ol>

      <FavoriteButton slug={toolSlug} name={toolName} />
    </nav>
  )
}
