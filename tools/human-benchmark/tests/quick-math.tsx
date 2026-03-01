'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import {
  generateEquation,
  generateDistractors,
  getTimeForLevel as getMathTime,
} from '../data/equations'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function QuickMath({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [equation, setEquation] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [options, setOptions] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100)

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
      }, 800)
    } else {
      feedbackTimeoutRef.current = setTimeout(() => {
        startRound(lvl, newLives)
      }, 800)
    }
  }, [stopTimer, onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives?: number) => {
    const eq = generateEquation(lvl)
    const distractors = generateDistractors(eq.answer)
    setEquation(eq.display)
    setCorrectAnswer(eq.answer)
    setOptions(shuffleArray([eq.answer, ...distractors]))
    setSelectedAnswer(null)
    setWasCorrect(false)
    setTimeLeft(100)
    setPhase('playing')

    const timeLimit = getMathTime(lvl)
    timerStartRef.current = performance.now()

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - timerStartRef.current
      const remaining = Math.max(0, 100 - (elapsed / timeLimit) * 100)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        handleWrongAnswer(lvl, currentLives ?? 3)
      }
    }, 50)
  }, [handleWrongAnswer])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleAnswer = useCallback((answer: number) => {
    if (phase !== 'playing') return
    stopTimer()

    const isCorrect = answer === correctAnswer
    setSelectedAnswer(answer)
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
  }, [phase, correctAnswer, level, lives, stopTimer, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#6366f1'
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

  const getButtonStyle = (answer: number) => {
    if (phase !== 'feedback') {
      return 'bg-white/20 hover:bg-white/30 text-white'
    }
    if (answer === correctAnswer) {
      return 'bg-green-500 ring-2 ring-white text-white'
    }
    if (answer === selectedAnswer) {
      return 'bg-red-500 text-white'
    }
    return 'bg-white/10 text-white/50'
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
            aria-label="Start Quick Math test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🔢</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Quick Math</p>
            <p className="text-white/70 text-lg mb-2">Solve equations as fast as you can</p>
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

            <p className="text-4xl md:text-5xl font-black mb-8">
              {equation} = ?
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`rounded-xl text-xl font-bold min-h-[56px] transition-colors ${getButtonStyle(opt)}`}
                >
                  {opt}
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
              {wasCorrect ? 'Correct!' : `${equation} = ${correctAnswer}`}
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
