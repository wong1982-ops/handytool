'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'result'

const TOTAL_TARGETS = 30
const TARGET_SIZE_SM = 64 // w-16 = 4rem = 64px
const TARGET_SIZE_MD = 80 // w-20 = 5rem = 80px
const GAME_BG = '#16a34a'

interface TargetPosition {
  x: number
  y: number
}

function getRandomPosition(
  containerWidth: number,
  containerHeight: number,
  targetSize: number
): TargetPosition {
  const maxX = containerWidth - targetSize
  const maxY = containerHeight - targetSize
  return {
    x: Math.max(0, Math.random() * maxX),
    y: Math.max(0, Math.random() * maxY),
  }
}

export function AimTrainer({ onComplete, onBack, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [targetPosition, setTargetPosition] = useState<TargetPosition>({ x: 0, y: 0 })
  const [targetsHit, setTargetsHit] = useState(0)
  const [times, setTimes] = useState<number[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const targetAppearedAt = useRef<number>(0)

  const spawnTarget = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // Use a reasonable target size estimate (between sm and md)
    const targetSize = Math.min(rect.width, rect.height) > 400 ? TARGET_SIZE_MD : TARGET_SIZE_SM
    const pos = getRandomPosition(rect.width, rect.height, targetSize)
    setTargetPosition(pos)
    targetAppearedAt.current = performance.now()
  }, [])

  const handleStart = useCallback(() => {
    setPhase('playing')
    setTargetsHit(0)
    setTimes([])
  }, [])

  // Spawn first target when entering playing phase
  useEffect(() => {
    if (phase === 'playing' && targetsHit === 0 && times.length === 0) {
      // Small delay to let the container render
      requestAnimationFrame(() => {
        spawnTarget()
      })
    }
  }, [phase, targetsHit, times.length, spawnTarget])

  const handleTargetClick = useCallback(() => {
    const now = performance.now()
    const elapsed = Math.round(now - targetAppearedAt.current)
    const newTimes = [...times, elapsed]
    const newHit = targetsHit + 1

    setTimes(newTimes)
    setTargetsHit(newHit)

    if (newHit >= TOTAL_TARGETS) {
      const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length)
      setPhase('result')
      onComplete(avg)
    } else {
      spawnTarget()
    }
  }, [times, targetsHit, spawnTarget, onComplete])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
    setTargetsHit(0)
    setTimes([])
  }, [])

  const remaining = TOTAL_TARGETS - targetsHit

  // --- Intro phase ---
  if (phase === 'intro') {
    return (
      <GameCard bgColor={GAME_BG}>
        <button
          type="button"
          className="text-center text-white w-full h-full flex flex-col items-center justify-center cursor-pointer bg-transparent border-none outline-none min-h-[300px]"
          onClick={handleStart}
          aria-label="Start aim trainer"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 shadow-lg mb-6" />
          <p className="text-3xl md:text-4xl font-bold mb-3">Aim Trainer</p>
          <p className="text-lg text-white/70 mb-6">Click the targets as quickly as you can</p>
          <p className="text-white/50 text-sm">Click to start</p>
        </button>
      </GameCard>
    )
  }

  // --- Playing phase ---
  if (phase === 'playing') {
    return (
      <GameCard bgColor={GAME_BG} badge={`Remaining ${remaining}/${TOTAL_TARGETS}`}>
        <div
          ref={containerRef}
          className="relative w-full min-h-[300px] h-full"
          style={{ minHeight: '300px' }}
        >
          <button
            type="button"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer shadow-lg absolute border-none outline-none transition-colors"
            style={{
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
            }}
            onClick={handleTargetClick}
            aria-label={`Target ${targetsHit + 1} of ${TOTAL_TARGETS}`}
          />
        </div>
      </GameCard>
    )
  }

  // --- Result phase ---
  const average = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
  const fastest = times.length > 0 ? Math.min(...times) : 0
  const slowest = times.length > 0 ? Math.max(...times) : 0

  return (
    <GameCard bgColor={GAME_BG}>
      <div className="text-center text-white px-4">
        <p className="text-lg text-white/70 mb-2">Average Time</p>
        <p className="text-5xl md:text-6xl font-bold mb-1">{average}</p>
        <p className="text-xl text-white/70 mb-6">ms</p>

        <div className="flex justify-center gap-8 mb-6 text-sm">
          <div>
            <p className="text-white/50">Fastest</p>
            <p className="font-bold text-lg">{fastest} ms</p>
          </div>
          <div>
            <p className="text-white/50">Slowest</p>
            <p className="font-bold text-lg">{slowest} ms</p>
          </div>
        </div>

        {bestScore !== undefined && (
          <p className="text-white/50 text-sm mb-6">
            Personal best: {bestScore} ms
          </p>
        )}

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={handleTryAgain}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold min-h-[44px] transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </GameCard>
  )
}
