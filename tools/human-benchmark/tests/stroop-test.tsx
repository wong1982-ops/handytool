'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { getColorsForLevel, type StroopColor } from '../data/colors'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

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

function getTimeForLevel(level: number): number {
  if (level <= 3) return 3000
  if (level <= 6) return 2000
  return 1500
}

function generateRound(level: number): {
  word: string
  inkColor: StroopColor
  options: StroopColor[]
} {
  const colors = getColorsForLevel(level)
  const inkColor = pickRandom(colors)
  // Word is always a different color name (creates the Stroop conflict)
  const otherColors = colors.filter((c) => c.name !== inkColor.name)
  const wordColor = pickRandom(otherColors)

  return {
    word: wordColor.name.toUpperCase(),
    inkColor,
    options: shuffleArray(colors).slice(0, 4),
  }
}

export function StroopTest({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [word, setWord] = useState('')
  const [inkColor, setInkColor] = useState<StroopColor | null>(null)
  const [options, setOptions] = useState<StroopColor[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100) // percentage

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartRef = useRef(0)
  const timeLimitRef = useRef(3000)

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

  const handleWrong = useCallback((lvl: number, livesLeft: number) => {
    stopTimer()
    setWasCorrect(false)
    setPhase('feedback')
    const newLives = livesLeft - 1
    setLives(newLives)

    if (newLives <= 0) {
      feedbackTimeoutRef.current = setTimeout(() => {
        setPhase('gameover')
        onComplete(lvl)
      }, 800)
    } else {
      feedbackTimeoutRef.current = setTimeout(() => {
        startRound(lvl, newLives)
      }, 800)
    }
  }, [stopTimer, onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives?: number) => {
    const round = generateRound(lvl)
    setWord(round.word)
    setInkColor(round.inkColor)
    setOptions(round.options)
    setSelectedName(null)
    setWasCorrect(false)
    setTimeLeft(100)
    setPhase('playing')

    const timeLimit = getTimeForLevel(lvl)
    timeLimitRef.current = timeLimit
    timerStartRef.current = performance.now()

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - timerStartRef.current
      const remaining = Math.max(0, 100 - (elapsed / timeLimit) * 100)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        handleWrong(lvl, currentLives ?? 3)
      }
    }, 50)
  }, [handleWrong])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleAnswer = useCallback((color: StroopColor) => {
    if (phase !== 'playing' || !inkColor) return
    stopTimer()

    const isCorrect = color.name === inkColor.name
    setSelectedName(color.name)
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel, lives)
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
          startRound(level, newLives)
        }, 800)
      }
    }
  }, [phase, inkColor, level, lives, stopTimer, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#f97316'
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

  const getButtonStyle = (color: StroopColor) => {
    if (phase !== 'feedback') {
      return 'hover:ring-2 hover:ring-white/50'
    }
    if (color.name === inkColor?.name) {
      return 'ring-2 ring-white scale-105'
    }
    if (color.name === selectedName) {
      return 'ring-2 ring-red-400 opacity-50'
    }
    return 'opacity-30'
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
            aria-label="Start Stroop test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">👁️</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Stroop</p>
            <p className="text-white/70 text-lg mb-2">Name the INK COLOR, not the word!</p>
            <p className="text-white/50 text-sm mb-4">The word says one color but is written in another</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && inkColor && (
          <div className="text-center text-white px-6 w-full">
            {/* Timer bar */}
            <div className="w-full max-w-[320px] mx-auto h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${timeLeft}%` }}
              />
            </div>

            <p className="text-white/60 text-sm mb-4">What COLOR is the text?</p>

            {/* The Stroop word */}
            <p
              className="text-5xl md:text-6xl font-black mb-8"
              style={{ color: inkColor.hex }}
            >
              {word}
            </p>

            {/* Color buttons */}
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleAnswer(color)}
                  className={`rounded-xl min-h-[56px] font-bold text-lg text-white transition-all ${getButtonStyle(color)}`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name}`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-4" aria-hidden="true">
              {wasCorrect ? '✅' : '❌'}
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-4">
              {wasCorrect ? 'Correct!' : `It was ${inkColor?.name}`}
            </p>
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
