'use client'

import React from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DashboardWidget } from './types'

interface WidgetCardProps {
  widget: DashboardWidget
  toolName: string
  toolIcon: React.ReactNode
  toolColor: string
  category: 'creative' | 'utility' | 'interactive'
  onRemove: (id: string) => void
  onResize: (id: string) => void
}

const CATEGORY_BADGE: Record<'creative' | 'utility' | 'interactive', string> = {
  creative: 'bg-amber-500/20 text-amber-400',
  utility: 'bg-blue-500/20 text-blue-400',
  interactive: 'bg-cyan-500/20 text-cyan-400',
}

const CATEGORY_LABEL: Record<'creative' | 'utility' | 'interactive', string> = {
  creative: 'Creative',
  utility: 'Utility',
  interactive: 'Interactive',
}

function getGridSpan(size: DashboardWidget['size']): string {
  if (size === 'small') return 'col-span-1'
  if (size === 'medium') return 'col-span-1 md:col-span-2'
  return 'col-span-1 md:col-span-2 md:row-span-2'
}

export function WidgetCard({
  widget,
  toolName,
  toolIcon,
  toolColor: _toolColor,
  category,
  onRemove,
  onResize,
}: WidgetCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const toolPath = '/tools/' + widget.toolSlug
  const badgeClass = CATEGORY_BADGE[category]
  const categoryLabel = CATEGORY_LABEL[category]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${getGridSpan(widget.size)} rounded-xl bg-[#131a23] border border-[#1e2631] group relative transition-colors hover:bg-[#1e2631] cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      {/* Delete button */}
      <button
        type="button"
        aria-label={`Remove ${toolName}`}
        onClick={(e) => { e.stopPropagation(); onRemove(widget.id) }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-full bg-[#1e2631] text-[#8892a4] hover:bg-red-500/20 hover:text-red-400 z-10"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Resize handle */}
      <button
        type="button"
        aria-label={`Resize ${toolName}`}
        onClick={(e) => { e.stopPropagation(); onResize(widget.id) }}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded bg-[#1e2631] text-[#8892a4] hover:text-white z-10"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      {/* Small size content */}
      {widget.size === 'small' && (
        <div className="p-3 flex flex-col items-center gap-1.5 h-full">
          <div className="w-5 h-5 flex items-center justify-center text-white [&_svg]:w-5 [&_svg]:h-5">
            {toolIcon}
          </div>
          <span className="text-xs text-white truncate w-full text-center leading-tight">{toolName}</span>
          <Link
            href={toolPath}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-[11px] text-[#3D6AF2] hover:text-[#3D9DF2] transition-colors"
          >
            Open →
          </Link>
        </div>
      )}

      {/* Medium size content */}
      {widget.size === 'medium' && (
        <div className="p-4 flex flex-row items-center gap-3">
          <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-white [&_svg]:w-7 [&_svg]:h-7">
            {toolIcon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">{toolName}</p>
            <p className="text-xs text-[#8892a4] leading-tight mt-0.5">Quick access</p>
          </div>
          <Link
            href={toolPath}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-shrink-0 px-3 h-9 flex items-center rounded-lg bg-[#131a23] border border-[#1e2631] text-sm text-[#8892a4] hover:text-white hover:border-[#2e3a4d] transition-colors"
          >
            Open
          </Link>
        </div>
      )}

      {/* Large size content */}
      {widget.size === 'large' && (
        <div className="p-5 flex flex-col gap-3 h-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-white [&_svg]:w-9 [&_svg]:h-9">
              {toolIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white leading-tight truncate">{toolName}</p>
            </div>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeClass}`}>
              {categoryLabel}
            </span>
          </div>
          <p className="text-[13px] text-[#8892a4] leading-relaxed">
            Quick access to {toolName}
          </p>
          <div className="mt-auto">
            <Link
              href={toolPath}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center justify-center w-full h-11 rounded-lg bg-gradient-to-r from-[#3D6AF2] to-[#3D9DF2] text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Open Tool
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
