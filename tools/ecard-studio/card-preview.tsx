'use client'

import { forwardRef } from 'react'
import type { ECardData, LogoPosition } from '@/tools/ecard-studio/types'
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

/** Map logo position to CSS positioning. */
function getLogoStyle(position: LogoPosition): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute', width: 60, height: 60, objectFit: 'contain' }
  switch (position) {
    case 'top-left': return { ...base, top: 16, left: 16 }
    case 'top-right': return { ...base, top: 16, right: 16 }
    case 'bottom-left': return { ...base, bottom: 16, left: 16 }
    case 'bottom-right': return { ...base, bottom: 16, right: 16 }
  }
}

/* ------------------------------------------------------------------ */
/*  Card Preview Component                                            */
/* ------------------------------------------------------------------ */

export interface CardPreviewProps {
  data: ECardData
  scale?: number
  className?: string
}

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  function CardPreview({ data, scale = 1, className }, ref) {
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
          ref={ref}
          style={{
            width: 600,
            height: 400,
            backgroundColor: data.backgroundColor,
            backgroundImage: patternBg,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
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

          {/* Logo overlay */}
          {data.logoUrl && (
            <img
              src={data.logoUrl}
              alt="Logo"
              className="z-20 pointer-events-none"
              style={getLogoStyle(data.logoPosition)}
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
