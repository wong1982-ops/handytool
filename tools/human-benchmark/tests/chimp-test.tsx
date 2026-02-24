'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'showing' | 'hidden' | 'success' | 'gameover'

const GAME_BG = '#db2777'
const GRID_COLS = 8
const GRID_ROWS = 5
const STARTING_NUMBERS = 4
const MAX_STRIKES = 3
const SUCCESS_DELAY = 1000

interface CellState {
  number: number
  row: number
  col: number
  found: boolean
  wrong: boolean
}

function generateCells(count: number): CellState[] {
  const totalCells = GRID_COLS * GRID_ROWS
  const positions = new Set<number>()

  while (positions.size < count) {
    positions.add(Math.floor(Math.random() * totalCells))
  }

  const cells: CellState[] = []
  let num = 1
  for (const pos of positions) {
    const row = Math.floor(pos / GRID_COLS)
    const col = pos % GRID_COLS
    cells.push({ number: num, row, col, found: false, wrong: false })
    num++
  }

  return cells
}

export function ChimpTest({ onComplete, onBack, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(STARTING_NUMBERS)
  const [strikes, setStrikes] = useState(0)
  const [cells, setCells] = useState<CellState[]>([])
  const [nextExpected, setNextExpected] = useState(1)
  const [highestLevel, setHighestLevel] = useState(STARTING_NUMBERS)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const startLevel = useCallback((lvl: number) => {
    const newCells = generateCells(lvl)
    setCells(newCells)
    setNextExpected(1)
    setPhase('showing')
  }, [])

  const handleStart = useCallback(() => {
    setLevel(STARTING_NUMBERS)
    setStrikes(0)
    setHighestLevel(STARTING_NUMBERS)
    startLevel(STARTING_NUMBERS)
  }, [startLevel])

  const handleCellClick = useCallback((cell: CellState) => {
    if (cell.found) return

    // In showing phase, user must click "1" first
    if (phase === 'showing') {
      if (cell.number === 1) {
        // Mark 1 as found, hide all numbers
        setCells(prev => prev.map(c =>
          c.number === 1 ? { ...c, found: true } : c
        ))
        setNextExpected(2)
        setPhase('hidden')
      } else {
        // Wrong click in showing phase — strike
        setStrikes(prev => {
          const newStrikes = prev + 1
          if (newStrikes >= MAX_STRIKES) {
            setPhase('gameover')
            onComplete(highestLevel)
          }
          return newStrikes
        })
        // Flash the wrong cell red briefly
        setCells(prev => prev.map(c =>
          c.number === cell.number ? { ...c, wrong: true } : c
        ))
        setTimeout(() => {
          setCells(prev => prev.map(c =>
            c.number === cell.number ? { ...c, wrong: false } : c
          ))
        }, 300)
      }
      return
    }

    // In hidden phase
    if (phase === 'hidden') {
      if (cell.number === nextExpected) {
        // Correct click
        const newCells = cells.map(c =>
          c.number === cell.number ? { ...c, found: true } : c
        )
        setCells(newCells)

        const allFound = newCells.every(c => c.found)
        if (allFound) {
          // Level complete
          const nextLevel = level + 1
          setHighestLevel(prev => Math.max(prev, nextLevel))
          setLevel(nextLevel)
          setPhase('success')
          timeoutRef.current = setTimeout(() => {
            startLevel(nextLevel)
          }, SUCCESS_DELAY)
        } else {
          setNextExpected(nextExpected + 1)
        }
      } else {
        // Wrong click — strike
        setStrikes(prev => {
          const newStrikes = prev + 1
          if (newStrikes >= MAX_STRIKES) {
            setPhase('gameover')
            onComplete(level)
          }
          return newStrikes
        })
        // Flash wrong
        setCells(prev => prev.map(c =>
          c.number === cell.number ? { ...c, wrong: true } : c
        ))
        setTimeout(() => {
          setCells(prev => prev.map(c =>
            c.number === cell.number ? { ...c, wrong: false } : c
          ))
        }, 300)
      }
    }
  }, [phase, nextExpected, cells, level, highestLevel, startLevel, onComplete])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
    setLevel(STARTING_NUMBERS)
    setStrikes(0)
    setCells([])
    setHighestLevel(STARTING_NUMBERS)
  }, [])

  // --- Intro phase ---
  if (phase === 'intro') {
    return (
      <GameCard bgColor={GAME_BG}>
        <button
          type="button"
          className="text-center text-white w-full h-full flex flex-col items-center justify-center cursor-pointer bg-transparent border-none outline-none min-h-[300px]"
          onClick={handleStart}
          aria-label="Start chimp test"
        >
          <p className="text-3xl md:text-4xl font-bold mb-3">Chimp Test</p>
          <p className="text-lg text-white/70 mb-2">Are you smarter than a chimpanzee?</p>
          <p className="text-white/60 mb-6 px-4">
            Numbers will appear. Click them in order starting from 1.
          </p>
          <p className="text-white/50 text-sm">Click to start</p>
        </button>
      </GameCard>
    )
  }

  // --- Success phase ---
  if (phase === 'success') {
    return (
      <GameCard bgColor={GAME_BG}>
        <div className="text-center text-white">
          <p className="text-3xl md:text-4xl font-bold mb-3">Level {level - 1} Complete!</p>
          <p className="text-white/60">Next level starting...</p>
        </div>
      </GameCard>
    )
  }

  // --- Game over phase ---
  if (phase === 'gameover') {
    return (
      <GameCard bgColor={GAME_BG}>
        <div className="text-center text-white px-4">
          <p className="text-lg text-white/70 mb-2">Game Over</p>
          <p className="text-5xl md:text-6xl font-bold mb-1">{level}</p>
          <p className="text-xl text-white/70 mb-4">level reached</p>

          <p className="text-white/50 text-sm mb-6">
            Strikes: {strikes}/{MAX_STRIKES}
          </p>

          {bestScore !== undefined && (
            <p className="text-white/50 text-sm mb-6">
              Personal best: Level {bestScore}
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

  // --- Showing / Hidden phases (grid) ---
  const strikesDisplay = Array.from({ length: MAX_STRIKES }, (_, i) =>
    i < strikes ? '✕' : '○'
  ).join(' ')

  return (
    <GameCard bgColor={GAME_BG} badge={`Level ${level}`}>
      <div className="flex flex-col items-center w-full px-2 py-4">
        {/* Strikes indicator */}
        <div className="mb-3 text-white/80 text-sm font-mono tracking-widest" aria-label={`Strikes ${strikes} of ${MAX_STRIKES}`}>
          {strikesDisplay}
        </div>

        {/* Grid */}
        <div
          className="grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          }}
          role="grid"
          aria-label="Chimp test grid"
        >
          {Array.from({ length: GRID_ROWS }, (_, row) =>
            Array.from({ length: GRID_COLS }, (_, col) => {
              const cell = cells.find(c => c.row === row && c.col === col)

              if (!cell) {
                // Empty grid position
                return (
                  <div
                    key={`${row}-${col}`}
                    className="size-9 sm:size-12 md:size-14 rounded-lg"
                    role="gridcell"
                  />
                )
              }

              if (cell.found) {
                // Already clicked correctly — invisible
                return (
                  <div
                    key={`${row}-${col}`}
                    className="size-9 sm:size-12 md:size-14 rounded-lg opacity-0"
                    role="gridcell"
                  />
                )
              }

              // Active cell
              const isShowing = phase === 'showing'
              const isWrong = cell.wrong

              return (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  role="gridcell"
                  className={`size-9 sm:size-12 md:size-14 rounded-lg font-bold text-sm sm:text-lg transition-colors duration-150 cursor-pointer border-none outline-none ${
                    isWrong
                      ? 'bg-red-500 text-white'
                      : isShowing
                        ? 'bg-white text-slate-900 hover:bg-white/90'
                        : 'bg-white/80 hover:bg-white/70 text-transparent'
                  }`}
                  onClick={() => handleCellClick(cell)}
                  aria-label={isShowing ? `Number ${cell.number}` : 'Hidden square'}
                >
                  {isShowing ? cell.number : ''}
                </button>
              )
            })
          )}
        </div>

        {phase === 'showing' && (
          <p className="mt-3 text-white/50 text-xs">Click 1 to begin</p>
        )}
      </div>
    </GameCard>
  )
}
