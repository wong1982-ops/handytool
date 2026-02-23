'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'showing' | 'input' | 'result' | 'gameover'

const GAME_BG = '#0d9488'

function getGridSize(level: number): number {
  return Math.min(3 + Math.floor(level / 3), 6)
}

function getHighlightedCount(level: number): number {
  return 3 + Math.floor(level / 2)
}

function getShowDuration(gridSize: number): number {
  // Scale show duration with grid size: 1s for 3x3, up to 2s for 6x6
  return 1000 + (gridSize - 3) * 333
}

function generateHighlighted(total: number, count: number): Set<number> {
  const indices = new Set<number>()
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * total))
  }
  return indices
}

function heartsString(lives: number): string {
  return '♥'.repeat(lives) + '♡'.repeat(Math.max(0, 3 - lives))
}

export function VisualMemory({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const startLevel = useCallback((lvl: number, currentLives: number) => {
    clearAllTimeouts()
    const gridSize = getGridSize(lvl)
    const total = gridSize * gridSize
    const count = Math.min(getHighlightedCount(lvl), total - 1)
    const newHighlighted = generateHighlighted(total, count)

    setLevel(lvl)
    setLives(currentLives)
    setHighlighted(newHighlighted)
    setSelected(new Set())
    setPhase('showing')

    addTimeout(() => {
      setPhase('input')
    }, getShowDuration(gridSize))
  }, [clearAllTimeouts, addTimeout])

  const startGame = useCallback(() => {
    startLevel(1, 3)
  }, [startLevel])

  const handleSquareClick = useCallback((index: number) => {
    if (phase !== 'input') return

    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [phase])

  // Auto-submit when user has selected the correct number of squares
  useEffect(() => {
    if (phase !== 'input') return
    if (selected.size !== highlighted.size) return

    // Submit automatically
    const wrong = [...selected].filter(i => !highlighted.has(i))
    const missed = [...highlighted].filter(i => !selected.has(i))
    const hasErrors = wrong.length > 0 || missed.length > 0

    setPhase('result')

    if (hasErrors) {
      const newLives = lives - 1
      if (newLives <= 0) {
        addTimeout(() => {
          setPhase('gameover')
          onComplete(level)
        }, 1200)
      } else {
        addTimeout(() => {
          startLevel(level, newLives)
        }, 1200)
      }
    } else {
      addTimeout(() => {
        startLevel(level + 1, lives)
      }, 1000)
    }
  }, [selected, highlighted, phase, lives, level, onComplete, addTimeout, startLevel])

  const gridSize = getGridSize(level)
  const totalSquares = gridSize * gridSize

  const getSquareStyle = (index: number): string => {
    const base = 'w-14 h-14 md:w-16 md:h-16 rounded-lg cursor-pointer transition-colors'

    if (phase === 'result') {
      const isHighlighted = highlighted.has(index)
      const isSelected = selected.has(index)
      if (isSelected && isHighlighted) return `${base} bg-green-400`
      if (isSelected && !isHighlighted) return `${base} bg-red-400`
      if (!isSelected && isHighlighted) return `${base} bg-yellow-400`
      return `${base} bg-white/20`
    }

    if (phase === 'showing' && highlighted.has(index)) {
      return `${base} bg-white`
    }

    if (phase === 'input' && selected.has(index)) {
      return `${base} bg-white`
    }

    return `${base} bg-white/20`
  }

  // Intro phase
  if (phase === 'intro') {
    return (
      <GameCard bgColor={GAME_BG}>
        <button
          type="button"
          onClick={startGame}
          className="text-center text-white w-full h-full flex flex-col items-center justify-center min-h-[44px] cursor-pointer bg-transparent border-0 p-8"
          aria-label="Start Visual Memory test"
        >
          <p className="text-4xl md:text-5xl font-bold mb-4">Visual Memory</p>
          <p className="text-lg text-white/70 mb-2">Remember the pattern and click the squares that lit up</p>
          {bestScore !== undefined && bestScore > 0 && (
            <p className="text-sm text-white/50 mb-4">Best: Level {bestScore}</p>
          )}
          <p className="text-white/60 text-sm mt-4">Click to start</p>
        </button>
      </GameCard>
    )
  }

  // Game over phase
  if (phase === 'gameover') {
    return (
      <GameCard bgColor={GAME_BG}>
        <div className="text-center text-white p-8">
          <p className="text-xl text-white/70 mb-2">Visual Memory</p>
          <p className="text-5xl md:text-6xl font-bold mb-2">Level {level}</p>
          <p className="text-white/60 mb-8">
            {bestScore !== undefined && level > bestScore
              ? 'New personal best!'
              : 'Keep practicing to improve'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                clearAllTimeouts()
                setPhase('intro')
              }}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] text-white transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-3 bg-white text-teal-700 rounded-xl font-semibold min-h-[44px] hover:bg-white/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </GameCard>
    )
  }

  // Showing / Input / Result phases - all show the grid
  const badge = `Level ${level} ${heartsString(lives)}`

  return (
    <GameCard bgColor={GAME_BG} badge={badge}>
      <div className="flex flex-col items-center gap-4 p-4">
        {phase === 'showing' && (
          <p className="text-white/70 text-sm font-medium">Memorize the pattern</p>
        )}
        {phase === 'input' && (
          <p className="text-white/70 text-sm font-medium">
            Select the squares that lit up ({selected.size}/{highlighted.size})
          </p>
        )}
        {phase === 'result' && (
          <p className="text-white/70 text-sm font-medium">
            {[...selected].every(i => highlighted.has(i)) && [...highlighted].every(i => selected.has(i))
              ? <span className="text-green-300 font-bold">Correct!</span>
              : <span className="text-red-300 font-bold">Wrong — {lives > 1 ? `${lives - 1} ${lives - 1 === 1 ? 'life' : 'lives'} left` : 'No lives left'}</span>
            }
          </p>
        )}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
          role="grid"
          aria-label={`${gridSize} by ${gridSize} memory grid`}
        >
          {Array.from({ length: totalSquares }, (_, i) => (
            <button
              key={`${level}-${i}`}
              type="button"
              className={getSquareStyle(i)}
              onClick={() => handleSquareClick(i)}
              disabled={phase !== 'input'}
              aria-label={`Square ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </GameCard>
  )
}
