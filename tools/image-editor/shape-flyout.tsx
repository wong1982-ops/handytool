'use client'

import { useRef, useEffect } from 'react'
import { SHAPE_TYPES, SHAPE_LABELS, type ShapeType } from './shape-tools'

interface ShapeFlyoutProps {
  activeShape: ShapeType
  onSelect: (shape: ShapeType) => void
  onClose: () => void
}

const SHAPE_ICONS: Record<ShapeType, React.ReactNode> = {
  'rectangle': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="0" strokeWidth={2} />
    </svg>
  ),
  'ellipse': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="12" rx="9" ry="7" strokeWidth={2} />
    </svg>
  ),
  'line': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="4" y1="20" x2="20" y2="4" strokeWidth={2} strokeLinecap="round" />
    </svg>
  ),
  'arrow': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="4" y1="20" x2="20" y2="4" strokeWidth={2} strokeLinecap="round" />
      <polyline points="14,4 20,4 20,10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'polygon': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12,2 22,9 19,20 5,20 2,9" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  ),
  'star': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ),
  'rounded-rectangle': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="4" strokeWidth={2} />
    </svg>
  ),
  'triangle': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="12,4 22,20 2,20" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  ),
  'custom-polygon': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polygon points="6,3 18,5 20,15 10,21 2,13" strokeWidth={2} strokeLinejoin="round" />
      <circle cx="6" cy="3" r="1.5" fill="currentColor" />
      <circle cx="18" cy="5" r="1.5" fill="currentColor" />
      <circle cx="20" cy="15" r="1.5" fill="currentColor" />
      <circle cx="10" cy="21" r="1.5" fill="currentColor" />
      <circle cx="2" cy="13" r="1.5" fill="currentColor" />
    </svg>
  ),
}

export { SHAPE_ICONS }

export function ShapeFlyout({ activeShape, onSelect, onClose }: ShapeFlyoutProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-full top-0 ml-2 bg-[#1a2333] border border-slate-700 rounded-xl p-2 shadow-xl z-50"
    >
      <div className="grid grid-cols-3 gap-1">
        {SHAPE_TYPES.map((shape) => (
          <button
            key={shape}
            onClick={() => { onSelect(shape); onClose() }}
            title={SHAPE_LABELS[shape]}
            aria-label={SHAPE_LABELS[shape]}
            className={`p-2 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              activeShape === shape
                ? 'bg-[var(--tk-color-primary-500)] text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {SHAPE_ICONS[shape]}
          </button>
        ))}
      </div>
    </div>
  )
}
