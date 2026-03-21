'use client'

import { useState, useEffect } from 'react'

const ICONS: { svg: React.ReactNode; top: string; left: string; duration: string; delay: string; opacity: string }[] = [
  {
    svg: <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />,
    top: '8%', left: '12%', duration: '18s', delay: '0s', opacity: '0.07',
  },
  {
    svg: <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />,
    top: '15%', left: '78%', duration: '21s', delay: '1s', opacity: '0.06',
  },
  {
    svg: <polygon points="12,4 20,20 4,20" stroke="currentColor" strokeWidth="1.5" fill="none" />,
    top: '65%', left: '8%', duration: '19s', delay: '2s', opacity: '0.08',
  },
  {
    svg: <><polyline points="8,4 4,12 8,20" stroke="currentColor" strokeWidth="1.5" fill="none" /><polyline points="16,4 20,12 16,20" stroke="currentColor" strokeWidth="1.5" fill="none" /></>,
    top: '72%', left: '85%', duration: '23s', delay: '0.5s', opacity: '0.06',
  },
  {
    svg: <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />,
    top: '35%', left: '92%', duration: '17s', delay: '3s', opacity: '0.07',
  },
  {
    svg: <><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" /><line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" /><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" /></>,
    top: '82%', left: '45%', duration: '20s', delay: '1.5s', opacity: '0.06',
  },
  {
    svg: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" /><path d="M12 3a9 9 0 0 1 0 18" stroke="currentColor" strokeWidth="1.5" fill="none" /><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" /></>,
    top: '5%', left: '50%', duration: '25s', delay: '2.5s', opacity: '0.07',
  },
  {
    svg: <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" stroke="currentColor" strokeWidth="1.5" fill="none" />,
    top: '48%', left: '5%', duration: '22s', delay: '0.8s', opacity: '0.08',
  },
  {
    svg: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" fill="none" />,
    top: '22%', left: '35%', duration: '16s', delay: '1.2s', opacity: '0.06',
  },
  {
    svg: <><rect x="6" y="6" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="9" cy="9" r="1.5" stroke="currentColor" strokeWidth="1" fill="none" /></>,
    top: '55%', left: '60%', duration: '15s', delay: '3.5s', opacity: '0.07',
  },
]

export function FloatingIcons() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {!reducedMotion && (
        <style dangerouslySetInnerHTML={{
          __html: `@keyframes floatIcon { 0%, 100% { transform: translateY(-15px) rotate(-3deg); } 50% { transform: translateY(15px) rotate(3deg); } }`,
        }} />
      )}
      {ICONS.map((icon, i) => (
        <div
          key={i}
          className="absolute text-white"
          style={{
            top: icon.top,
            left: icon.left,
            opacity: icon.opacity,
            animation: reducedMotion ? 'none' : `floatIcon ${icon.duration} ease-in-out infinite`,
            animationDelay: reducedMotion ? undefined : icon.delay,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {icon.svg}
          </svg>
        </div>
      ))}
    </div>
  )
}
