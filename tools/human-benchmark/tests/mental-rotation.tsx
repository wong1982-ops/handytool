'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import {
  SHAPES,
  rotatePoints,
  mirrorPoints,
  pointsToSvg,
  type ShapeData,
} from '../data/shapes'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

interface Option {
  points: [number, number][]
  isCorrect: boolean
  id: number
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getAllowedAngles(level: number): number[] {
  if (level <= 3) {
    // 90-degree increments
    return [90, 180, 270]
  }
  if (level <= 6) {
    // 45-degree increments
    return [45, 90, 135, 180, 225, 270, 315]
  }
  // 30-degree increments
  return [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
}

function getShapePool(level: number): ShapeData[] {
  if (level <= 3) {
    return SHAPES.filter((s) => s.difficulty === 1)
  }
  if (level <= 6) {
    return SHAPES.filter((s) => s.difficulty <= 2)
  }
  return SHAPES
}

function generateRound(level: number): {
  referencePoints: [number, number][]
  options: Option[]
} {
  const pool = getShapePool(level)
  const shape = pickRandom(pool)
  const angles = getAllowedAngles(level)

  // Pick a random rotation angle for the correct answer
  const correctAngle = pickRandom(angles)
  const correctPoints = rotatePoints(shape.points, correctAngle)

  // Generate 3 distractors: mirror first, then rotate at different angles
  const mirrored = mirrorPoints(shape.points)
  const distractors: [number, number][][] = []

  // Build pool of distractor angles — allow reuse if not enough unique ones
  const otherAngles = shuffleArray(angles.filter((a) => a !== correctAngle))
  for (let i = 0; i < 3; i++) {
    // Cycle through available angles, reusing if needed (mirrored shapes
    // with same angle still look different from the correct rotated shape)
    const angle = otherAngles[i % otherAngles.length]
    distractors.push(rotatePoints(mirrored, angle))
  }

  const options: Option[] = shuffleArray([
    { points: correctPoints, isCorrect: true, id: 0 },
    { points: distractors[0], isCorrect: false, id: 1 },
    { points: distractors[1], isCorrect: false, id: 2 },
    { points: distractors[2], isCorrect: false, id: 3 },
  ])

  return {
    referencePoints: shape.points,
    options,
  }
}

function ShapeSvg({
  points,
  size,
  fillOpacity = 0.9,
  className = '',
}: {
  points: [number, number][]
  size: string
  fillOpacity?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={size + (className ? ` ${className}` : '')}
      aria-hidden="true"
    >
      <polygon
        points={pointsToSvg(points)}
        fill={`rgba(255,255,255,${fillOpacity})`}
        stroke="white"
        strokeWidth={2}
      />
    </svg>
  )
}

export function MentalRotation({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [referencePoints, setReferencePoints] = useState<[number, number][]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
    }
  }, [])

  const heartsDisplay = useMemo(() => {
    const filled = '\u2665'.repeat(lives)
    const empty = '\u2661'.repeat(3 - lives)
    return filled + empty
  }, [lives])

  const startRound = useCallback((lvl: number) => {
    const round = generateRound(lvl)
    setReferencePoints(round.referencePoints)
    setOptions(round.options)
    setSelectedId(null)
    setWasCorrect(false)
    setPhase('playing')
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1)
  }, [startRound])

  const handleOptionClick = useCallback(
    (option: Option) => {
      if (phase !== 'playing') return

      setSelectedId(option.id)
      setWasCorrect(option.isCorrect)
      setPhase('feedback')

      if (option.isCorrect) {
        // Advance to next level after feedback
        feedbackTimeoutRef.current = setTimeout(() => {
          const nextLevel = level + 1
          setLevel(nextLevel)
          startRound(nextLevel)
        }, 800)
      } else {
        const newLives = lives - 1
        setLives(newLives)

        if (newLives <= 0) {
          feedbackTimeoutRef.current = setTimeout(() => {
            setPhase('gameover')
            onComplete(level)
          }, 800)
        } else {
          feedbackTimeoutRef.current = setTimeout(() => {
            startRound(level)
          }, 800)
        }
      }
    },
    [phase, level, lives, startRound, onComplete]
  )

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#06b6d4'
      case 'feedback':
        return wasCorrect ? '#16a34a' : '#dc2626'
      case 'gameover':
        return '#2563eb'
    }
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
  }

  const getOptionBorder = (option: Option) => {
    if (phase !== 'feedback') {
      return 'border-2 border-white/20 hover:border-white/50'
    }
    if (option.isCorrect) {
      return 'border-2 border-green-400 ring-2 ring-green-400/50'
    }
    if (option.id === selectedId && !option.isCorrect) {
      return 'border-2 border-red-400 ring-2 ring-red-400/50'
    }
    return 'border-2 border-white/20'
  }

  return (
    <GameCard bgColor={getBgColor()} badge={getBadge()}>
      {phase === 'intro' && (
        <div
          className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center cursor-pointer select-none"
          onClick={handleStart}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleStart()
            }
          }}
        >
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">
              🧊
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-3">
              Mental Rotation
            </p>
            <p className="text-white/70 text-lg mb-2 max-w-sm mx-auto">
              Find the rotated shape &mdash; not the mirror!
            </p>
            <p className="text-white/50 text-base">Click anywhere to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">
                Your best: Level {bestScore}
              </p>
            )}
          </div>
        </div>
      )}

      {(phase === 'playing' || phase === 'feedback') && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center px-4 py-6">
          <div className="text-center text-white w-full max-w-sm">
            {/* Reference shape */}
            <div className="bg-white/20 rounded-xl p-4 mb-4 inline-flex items-center justify-center">
              <ShapeSvg
                points={referencePoints}
                size="w-20 h-20 md:w-24 md:h-24"
                fillOpacity={0.9}
              />
            </div>

            <p
              className="text-white/80 text-sm font-medium mb-4"
              aria-live="polite"
            >
              Which one is a rotation?
            </p>

            {/* 2x2 option grid */}
            <div
              className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto"
              role="group"
              aria-label="Shape options"
            >
              {options.map((option, index) => (
                <button
                  key={`${level}-${option.id}-${index}`}
                  onClick={() => handleOptionClick(option)}
                  disabled={phase === 'feedback'}
                  className={`rounded-xl p-3 bg-white/10 min-h-[80px] flex items-center justify-center transition-all ${getOptionBorder(option)} ${
                    phase === 'playing'
                      ? 'cursor-pointer hover:bg-white/15'
                      : 'cursor-default'
                  }`}
                  aria-label={`Option ${index + 1}`}
                >
                  <ShapeSvg
                    points={option.points}
                    size="w-16 h-16 md:w-20 md:h-20"
                    fillOpacity={0.85}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center px-6">
          <div className="text-center text-white w-full max-w-md">
            <div className="text-6xl mb-6" aria-hidden="true">
              🏆
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-3">
              Mental Rotation
            </p>
            <div className="bg-white/10 rounded-xl px-6 py-4 mb-6 inline-block">
              <p className="text-white/60 text-sm mb-1">Level Reached</p>
              <p className="text-4xl md:text-5xl font-bold">{level}</p>
            </div>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/60 text-sm mb-6">
                Your best: Level {bestScore}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleTryAgain}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </GameCard>
  )
}
