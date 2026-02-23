'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'waiting' | 'ready' | 'too-early' | 'result' | 'complete'

const MAX_ATTEMPTS = 5

export function ReactionTime({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [attempt, setAttempt] = useState(1)
  const [results, setResults] = useState<number[]>([])
  const [currentResult, setCurrentResult] = useState(0)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const readyTimestampRef = useRef(0)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startWaiting = useCallback(() => {
    setPhase('waiting')
    const delay = 1000 + Math.random() * 4000 // 1-5 seconds
    timeoutRef.current = setTimeout(() => {
      readyTimestampRef.current = performance.now()
      setPhase('ready')
    }, delay)
  }, [])

  const handleClick = useCallback(() => {
    switch (phase) {
      case 'intro':
        startWaiting()
        break

      case 'waiting':
        // Clicked too early
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setPhase('too-early')
        break

      case 'ready': {
        const reactionTime = Math.round(performance.now() - readyTimestampRef.current)
        setCurrentResult(reactionTime)
        const newResults = [...results, reactionTime]
        setResults(newResults)

        if (newResults.length >= MAX_ATTEMPTS) {
          const average = Math.round(newResults.reduce((a, b) => a + b, 0) / newResults.length)
          setCurrentResult(average)
          setPhase('complete')
          onComplete(average)
        } else {
          setPhase('result')
        }
        break
      }

      case 'too-early':
        startWaiting()
        break

      case 'result':
        setAttempt(prev => prev + 1)
        startWaiting()
        break

      case 'complete':
        // Handled by the "Try Again" button, not the card click
        break
    }
  }, [phase, results, startWaiting, onComplete])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
    setAttempt(1)
    setResults([])
    setCurrentResult(0)
  }, [])

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'waiting':
      case 'too-early':
        return '#dc2626'
      case 'ready':
        return '#16a34a'
      case 'result':
      case 'complete':
        return '#2563eb'
    }
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'complete') return undefined
    return `ATTEMPT ${attempt}/${MAX_ATTEMPTS}`
  }

  return (
    <GameCard bgColor={getBgColor()} badge={getBadge()}>
      <div
        className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center cursor-pointer select-none"
        onClick={phase !== 'complete' ? handleClick : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (phase !== 'complete') handleClick()
          }
        }}
      >
        {phase === 'intro' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">⚡</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Test Your Reaction Time</p>
            <p className="text-white/70 text-lg">Click anywhere to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: {bestScore}ms</p>
            )}
          </div>
        )}

        {phase === 'waiting' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🔴</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Wait for green...</p>
            <p className="text-white/70">Clicking too early results in a penalty</p>
          </div>
        )}

        {phase === 'ready' && (
          <div className="text-center text-white px-6">
            <p className="text-5xl md:text-7xl font-black mb-3">CLICK!</p>
          </div>
        )}

        {phase === 'too-early' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🚫</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Too Soon!</p>
            <p className="text-white/70">Click to try again</p>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">⏱️</div>
            <p className="text-5xl md:text-6xl font-black mb-2">{currentResult}<span className="text-2xl font-bold">ms</span></p>
            <p className="text-white/70 text-lg mt-4">Click to continue</p>
            {results.length > 1 && (
              <p className="text-white/50 text-sm mt-2">
                Average so far: {Math.round(results.reduce((a, b) => a + b, 0) / results.length)}ms
              </p>
            )}
          </div>
        )}

        {phase === 'complete' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">Average Reaction Time</p>
            <p className="text-5xl md:text-6xl font-black mb-2">{currentResult}<span className="text-2xl font-bold">ms</span></p>
            <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
              {results.map((r, i) => (
                <span key={i} className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                  {r}ms
                </span>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleTryAgain()
              }}
              className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </GameCard>
  )
}
