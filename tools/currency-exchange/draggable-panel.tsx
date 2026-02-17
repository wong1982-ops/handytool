'use client'

import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const PANEL_TITLES: Record<string, string> = {
  'rate-chart': 'Rate Chart',
  'stats-row': 'Statistics',
  'currency-pairs': 'Top Pairs',
  'external-links': 'External Rates',
}

interface DraggablePanelProps {
  id: string
  colSpan: 1 | 2 | 3
  onColSpanChange: (span: 1 | 2 | 3) => void
  isDragEnabled: boolean
  children: ReactNode
}

export function DraggablePanel({
  id,
  colSpan,
  onColSpanChange,
  isDragEnabled,
  children,
}: DraggablePanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ id, disabled: !isDragEnabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSorting ? transition : undefined,
    gridColumn: isDragEnabled ? `span ${colSpan}` : undefined,
  }

  const title = PANEL_TITLES[id] || id

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${isDragging ? 'opacity-40 z-10' : ''}
        transition-opacity
      `}
    >
      {isDragEnabled && (
        <div className="flex items-center justify-between mb-2 px-1">
          {/* Drag handle */}
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ht-color-primary-500)] focus-visible:outline-none"
            aria-label={`Drag to reorder ${title}`}
            aria-roledescription="sortable"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="3" r="1.5" />
              <circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" />
              <circle cx="11" cy="13" r="1.5" />
            </svg>
          </button>

          {/* Panel title */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
            {title}
          </span>

          {/* Column span toggle */}
          <div className="flex items-center gap-0.5" role="group" aria-label={`${title} width`}>
            {([1, 2, 3] as const).map((span) => (
              <button
                key={span}
                onClick={() => onColSpanChange(span)}
                aria-label={`Set ${title} to ${span} of 3 columns`}
                aria-pressed={colSpan === span}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer
                  ${
                    colSpan === span
                      ? 'bg-[var(--ht-color-primary-500)]/15 text-[var(--ht-color-primary-500)]'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {span}/3
              </button>
            ))}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

/** Render-only version for drag overlay (no interactivity needed) */
export function DraggablePanelOverlay({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  const title = PANEL_TITLES[id] || id

  return (
    <div className="opacity-90 ring-2 ring-[var(--ht-color-primary-500)] rounded-2xl shadow-2xl pointer-events-none">
      <div className="flex items-center justify-center mb-2 px-1 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ht-color-primary-500)] select-none">
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}
