'use client'

import { useState, useEffect } from 'react'

interface AILoadingSpinnerProps {
  /** Rotating status messages shown below the spinner */
  messages?: string[]
  /** Static subtitle shown below the rotating message */
  subtitle?: string
  /** Interval in ms between message rotations (default 2500) */
  interval?: number
  /** Center icon/emoji inside the ring (default ✦) */
  icon?: React.ReactNode
  /** Size variant (default 'lg') */
  size?: 'sm' | 'md' | 'lg'
}

const DEFAULT_MESSAGES = [
  'Working on it...',
  'Almost there...',
  'Putting it together...',
]

const SIZE_MAP = {
  sm: { ring: 'w-16 h-16', viewBox: '0 0 64 64', cx: 32, cy: 32, r: 24, text: 'text-base', msgText: 'text-sm', subText: 'text-xs' },
  md: { ring: 'w-20 h-20', viewBox: '0 0 80 80', cx: 40, cy: 40, r: 32, text: 'text-xl', msgText: 'text-base', subText: 'text-sm' },
  lg: { ring: 'w-24 h-24', viewBox: '0 0 96 96', cx: 48, cy: 48, r: 40, text: 'text-2xl', msgText: 'text-lg', subText: 'text-sm' },
}

export function AILoadingSpinner({
  messages = DEFAULT_MESSAGES,
  subtitle,
  interval = 2500,
  icon = '✦',
  size = 'lg',
}: AILoadingSpinnerProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length)
    }, interval)
    return () => clearInterval(timer)
  }, [messages, interval])

  const s = SIZE_MAP[size]
  const gradientId = `ai-spinner-grad-${size}`

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className={`relative ${s.ring}`}>
        <svg
          className={`${s.ring} -rotate-90 animate-spin`}
          style={{ animationDuration: '3s' }}
          viewBox={s.viewBox}
        >
          <circle cx={s.cx} cy={s.cy} r={s.r} fill="none" stroke="#1e2631" strokeWidth="4" />
          <circle
            cx={s.cx} cy={s.cy} r={s.r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * s.r}`}
            strokeDashoffset={`${2 * Math.PI * s.r * 0.25}`}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3D6AF2" />
              <stop offset="100%" stopColor="#af88ff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={s.text}>{icon}</span>
        </div>
      </div>
      <p className={`text-white font-bold ${s.msgText}`}>{messages[messageIndex]}</p>
      {subtitle && (
        <p className={`text-[#70767f] ${s.subText} animate-pulse`}>{subtitle}</p>
      )}
    </div>
  )
}
