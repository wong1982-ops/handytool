'use client'

interface FaceGuidesProps {
  visible: boolean
}

/**
 * Simple transparent dot guides for ID photo face positioning.
 * Shows key alignment points: eye line, chin, head top, center line.
 */
export function FaceGuides({ visible }: FaceGuidesProps) {
  if (!visible) return null

  const dotColor = 'rgba(50, 169, 217, 0.35)' // tk-color-secondary at 35% opacity
  const lineColor = 'rgba(50, 169, 217, 0.15)'

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Vertical center line (dotted) */}
        <line x1="50" y1="5" x2="50" y2="95" stroke={lineColor} strokeWidth="0.3" strokeDasharray="1.5 1.5" />

        {/* Horizontal eye line (~40% from top) */}
        <line x1="25" y1="40" x2="75" y2="40" stroke={lineColor} strokeWidth="0.3" strokeDasharray="1.5 1.5" />

        {/* Head top guide dot */}
        <circle cx="50" cy="12" r="1.2" fill={dotColor} />
        <circle cx="50" cy="12" r="2.5" fill="none" stroke={dotColor} strokeWidth="0.3" />

        {/* Left eye dot */}
        <circle cx="40" cy="40" r="1" fill={dotColor} />

        {/* Right eye dot */}
        <circle cx="60" cy="40" r="1" fill={dotColor} />

        {/* Nose dot */}
        <circle cx="50" cy="50" r="0.8" fill={dotColor} />

        {/* Chin dot */}
        <circle cx="50" cy="62" r="1.2" fill={dotColor} />
        <circle cx="50" cy="62" r="2.5" fill="none" stroke={dotColor} strokeWidth="0.3" />

        {/* Shoulder guide dots */}
        <circle cx="30" cy="80" r="0.8" fill={dotColor} />
        <circle cx="70" cy="80" r="0.8" fill={dotColor} />

        {/* Face oval (very subtle) */}
        <ellipse cx="50" cy="38" rx="18" ry="24" fill="none" stroke={dotColor} strokeWidth="0.4" strokeDasharray="2 2" />
      </svg>
    </div>
  )
}
