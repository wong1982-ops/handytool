'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import {
  getWordsForLevel,
  getTimeForLevel as getWordTime,
  scrambleWord,
} from '../data/word-scramble'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function WordScramble({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [scrambled, setScrambled] = useState('')
  const [answer, setAnswer] = useState('')
  const [userInput, setUserInput] = useState('')
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartRef = useRef(0)
  const usedWordsRef = useRef(new Set<string>())

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

  const handleWrongAnswer = useCallback((lvl: number, currentLives: number) => {
    stopTimer()
    setWasCorrect(false)
    setPhase('feedback')
    const newLives = currentLives - 1
    setLives(newLives)

    if (newLives <= 0) {
      feedbackTimeoutRef.current = setTimeout(() => {
        setPhase('gameover')
        onComplete(lvl)
      }, 1200)
    } else {
      feedbackTimeoutRef.current = setTimeout(() => {
        startRound(lvl, newLives)
      }, 1200)
    }
  }, [stopTimer, onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives?: number) => {
    const pool = getWordsForLevel(lvl)
    // Avoid repeating words
    let word: string
    let attempts = 0
    do {
      word = pickRandom(pool)
      attempts++
    } while (usedWordsRef.current.has(word) && attempts < 20)
    usedWordsRef.current.add(word)

    setAnswer(word)
    setScrambled(scrambleWord(word).toUpperCase())
    setUserInput('')
    setWasCorrect(false)
    setTimeLeft(100)
    setPhase('playing')

    const timeLimit = getWordTime(lvl)
    timerStartRef.current = performance.now()

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - timerStartRef.current
      const remaining = Math.max(0, 100 - (elapsed / timeLimit) * 100)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        handleWrongAnswer(lvl, currentLives ?? 3)
      }
    }, 50)

    setTimeout(() => inputRef.current?.focus(), 100)
  }, [handleWrongAnswer])

  const handleStart = useCallback(() => {
    usedWordsRef.current.clear()
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleSubmit = useCallback(() => {
    if (phase !== 'playing') return
    stopTimer()

    const isCorrect = userInput.toLowerCase().trim() === answer.toLowerCase()
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel, lives)
      }, 800)
    } else {
      const newLives = lives - 1
      setLives(newLives)

      if (newLives <= 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setPhase('gameover')
          onComplete(level)
        }, 1200)
      } else {
        feedbackTimeoutRef.current = setTimeout(() => {
          startRound(level, newLives)
        }, 1200)
      }
    }
  }, [phase, userInput, answer, level, lives, stopTimer, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#a855f7'
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
            aria-label="Start Word Scramble test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🔤</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Word Scramble</p>
            <p className="text-white/70 text-lg mb-2">Unscramble the jumbled word</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-6 w-full">
            <div className="w-full max-w-[320px] mx-auto h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${timeLeft}%` }}
              />
            </div>

            <p className="text-4xl md:text-5xl font-black mb-8 tracking-widest">
              {scrambled}
            </p>

            <div className="max-w-[280px] mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                className="w-full bg-white/20 border-2 border-white/30 rounded-xl px-4 py-3 text-center text-xl font-bold text-white placeholder-white/40 focus:outline-none focus:border-white/60"
                placeholder="Type the word..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button
                onClick={handleSubmit}
                className="mt-4 w-full px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-4" aria-hidden="true">
              {wasCorrect ? '✅' : '❌'}
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              {wasCorrect ? 'Correct!' : `It was "${answer}"`}
            </p>
            <p className="text-white/60 text-lg">{scrambled}</p>
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
