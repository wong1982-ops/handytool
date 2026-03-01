'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

const ROUND_DURATION = 10000 // 10 seconds
const TARGET_RADIUS = 18

function getSpeedForLevel(level: number): number {
  return Math.min(1.5 + level * 0.5, 8)
}

export function TrackingTest({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [targetX, setTargetX] = useState(50)
  const [targetY, setTargetY] = useState(50)
  const [isOnTarget, setIsOnTarget] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100)

  const areaRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Movement state stored in refs for animation loop
  const posRef = useRef({ x: 50, y: 50 })
  const velRef = useRef({ x: 1, y: 0.8 })
  const mouseRef = useRef({ x: -1, y: -1 })
  const framesOnRef = useRef(0)
  const totalFramesRef = useRef(0)
  const startTimeRef = useRef(0)

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])

  const endRound = useCallback((lvl: number, currentLives: number) => {
    cancelAnimationFrame(animFrameRef.current)
    const total = totalFramesRef.current
    const on = framesOnRef.current
    const acc = total > 0 ? Math.round((on / total) * 100) : 0
    setAccuracy(acc)

    const passed = acc >= 50
    setWasCorrect(passed)
    setPhase('feedback')

    if (passed) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = lvl + 1
        setLevel(nextLevel)
        startRound(nextLevel, currentLives)
      }, 1000)
    } else {
      const newLives = currentLives - 1
      setLives(newLives)

      if (newLives <= 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setPhase('gameover')
          onComplete(lvl)
        }, 1000)
      } else {
        feedbackTimeoutRef.current = setTimeout(() => {
          startRound(lvl, newLives)
        }, 1000)
      }
    }
  }, [onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives: number) => {
    cancelAnimationFrame(animFrameRef.current)

    const speed = getSpeedForLevel(lvl)
    const angle = Math.random() * Math.PI * 2
    posRef.current = { x: 50, y: 50 }
    velRef.current = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }
    mouseRef.current = { x: -1, y: -1 }
    framesOnRef.current = 0
    totalFramesRef.current = 0
    startTimeRef.current = performance.now()

    setTargetX(50)
    setTargetY(50)
    setIsOnTarget(false)
    setTimeLeft(100)
    setPhase('playing')

    // Direction change interval gets shorter with level
    const dirChangeInterval = Math.max(400, 2000 - lvl * 150)
    let lastDirChange = performance.now()

    const loop = () => {
      const now = performance.now()
      const elapsed = now - startTimeRef.current

      if (elapsed >= ROUND_DURATION) {
        endRound(lvl, currentLives)
        return
      }

      setTimeLeft(Math.max(0, 100 - (elapsed / ROUND_DURATION) * 100))

      // Random direction changes
      if (now - lastDirChange > dirChangeInterval) {
        const newAngle = Math.random() * Math.PI * 2
        velRef.current = {
          x: Math.cos(newAngle) * speed,
          y: Math.sin(newAngle) * speed,
        }
        lastDirChange = now
      }

      // Move target
      let { x, y } = posRef.current
      const { x: vx, y: vy } = velRef.current

      x += vx
      y += vy

      // Bounce off walls (5% margin)
      if (x < 5 || x > 95) {
        velRef.current.x *= -1
        x = Math.max(5, Math.min(95, x))
      }
      if (y < 5 || y > 95) {
        velRef.current.y *= -1
        y = Math.max(5, Math.min(95, y))
      }

      posRef.current = { x, y }
      setTargetX(x)
      setTargetY(y)

      // Check if cursor is on target
      totalFramesRef.current++
      if (areaRef.current && mouseRef.current.x >= 0) {
        const rect = areaRef.current.getBoundingClientRect()
        const targetPxX = (x / 100) * rect.width
        const targetPxY = (y / 100) * rect.height
        const dx = mouseRef.current.x - targetPxX
        const dy = mouseRef.current.y - targetPxY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const onTarget = dist <= TARGET_RADIUS + 5
        if (onTarget) framesOnRef.current++
        setIsOnTarget(onTarget)
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
  }, [endRound])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!areaRef.current || e.touches.length === 0) return
    const rect = areaRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleTryAgain = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#ef4444'
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

  return (
    <GameCard bgColor={getBgColor()} badge={getBadge()}>
      <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center select-none">
        {phase === 'intro' && (
          <div
            className="text-center text-white px-6 cursor-pointer"
            onClick={handleStart}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleStart()
              }
            }}
            aria-label="Start Tracking test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎯</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Tracking</p>
            <p className="text-white/70 text-lg mb-2">Keep your cursor on the moving target</p>
            <p className="text-white/50 text-sm mb-4">Need 50%+ time on target to advance</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="w-full h-full flex flex-col px-4 py-4">
            {/* Timer bar */}
            <div className="w-full h-2 bg-white/20 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${timeLeft}%` }}
              />
            </div>

            {/* Tracking area */}
            <div
              ref={areaRef}
              className="flex-1 relative bg-white/10 rounded-xl overflow-hidden cursor-none"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              aria-label="Tracking area — follow the target with your cursor"
            >
              {/* Target */}
              <div
                className={`absolute rounded-full transition-colors duration-100 ${
                  isOnTarget ? 'bg-green-400' : 'bg-white'
                }`}
                style={{
                  width: TARGET_RADIUS * 2,
                  height: TARGET_RADIUS * 2,
                  left: `${targetX}%`,
                  top: `${targetY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[2px] h-full bg-black/30" />
                  <div className="absolute w-full h-[2px] bg-black/30" />
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-4" aria-hidden="true">
              {wasCorrect ? '✅' : '❌'}
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              {wasCorrect ? 'On target!' : 'Too slow!'}
            </p>
            <p className="text-white/70 text-lg">Accuracy: {accuracy}%</p>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">You reached</p>
            <p className="text-5xl md:text-6xl font-black mb-2">Level {level}</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/60 text-sm mb-6">Your best: Level {bestScore}</p>
            )}
            <button
              onClick={handleTryAgain}
              className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </GameCard>
  )
}
