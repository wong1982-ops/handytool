'use client'

import { useState, useEffect } from 'react'
import { TEST_CONFIGS } from './constants'
import type { TestId } from './types'

interface DailyChallengeProps {
  onStartChallenge: (testId: TestId) => void
}

function getDailyTestIndex(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dayOfYear % TEST_CONFIGS.length
}

function getTodayKey(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `hb-daily-${yyyy}-${mm}-${dd}`
}

function getTimeUntilMidnight(): string {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function DailyChallenge({ onStartChallenge }: DailyChallengeProps) {
  const [countdown, setCountdown] = useState<string>('--:--:--')
  const [dailyBest, setDailyBest] = useState<number | null>(null)

  const todayTest = TEST_CONFIGS[getDailyTestIndex()]

  useEffect(() => {
    // Read daily best from localStorage
    try {
      const stored = localStorage.getItem(getTodayKey())
      if (stored !== null) {
        setDailyBest(Number(stored))
      }
    } catch {
      // localStorage unavailable
    }

    // Initialize countdown immediately
    setCountdown(getTimeUntilMidnight())

    // Update countdown every second
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-[var(--tk-color-primary-500)] to-purple-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white" />
        <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Daily Challenge
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-1">{todayTest.name}</h2>
          <p className="text-white/80 text-sm max-w-md">{todayTest.description}</p>
          {dailyBest !== null && (
            <p className="text-white/70 text-xs mt-2">
              Today&apos;s best: <span className="font-bold text-white">{dailyBest} {todayTest.unit}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-white/60 text-xs uppercase tracking-wider">Next challenge in</p>
            <p className="text-2xl font-mono font-bold tabular-nums">{countdown}</p>
          </div>
          <button
            onClick={() => onStartChallenge(todayTest.id)}
            className="bg-white text-slate-900 font-semibold px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors text-sm cursor-pointer"
          >
            Take Challenge
          </button>
        </div>
      </div>
    </div>
  )
}
