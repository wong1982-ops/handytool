'use client'

import { useCallback, useRef } from 'react'

interface ComparisonSliderProps {
  position: number
  onChange: (pos: number) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function ComparisonSlider({ position, onChange, containerRef }: ComparisonSliderProps) {
  const isDragging = useRef(false)

  const calcPosition = useCallback(
    (clientX: number) => {
      const container = containerRef.current
      if (!container) return position
      const rect = container.getBoundingClientRect()
      const x = clientX - rect.left
      const pct = (x / rect.width) * 100
      return Math.min(100, Math.max(0, pct))
    },
    [containerRef, position],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      isDragging.current = true
      ;(e.target as HTMLDivElement).setPointerCapture(e.pointerId)
      onChange(calcPosition(e.clientX))
    },
    [calcPosition, onChange],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return
      onChange(calcPosition(e.clientX))
    },
    [calcPosition, onChange],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDragging.current = false
      ;(e.target as HTMLDivElement).releasePointerCapture(e.pointerId)
    },
    [],
  )

  return (
    <div
      className="absolute inset-y-0 z-30"
      style={{ left: `${position}%` }}
    >
      {/* Vertical divider line */}
      <div
        className="absolute inset-y-0 -translate-x-1/2"
        style={{
          width: '2px',
          backgroundColor: 'var(--ht-color-secondary-500, #32A9D9)',
          boxShadow: '0 0 8px rgba(50, 169, 217, 0.4)',
        }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--ht-color-secondary-500, #32A9D9)',
          cursor: 'ew-resize',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="slider"
        aria-label="Comparison slider"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        {/* Two arrows left-right icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none"
        >
          <path
            d="M4.5 3L1 8L4.5 13M11.5 3L15 8L11.5 13"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
