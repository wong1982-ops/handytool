'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'result'

const GRID_SIZE = 5
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE

/** Fisher-Yates shuffle */
function shuffleArray(arr: number[]): number[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateGrid(): number[] {
  const numbers = Array.from({ length: TOTAL_CELLS }, (_, i) => i + 1)
  return shuffleArray(numbers)
}

interface CellState {
  value: number
  found: boolean
  flashRed: boolean
}

export function SchulteGrid({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [grid, setGrid] = useState<CellState[]>([])
  const [nextTarget, setNextTarget] = useState(1)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [finalScore, setFinalScore] = useState(0)

  const startTimeRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)
  const flashTimeoutRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
      flashTimeoutRefs.current.forEach((t) => clearTimeout(t))
      flashTimeoutRefs.current.clear()
    }
  }, [])

  const updateTimer = useCallback(() => {
    setElapsedMs(performance.now() - startTimeRef.current)
    animFrameRef.current = requestAnimationFrame(updateTimer)
  }, [])

  const startGame = useCallback(() => {
    setGrid(generateGrid().map((value) => ({ value, found: false, flashRed: false })))
    setNextTarget(1)
    setElapsedMs(0)
    startTimeRef.current = performance.now()
    setPhase('playing')
    animFrameRef.current = requestAnimationFrame(updateTimer)
  }, [updateTimer])

  const handleCellClick = useCallback(
    (index: number) => {
      if (phase !== 'playing') return

      const cell = grid[index]
      if (cell.found) return

      if (cell.value === nextTarget) {
        // Correct
        const newGrid = [...grid]
        newGrid[index] = { ...cell, found: true }
        setGrid(newGrid)

        const newTarget = nextTarget + 1
        if (newTarget > TOTAL_CELLS) {
          // All found — stop timer and complete
          if (animFrameRef.current !== null) {
            cancelAnimationFrame(animFrameRef.current)
            animFrameRef.current = null
          }
          const score = Math.round(performance.now() - startTimeRef.current)
          setFinalScore(score)
          setElapsedMs(performance.now() - startTimeRef.current)
          setPhase('result')
          onComplete(score)
        } else {
          setNextTarget(newTarget)
        }
      } else {
        // Wrong — flash red for 200ms
        const newGrid = [...grid]
        newGrid[index] = { ...cell, flashRed: true }
        setGrid(newGrid)

        // Clear any existing flash timeout for this cell
        const existing = flashTimeoutRefs.current.get(index)
        if (existing) clearTimeout(existing)

        const timeout = setTimeout(() => {
          setGrid((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], flashRed: false }
            return updated
          })
          flashTimeoutRefs.current.delete(index)
        }, 200)

        flashTimeoutRefs.current.set(index, timeout)
      }
    },
    [phase, grid, nextTarget, onComplete],
  )

  const handleTryAgain = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    flashTimeoutRefs.current.forEach((t) => clearTimeout(t))
    flashTimeoutRefs.current.clear()
    setPhase('intro')
    setGrid([])
    setNextTarget(1)
    setElapsedMs(0)
    setFinalScore(0)
  }, [])

  const formatTime = (ms: number): string => {
    return (ms / 1000).toFixed(2)
  }

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#f43f5e'
      case 'result':
        return '#2563eb'
    }
  }

  const getBadge = () => {
    if (phase === 'playing') {
      return `${nextTarget - 1}/${TOTAL_CELLS}`
    }
    return undefined
  }

  return (
    <GameCard bgColor={getBgColor()} badge={getBadge()}>
      <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center select-none">
        {phase === 'intro' && (
          <div
            className="text-center text-white px-6 cursor-pointer"
            onClick={startGame}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                startGame()
              }
            }}
            aria-label="Start Schulte Grid test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">
              #️⃣
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Schulte Grid</p>
            <p className="text-white/70 text-lg">Find numbers 1 to 25 in order</p>
            <p className="text-white/70 text-lg mt-1">Click anywhere to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">
                Your best: {formatTime(bestScore)}s
              </p>
            )}
          </div>
        )}

        {phase === 'playing' && (
          <div className="flex flex-col items-center gap-3 px-4 py-4 w-full max-w-[340px]">
            {/* Target indicator and timer */}
            <div className="flex items-center justify-between w-full text-white mb-1">
              <p className="text-lg font-semibold">
                Find: <span className="font-black text-xl">{nextTarget}</span>
              </p>
              <p className="text-lg font-mono font-semibold tabular-nums">
                {formatTime(elapsedMs)}s
              </p>
            </div>

            {/* 5x5 Grid */}
            <div
              className="grid grid-cols-5 gap-1.5 w-full"
              role="grid"
              aria-label="Schulte Grid - find numbers in ascending order"
            >
              {grid.map((cell, index) => {
                const isFound = cell.found
                const isFlashRed = cell.flashRed

                let bgClass = 'bg-white/90 hover:bg-white text-gray-900'
                if (isFound) {
                  bgClass = 'bg-green-500/40 text-white/70'
                } else if (isFlashRed) {
                  bgClass = 'bg-red-500 text-white'
                }

                return (
                  <button
                    key={index}
                    className={`aspect-square min-h-[44px] min-w-[44px] rounded-lg font-bold text-lg md:text-xl flex items-center justify-center transition-colors duration-100 ${bgClass}`}
                    onClick={() => handleCellClick(index)}
                    disabled={isFound}
                    aria-label={isFound ? `${cell.value} found` : `Number ${cell.value}`}
                    role="gridcell"
                  >
                    {isFound ? (
                      <span className="text-white/80" aria-hidden="true">
                        ✓
                      </span>
                    ) : (
                      cell.value
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">
              🏆
            </div>
            <p className="text-lg text-white/70 mb-2">Completion Time</p>
            <p className="text-5xl md:text-6xl font-black mb-2">
              {formatTime(finalScore)}
              <span className="text-2xl font-bold">s</span>
            </p>
            <p className="text-white/50 text-sm mt-2">
              {finalScore}ms total
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleTryAgain()
              }}
              className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
              aria-label="Try again"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </GameCard>
  )
}
