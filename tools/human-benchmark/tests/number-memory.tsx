'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'showing' | 'input' | 'correct' | 'wrong'

function generateNumber(level: number): string {
  if (level === 1) {
    return String(Math.floor(Math.random() * 10))
  }
  const min = Math.pow(10, level - 1)
  const max = Math.pow(10, level) - 1
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

export function NumberMemory({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [currentNumber, setCurrentNumber] = useState('')
  const [userInput, setUserInput] = useState('')
  const [progress, setProgress] = useState(100)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const durationRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startShowing = useCallback((lvl: number) => {
    const number = generateNumber(lvl)
    setCurrentNumber(number)
    setUserInput('')
    setPhase('showing')
    setProgress(100)

    const duration = lvl * 1000
    durationRef.current = duration
    startTimeRef.current = performance.now()

    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current
      const remaining = Math.max(0, 1 - elapsed / durationRef.current)
      setProgress(remaining * 100)

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    timerRef.current = setTimeout(() => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      setProgress(0)
      setPhase('input')
    }, duration)
  }, [])

  // Auto-focus input when entering input phase
  useEffect(() => {
    if (phase === 'input') {
      // Small delay to ensure DOM is ready
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Auto-advance after correct answer
  useEffect(() => {
    if (phase === 'correct') {
      const t = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startShowing(nextLevel)
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [phase, level, startShowing])

  const handleStart = useCallback(() => {
    setLevel(1)
    setUserInput('')
    startShowing(1)
  }, [startShowing])

  const handleSubmit = useCallback(() => {
    cleanup()
    if (userInput.trim() === currentNumber) {
      setPhase('correct')
    } else {
      setPhase('wrong')
      onComplete(level - 1)
    }
  }, [userInput, currentNumber, level, onComplete, cleanup])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleTryAgain = useCallback(() => {
    cleanup()
    setPhase('intro')
    setLevel(1)
    setUserInput('')
    setCurrentNumber('')
    setProgress(100)
  }, [cleanup])

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'showing':
      case 'input':
        return '#2563eb'
      case 'correct':
        return '#16a34a'
      case 'wrong':
        return '#dc2626'
    }
  }

  const getBadge = () => {
    if (phase === 'intro') return undefined
    return `LEVEL ${level}`
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
            <div className="text-6xl mb-6" aria-hidden="true">🔢</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Number Memory</p>
            <p className="text-white/70 text-lg mb-2">How many digits can you remember?</p>
            <p className="text-white/50 text-base">Click to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: {bestScore} digits</p>
            )}
          </div>
        </div>
      )}

      {phase === 'showing' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex flex-col items-center justify-center px-6">
          <div className="text-center text-white mb-8">
            <p className="text-4xl md:text-6xl font-mono font-bold tracking-widest" aria-live="polite">
              {currentNumber}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {phase === 'input' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center px-6">
          <div className="text-center text-white w-full max-w-sm">
            <p className="text-xl md:text-2xl font-bold mb-6">What was the number?</p>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={handleKeyDown}
              className="w-full text-center text-2xl md:text-3xl font-mono font-bold bg-white/20 border-2 border-white/40 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/80 transition-colors min-h-[44px]"
              placeholder="Enter number"
              autoComplete="off"
              aria-label="Enter the number you saw"
            />
            <button
              onClick={handleSubmit}
              className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors text-white"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {phase === 'correct' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center px-6">
          <div className="text-center text-white">
            <div className="text-6xl mb-6" aria-hidden="true">✅</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Correct!</p>
            <p className="text-3xl md:text-4xl font-mono font-bold tracking-widest mb-4">{currentNumber}</p>
            <p className="text-white/70">Next level...</p>
          </div>
        </div>
      )}

      {phase === 'wrong' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center px-6">
          <div className="text-center text-white w-full max-w-md">
            <div className="text-6xl mb-6" aria-hidden="true">❌</div>
            <p className="text-2xl md:text-3xl font-bold mb-6">Wrong!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <div className="bg-white/10 rounded-xl px-6 py-4 flex-1">
                <p className="text-white/60 text-sm mb-1">Your answer</p>
                <p className="text-xl md:text-2xl font-mono font-bold text-red-300 break-all">
                  {userInput || '(empty)'}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl px-6 py-4 flex-1">
                <p className="text-white/60 text-sm mb-1">Correct</p>
                <p className="text-xl md:text-2xl font-mono font-bold text-green-300 break-all">
                  {currentNumber}
                </p>
              </div>
            </div>
            <p className="text-white/70 mb-6">
              You reached level {level - 1 > 0 ? level - 1 : 0} ({level - 1 > 0 ? level - 1 : 0} digit{level - 1 !== 1 ? 's' : ''})
            </p>
            <button
              onClick={handleTryAgain}
              className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </GameCard>
  )
}
