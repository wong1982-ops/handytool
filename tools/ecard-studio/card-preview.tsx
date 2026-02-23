'use client'

import { forwardRef, useCallback, useRef } from 'react'
import type { ECardData } from '@/tools/ecard-studio/types'
import { getPatternBackground } from '@/tools/ecard-studio/patterns'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Returns true if the hex color is perceptually dark (avg channel < 128). */
function isDarkBackground(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return (r + g + b) / 3 < 128
}

/* ------------------------------------------------------------------ */
/*  Card Preview Component                                            */
/* ------------------------------------------------------------------ */

export interface CardPreviewProps {
  data: ECardData
  scale?: number
  className?: string
  /** Called when the user drags the logo to a new position (percentage 0-100). */
  onLogoMove?: (logoX: number, logoY: number) => void
}

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  function CardPreview({ data, scale = 1, className, onLogoMove }, ref) {
    const draggingRef = useRef(false)
    const cardElRef = useRef<HTMLDivElement | null>(null)

    const setRefs = useCallback(
      (el: HTMLDivElement | null) => {
        cardElRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
      },
      [ref],
    )

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (!onLogoMove || !data.logoUrl) return
        const target = e.target as HTMLElement
        if (!target.closest('[data-logo]')) return
        draggingRef.current = true
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        e.preventDefault()
      },
      [onLogoMove, data.logoUrl],
    )

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!draggingRef.current || !cardElRef.current || !onLogoMove) return
        const rect = cardElRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
        onLogoMove(Math.round(x), Math.round(y))
      },
      [onLogoMove],
    )

    const handlePointerUp = useCallback(() => {
      draggingRef.current = false
    }, [])
    const dark = isDarkBackground(data.backgroundColor)
    const patternBg = getPatternBackground(data.backgroundPattern, data.accentColor)

    const mutedTextColor = dark
      ? 'rgba(255,255,255,0.55)'
      : 'rgba(0,0,0,0.45)'
    const bodyTextColor = dark
      ? 'rgba(255,255,255,0.8)'
      : 'rgba(0,0,0,0.7)'

    return (
      <div
        className={className}
        style={{
          width: 600 * scale,
          height: 400 * scale,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          ref={setRefs}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            width: 600,
            height: 400,
            backgroundColor: data.backgroundColor,
            backgroundImage: patternBg,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
            cursor: data.logoUrl && onLogoMove ? 'default' : undefined,
          }}
          className="relative select-none"
        >
          {/* Content area */}
          <div
            className="relative z-10 flex flex-col justify-center h-full"
            style={{ padding: 40, textAlign: data.textAlign }}
          >
            {/* Heading */}
            {data.heading && (
              <h2
                style={{
                  fontFamily: data.fontFamily,
                  fontSize: data.fontSize,
                  lineHeight: data.lineHeight,
                  fontStyle: 'italic',
                  fontWeight: data.bold ? 700 : 400,
                  color: data.accentColor,
                  margin: 0,
                }}
              >
                {data.heading}
              </h2>
            )}

            {/* Subheading */}
            {data.subheading && (
              <p
                style={{
                  fontFamily: data.fontFamily,
                  fontSize: 16,
                  lineHeight: 1.4,
                  color: bodyTextColor,
                  margin: '8px 0 0',
                }}
              >
                {data.subheading}
              </p>
            )}

            {/* Body */}
            {data.body && (
              <p
                style={{
                  fontFamily: data.fontFamily,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: bodyTextColor,
                  margin: '16px 0 0',
                }}
              >
                {data.body}
              </p>
            )}

            {/* Spacer pushes company info toward bottom */}
            <div className="flex-1 min-h-4" />

            {/* Company name */}
            {data.companyName && (
              <p
                style={{
                  fontFamily: data.fontFamily,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: data.accentColor,
                  margin: 0,
                }}
              >
                {data.companyName}
              </p>
            )}

            {/* Company tagline */}
            {data.companyTagline && (
              <p
                style={{
                  fontFamily: data.fontFamily,
                  fontSize: 12,
                  color: mutedTextColor,
                  margin: '4px 0 0',
                }}
              >
                {data.companyTagline}
              </p>
            )}
          </div>

          {/* Logo — rendered under text content */}
          {data.logoUrl && (
            <img
              src={data.logoUrl}
              alt="Logo"
              data-logo
              className={`z-[5] ${onLogoMove ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
              style={{
                position: 'absolute',
                width: 60,
                height: 60,
                objectFit: 'contain',
                left: `${data.logoX}%`,
                top: `${data.logoY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          {/* Bottom accent bar */}
          {data.borderAccents && (
            <div
              className="absolute bottom-0 left-0 w-full"
              style={{
                height: 4,
                backgroundColor: data.accentColor,
              }}
            />
          )}
        </div>
      </div>
    )
  },
)

CardPreview.displayName = 'CardPreview'

export default CardPreview
