'use client'

import Link from 'next/link'
import { FavoriteButton } from '@/components/ui/favorite-button'
import type { ToolCategory } from './tool-categories'
import { getCategoryTheme } from './tool-categories'

interface ToolHeaderProps {
  toolName: string
  toolSlug: string
  category: ToolCategory
  variant: 'standard' | 'compact'
  icon?: React.ReactNode
}

export function ToolHeader({ toolName, toolSlug, category, variant, icon }: ToolHeaderProps) {
  const theme = getCategoryTheme(category)

  if (variant === 'compact') {
    return (
      <header className={`shrink-0 bg-gradient-to-r ${theme.gradient} px-4 py-2.5`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-full text-slate-300 hover:text-white transition-colors"
            aria-label="Home"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          {icon && <span className={theme.iconAccent}>{icon}</span>}
          <h1 className="text-base font-semibold text-white truncate">{toolName}</h1>
          <span className="flex-1" />
          <FavoriteButton slug={toolSlug} name={toolName} />
        </div>
      </header>
    )
  }

  return (
    <header className={`shrink-0 relative bg-gradient-to-r ${theme.gradient}`}>
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pt-5 md:pb-5">
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-white font-medium">{toolName}</span>
        </nav>
        <div className="mt-2 md:mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-slate-300 hover:text-white transition-colors"
              aria-label="Home"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            {icon && <span className={`text-2xl ${theme.iconAccent}`}>{icon}</span>}
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{toolName}</h1>
          </div>
          <FavoriteButton slug={toolSlug} name={toolName} />
        </div>
      </div>
    </header>
  )
}
