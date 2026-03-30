'use client'

import { useState, type ReactNode } from 'react'
import { useResume } from '../resume-provider'

interface EntryCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  onDelete: () => void
  defaultExpanded?: boolean
}

export function EntryCard({ title, subtitle, children, onDelete, defaultExpanded = true }: EntryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { t } = useResume()

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded(!expanded)
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-gray-400 text-sm" aria-hidden="true">
            {expanded ? '▼' : '▶'}
          </span>
          <div className="min-w-0">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate block">
              {title || 'Untitled'}
            </span>
            {subtitle && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
          aria-label={`${t.actions.delete} ${title}`}
        >
          {t.actions.delete}
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 py-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}
