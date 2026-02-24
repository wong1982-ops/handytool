'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'showing' | 'input' | 'success' | 'gameover'

const FLASH_DURATION = 600
const SUCCESS_DELAY = 800
const FEEDBACK_DURATION = 300

function getGridSize(level: number): number {
  if (level >= 11) return 5
  if (level >= 7) return 4
  return 3
}

export function SequenceMemory({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [sequence, setSequence] = useState<number[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [inputPosition, setInputPosition] = useState(0)
  const [feedbackIndex, setFeedbackIndex] = useState<number | null>(null)
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      clearAllTimeouts()
    }
  }, [clearAllTimeouts])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  const startGame = useCallback(() => {
    clearAllTimeouts()
    const gridSize = getGridSize(1)
    const totalSquares = gridSize * gridSize
    const firstIndex = Math.floor(Math.random() * totalSquares)
    setSequence([firstIndex])
    setLevel(1)
    setInputPosition(0)
    setActiveIndex(null)
    setFeedbackIndex(null)
    setFeedbackType(null)
    setPhase('showing')
  }, [clearAllTimeouts])

  const showSequence = useCallback((seq: number[]) => {
    clearAllTimeouts()
    setActiveIndex(null)

    // Small delay before starting the sequence display
    addTimeout(() => {
      seq.forEach((squareIndex, i) => {
        // Turn on the highlight
        addTimeout(() => {
          setActiveIndex(squareIndex)
        }, i * FLASH_DURATION)

        // Turn off the highlight (leave a gap before next)
        addTimeout(() => {
          setActiveIndex(null)
        }, i * FLASH_DURATION + FLASH_DURATION * 0.7)
      })

      // After entire sequence shown, switch to input phase
      addTimeout(() => {
        setActiveIndex(null)
        setPhase('input')
        setInputPosition(0)
      }, seq.length * FLASH_DURATION)
    }, 500)
  }, [clearAllTimeouts, addTimeout])

  // Show the sequence whenever we enter showing phase
  useEffect(() => {
    if (phase === 'showing' && sequence.length > 0) {
      showSequence(sequence)
    }
  }, [phase, sequence, showSequence])

  const advanceLevel = useCallback(() => {
    const nextLevel = level + 1
    const gridSize = getGridSize(nextLevel)
    const totalSquares = gridSize * gridSize
    const newIndex = Math.floor(Math.random() * totalSquares)

    // If grid size changed, remap existing sequence indices to fit new grid
    const prevGridSize = getGridSize(level)
    let newSequence: number[]
    if (gridSize !== prevGridSize) {
      // Remap: old indices within old grid → keep only valid ones, re-randomize if needed
      newSequence = sequence.map(() => Math.floor(Math.random() * totalSquares))
      newSequence.push(newIndex)
    } else {
      newSequence = [...sequence, newIndex]
    }

    setSequence(newSequence)
    setLevel(nextLevel)
    setInputPosition(0)
    setFeedbackIndex(null)
    setFeedbackType(null)
    setPhase('showing')
  }, [level, sequence])

  const handleSquareClick = useCallback((index: number) => {
    if (phase !== 'input') return

    const expected = sequence[inputPosition]

    if (index === expected) {
      // Correct
      setFeedbackIndex(index)
      setFeedbackType('correct')
      addTimeout(() => {
        setFeedbackIndex(null)
        setFeedbackType(null)
      }, FEEDBACK_DURATION)

      const nextPosition = inputPosition + 1
      if (nextPosition >= sequence.length) {
        // Completed the sequence - show success then advance
        setPhase('success')
        addTimeout(() => {
          advanceLevel()
        }, SUCCESS_DELAY)
      } else {
        setInputPosition(nextPosition)
      }
    } else {
      // Wrong
      setFeedbackIndex(index)
      setFeedbackType('wrong')
      setPhase('gameover')
      onComplete(level)
    }
  }, [phase, sequence, inputPosition, level, onComplete, addTimeout, advanceLevel])

  const gridSize = getGridSize(level)
  const totalSquares = gridSize * gridSize

  const getSquareStyle = (index: number): string => {
    const base = 'w-16 h-16 md:w-20 md:h-20 rounded-lg cursor-pointer disabled:cursor-default transition-colors'

    if (feedbackIndex === index && feedbackType === 'correct') {
      return `${base} bg-green-400`
    }
    if (feedbackIndex === index && feedbackType === 'wrong') {
      return `${base} bg-red-400`
    }
    if (activeIndex === index) {
      return `${base} bg-white`
    }
    return `${base} bg-white/20`
  }

  // Intro phase
  if (phase === 'intro') {
    return (
      <GameCard bgColor="#7c3aed">
        <button
          type="button"
          onClick={startGame}
          className="text-center text-white w-full h-full flex flex-col items-center justify-center min-h-[44px] cursor-pointer bg-transparent border-0 p-8"
          aria-label="Start Sequence Memory test"
        >
          <p className="text-4xl md:text-5xl font-bold mb-4">Sequence Memory</p>
          <p className="text-lg text-white/70 mb-2">Watch the pattern and repeat it</p>
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
      <GameCard bgColor="#7c3aed">
        <div className="text-center text-white p-8">
          <p className="text-xl text-white/70 mb-2">Sequence Memory</p>
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
              className="px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold min-h-[44px] hover:bg-white/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </GameCard>
    )
  }

  // Showing / Input / Success phases - all show the grid
  return (
    <GameCard bgColor="#7c3aed" badge={`Level ${level}`}>
      <div className="flex flex-col items-center gap-4 p-4">
        {phase === 'showing' && (
          <p className="text-white/70 text-sm font-medium">Watch the sequence</p>
        )}
        {phase === 'input' && (
          <p className="text-white/70 text-sm font-medium">Your turn — repeat the pattern</p>
        )}
        {phase === 'success' && (
          <p className="text-green-300 text-sm font-bold">Correct!</p>
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
              key={i}
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
