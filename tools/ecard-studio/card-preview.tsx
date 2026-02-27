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
/*  Shared text style builders                                        */
/* ------------------------------------------------------------------ */

function headingStyle(data: ECardData) {
  return {
    fontFamily: data.fontFamily,
    fontSize: data.fontSize,
    lineHeight: data.lineHeight,
    fontStyle: 'italic' as const,
    fontWeight: data.bold ? 700 : 400,
    color: data.accentColor,
    margin: 0,
  }
}

function subheadingStyle(data: ECardData, bodyTextColor: string) {
  return {
    fontFamily: data.fontFamily,
    fontSize: 16,
    lineHeight: 1.4,
    color: bodyTextColor,
    margin: '8px 0 0',
  }
}

function bodyStyle(data: ECardData, bodyTextColor: string) {
  return {
    fontFamily: data.fontFamily,
    fontSize: 14,
    lineHeight: 1.6,
    color: bodyTextColor,
    margin: '16px 0 0',
  }
}

function companyNameStyle(data: ECardData) {
  return {
    fontFamily: data.fontFamily,
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: data.accentColor,
    margin: 0,
  }
}

function companyTaglineStyle(data: ECardData, mutedTextColor: string) {
  return {
    fontFamily: data.fontFamily,
    fontSize: 12,
    color: mutedTextColor,
    margin: '4px 0 0',
  }
}

/* ------------------------------------------------------------------ */
/*  Layout renderers                                                  */
/* ------------------------------------------------------------------ */

/** Classic centered layout — content vertically centered, company at bottom. */
function LayoutCentered({ data, bodyTextColor, mutedTextColor }: LayoutProps) {
  return (
    <div
      className="relative z-10 flex flex-col justify-center h-full"
      style={{ padding: 40, textAlign: data.textAlign }}
    >
      {data.heading && <h2 style={headingStyle(data)}>{data.heading}</h2>}
      {data.subheading && <p style={subheadingStyle(data, bodyTextColor)}>{data.subheading}</p>}
      {data.body && <p style={bodyStyle(data, bodyTextColor)}>{data.body}</p>}
      <div className="flex-1 min-h-4" />
      {data.companyName && <p style={companyNameStyle(data)}>{data.companyName}</p>}
      {data.companyTagline && <p style={companyTaglineStyle(data, mutedTextColor)}>{data.companyTagline}</p>}
    </div>
  )
}

/** Left layout — left accent bar, content left-aligned. */
function LayoutLeft({ data, bodyTextColor, mutedTextColor }: LayoutProps) {
  return (
    <div className="relative z-10 flex h-full">
      {/* Left accent bar */}
      <div
        style={{ width: 6, backgroundColor: data.accentColor, flexShrink: 0 }}
      />
      <div
        className="flex flex-col justify-center flex-1"
        style={{ padding: '36px 40px', textAlign: data.textAlign }}
      >
        {data.heading && <h2 style={headingStyle(data)}>{data.heading}</h2>}
        {data.subheading && <p style={subheadingStyle(data, bodyTextColor)}>{data.subheading}</p>}
        {data.body && <p style={bodyStyle(data, bodyTextColor)}>{data.body}</p>}
        <div className="flex-1 min-h-4" />
        {data.companyName && <p style={companyNameStyle(data)}>{data.companyName}</p>}
        {data.companyTagline && <p style={companyTaglineStyle(data, mutedTextColor)}>{data.companyTagline}</p>}
      </div>
    </div>
  )
}

/** Split layout — accent panel on left with company info, content on right. */
function LayoutSplit({ data, bodyTextColor, mutedTextColor }: LayoutProps) {
  return (
    <div className="relative z-10 flex h-full">
      {/* Left panel — accent area with company info */}
      <div
        className="flex flex-col justify-end"
        style={{
          width: 200,
          flexShrink: 0,
          padding: '32px 24px',
          backgroundColor: `${data.accentColor}18`,
        }}
      >
        {data.companyName && (
          <p style={{ ...companyNameStyle(data), fontSize: 13 }}>{data.companyName}</p>
        )}
        {data.companyTagline && (
          <p style={companyTaglineStyle(data, mutedTextColor)}>{data.companyTagline}</p>
        )}
      </div>
      {/* Right panel — main content */}
      <div
        className="flex flex-col justify-center flex-1"
        style={{ padding: '32px 36px', textAlign: data.textAlign }}
      >
        {data.heading && <h2 style={headingStyle(data)}>{data.heading}</h2>}
        {data.subheading && <p style={subheadingStyle(data, bodyTextColor)}>{data.subheading}</p>}
        {data.body && <p style={{ ...bodyStyle(data, bodyTextColor), margin: '12px 0 0' }}>{data.body}</p>}
      </div>
    </div>
  )
}

/** Right-banner layout — decorative left area, content right-aligned. */
function LayoutRightBanner({ data, bodyTextColor, mutedTextColor }: LayoutProps) {
  return (
    <div className="relative z-10 flex h-full">
      {/* Left decorative area */}
      <div style={{ width: 160, flexShrink: 0 }} />
      {/* Right content area */}
      <div
        className="flex flex-col justify-center flex-1"
        style={{ padding: '32px 36px', textAlign: data.textAlign }}
      >
        {data.heading && <h2 style={headingStyle(data)}>{data.heading}</h2>}
        {data.subheading && <p style={subheadingStyle(data, bodyTextColor)}>{data.subheading}</p>}
        {data.body && <p style={bodyStyle(data, bodyTextColor)}>{data.body}</p>}
        <div className="flex-1 min-h-4" />
        {data.companyName && <p style={companyNameStyle(data)}>{data.companyName}</p>}
        {data.companyTagline && <p style={companyTaglineStyle(data, mutedTextColor)}>{data.companyTagline}</p>}
      </div>
      {/* Right accent bar */}
      <div
        style={{ width: 6, backgroundColor: data.accentColor, flexShrink: 0 }}
      />
    </div>
  )
}

/** Minimal layout — name large top-left, company bottom-right, airy spacing. */
function LayoutMinimal({ data, bodyTextColor, mutedTextColor }: LayoutProps) {
  return (
    <div className="relative z-10 flex flex-col h-full" style={{ padding: '40px 48px' }}>
      {/* Top: heading + subheading */}
      <div style={{ textAlign: 'left' }}>
        {data.heading && (
          <h2 style={{ ...headingStyle(data), fontSize: data.fontSize * 1.1 }}>
            {data.heading}
          </h2>
        )}
        {data.subheading && <p style={subheadingStyle(data, bodyTextColor)}>{data.subheading}</p>}
      </div>

      {/* Middle: body text centered */}
      <div className="flex-1 flex items-center">
        {data.body && (
          <p style={{ ...bodyStyle(data, bodyTextColor), margin: 0, maxWidth: 320 }}>
            {data.body}
          </p>
        )}
      </div>

      {/* Bottom: company info right-aligned */}
      <div style={{ textAlign: 'right' }}>
        {data.companyName && <p style={companyNameStyle(data)}>{data.companyName}</p>}
        {data.companyTagline && <p style={companyTaglineStyle(data, mutedTextColor)}>{data.companyTagline}</p>}
      </div>
    </div>
  )
}

interface LayoutProps {
  data: ECardData
  bodyTextColor: string
  mutedTextColor: string
}

const LAYOUT_RENDERERS: Record<ECardData['layout'], React.FC<LayoutProps>> = {
  centered: LayoutCentered,
  left: LayoutLeft,
  split: LayoutSplit,
  'right-banner': LayoutRightBanner,
  minimal: LayoutMinimal,
}

/* ------------------------------------------------------------------ */
/*  Business Card Layout                                              */
/* ------------------------------------------------------------------ */

/** Contact info icon components for business card layout */
function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/** Business card 2-column layout: left (name/title/company) + right (contact info) */
function LayoutBusinessCard({ data, bodyTextColor, mutedTextColor }: LayoutProps) {
  const contactFields = [
    { icon: <PhoneIcon />, value: data.phone },
    { icon: <EmailIcon />, value: data.email },
    { icon: <GlobeIcon />, value: data.website },
    { icon: <MapPinIcon />, value: data.address },
  ].filter((f) => f.value?.trim())

  return (
    <div
      className="relative z-10 flex h-full"
      style={{ padding: '28px 32px' }}
    >
      {/* LEFT column (60%) — Name, title, company */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '60%', flexShrink: 0, paddingRight: 24 }}
      >
        {data.heading && <h2 style={headingStyle(data)}>{data.heading}</h2>}
        {data.subheading && <p style={subheadingStyle(data, bodyTextColor)}>{data.subheading}</p>}
        <div className="flex-1 min-h-3" />
        {data.companyName && <p style={companyNameStyle(data)}>{data.companyName}</p>}
        {data.companyTagline && <p style={companyTaglineStyle(data, mutedTextColor)}>{data.companyTagline}</p>}
      </div>

      {/* RIGHT column (40%) — Contact info */}
      <div
        className="flex flex-col justify-center gap-2"
        style={{ width: '40%', flexShrink: 0, borderLeft: `1px solid ${data.accentColor}30`, paddingLeft: 24 }}
      >
        {contactFields.map((field, i) => (
          <div key={i} className="flex items-start gap-2" style={{ color: bodyTextColor }}>
            <span style={{ color: data.accentColor, flexShrink: 0, marginTop: 1 }}>
              {field.icon}
            </span>
            <span
              style={{
                fontFamily: data.fontFamily,
                fontSize: 14,
                lineHeight: 1.4,
                color: bodyTextColor,
                wordBreak: 'break-word',
              }}
            >
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
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

    /* Business card uses 3.5:2 ratio, ecards use default 600x400 (3:2) */
    const isBusinessCard = data.cardType === 'business-card'
    const cardWidth = isBusinessCard ? 630 : 600
    const cardHeight = isBusinessCard ? 360 : 400

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
        if (!onLogoMove || !data.logoUrl || !cardElRef.current) return
        const rect = cardElRef.current.getBoundingClientRect()
        const clickX = ((e.clientX - rect.left) / rect.width) * 100
        const clickY = ((e.clientY - rect.top) / rect.height) * 100
        const logoPxW = (60 / cardWidth) * 100
        const logoPxH = (60 / cardHeight) * 100
        const dx = Math.abs(clickX - data.logoX)
        const dy = Math.abs(clickY - data.logoY)
        if (dx > logoPxW && dy > logoPxH) return
        draggingRef.current = true
        cardElRef.current.setPointerCapture(e.pointerId)
        e.preventDefault()
      },
      [onLogoMove, data.logoUrl, data.logoX, data.logoY, cardWidth, cardHeight],
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
    const patternBg = getPatternBackground(data.backgroundPattern, {
      accentColor: data.accentColor,
      opacity: data.patternOpacity,
      scale: data.patternScale,
      customPatternUrl: data.customPatternUrl,
    })

    const mutedTextColor = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'
    const bodyTextColor = dark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'

    const LayoutRenderer = isBusinessCard
      ? LayoutBusinessCard
      : (LAYOUT_RENDERERS[data.layout] ?? LayoutCentered)

    return (
      <div
        className={className}
        style={{
          width: cardWidth * scale,
          height: cardHeight * scale,
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
            width: cardWidth,
            height: cardHeight,
            backgroundColor: data.backgroundColor,
            backgroundImage: patternBg.backgroundImage,
            backgroundSize: patternBg.backgroundSize,
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
            touchAction: data.logoUrl && onLogoMove ? 'none' : undefined,
          }}
          className="relative select-none"
        >
          <LayoutRenderer
            data={data}
            bodyTextColor={bodyTextColor}
            mutedTextColor={mutedTextColor}
          />

          {/* Logo — absolute positioned, draggable */}
          {data.logoUrl && (
            <img
              src={data.logoUrl}
              alt="Logo"
              data-logo
              className="z-[5] pointer-events-none"
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

          {/* Bottom accent bar — only for centered layout, others handle accents differently */}
          {data.borderAccents && data.layout === 'centered' && (
            <div
              className="absolute bottom-0 left-0 w-full"
              style={{ height: 4, backgroundColor: data.accentColor }}
            />
          )}
        </div>
      </div>
    )
  },
)

CardPreview.displayName = 'CardPreview'

export default CardPreview
