'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

const gameBgColor = '#E8567F'

function getGridSize(level: number): number {
  if (level <= 3) return 4
  if (level <= 6) return 5
  if (level <= 9) return 6
  if (level <= 12) return 7
  return 8
}

function getColorDelta(level: number): number {
  if (level <= 3) return 15
  if (level <= 6) return 10
  if (level <= 9) return 6
  if (level <= 12) return 4
  return 2
}

function generateGrid(level: number): {
  gridSize: number
  baseColor: string
  oddColor: string
  oddIndex: number
} {
  const gridSize = getGridSize(level)
  const delta = getColorDelta(level)
  const hue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 21) // 60-80
  const lightness = 45 + Math.floor(Math.random() * 16) // 45-60

  // Randomly shift lighter or darker
  const direction = Math.random() < 0.5 ? 1 : -1
  const oddLightness = Math.max(10, Math.min(90, lightness + delta * direction))

  const baseColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  const oddColor = `hsl(${hue}, ${saturation}%, ${oddLightness}%)`
  const totalTiles = gridSize * gridSize
  const oddIndex = Math.floor(Math.random() * totalTiles)

  return { gridSize, baseColor, oddColor, oddIndex }
}

export function ColorSensitivity({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [gridSize, setGridSize] = useState(4)
  const [baseColor, setBaseColor] = useState('')
  const [oddColor, setOddColor] = useState('')
  const [oddIndex, setOddIndex] = useState(0)
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartRef = useRef(0)

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startRound = useCallback((lvl: number) => {
    const grid = generateGrid(lvl)
    setGridSize(grid.gridSize)
    setBaseColor(grid.baseColor)
    setOddColor(grid.oddColor)
    setOddIndex(grid.oddIndex)
    setClickedIndex(null)
    setWasCorrect(false)
    setElapsed(0)
    setPhase('playing')

    timerStartRef.current = performance.now()
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((performance.now() - timerStartRef.current) / 1000))
    }, 1000)
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1)
  }, [startRound])

  const handleTileClick = useCallback((index: number) => {
    if (phase !== 'playing') return
    stopTimer()

    const isCorrect = index === oddIndex
    setClickedIndex(index)
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel)
      }, 600)
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
  }, [phase, oddIndex, level, lives, stopTimer, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return gameBgColor
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

  const getTileColor = (index: number): string => {
    if (phase === 'feedback') {
      // Highlight the correct odd tile green
      if (index === oddIndex && wasCorrect) return '#16a34a'
      if (index === oddIndex && !wasCorrect) return '#16a34a'
      // Highlight wrong click red
      if (index === clickedIndex && !wasCorrect) return '#dc2626'
    }
    return index === oddIndex ? oddColor : baseColor
  }

  const tileSize = 46
  const gap = 4
  const cellSize = tileSize + gap
  const svgSize = gridSize * cellSize - gap + 4 // +4 for 2px margin each side

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
            aria-label="Start Color Sensitivity test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎨</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Color Sensitivity</p>
            <p className="text-white/70 text-lg mb-2">Spot the tile with a different color!</p>
            <p className="text-white/50 text-sm mb-4">Each level gets harder as colors converge</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && (
          <div className="text-center text-white px-6 w-full">
            {/* Timer display */}
            <p className="text-white/60 text-sm mb-4">{elapsed}s</p>

            {/* SVG Grid */}
            <svg
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="w-full max-w-[320px] mx-auto"
              role="grid"
              aria-label={`${gridSize} by ${gridSize} color grid`}
            >
              {Array.from({ length: gridSize * gridSize }, (_, i) => {
                const row = Math.floor(i / gridSize)
                const col = i % gridSize
                const x = 2 + col * cellSize
                const y = 2 + row * cellSize
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={tileSize}
                    height={tileSize}
                    rx={4}
                    fill={getTileColor(i)}
                    role="gridcell"
                    aria-label={`Tile ${row + 1}-${col + 1}`}
                    onClick={() => handleTileClick(i)}
                    className={phase === 'playing' ? 'cursor-pointer' : ''}
                    style={{ transition: 'fill 0.15s ease' }}
                  />
                )
              })}
            </svg>
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
              className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </GameCard>
  )
}
