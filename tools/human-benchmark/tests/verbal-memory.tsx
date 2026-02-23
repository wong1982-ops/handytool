'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { WORD_LIST } from '../data/words'

type Phase = 'intro' | 'playing' | 'gameover'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomFromSet(set: Set<string>): string {
  const arr = Array.from(set)
  return arr[Math.floor(Math.random() * arr.length)]
}

export function VerbalMemory({ onComplete, onBack, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [isCurrentWordSeen, setIsCurrentWordSeen] = useState(false)
  const [flash, setFlash] = useState(false)

  const seenWordsRef = useRef<Set<string>>(new Set())
  const usedNewWordsRef = useRef<Set<string>>(new Set())

  const heartsDisplay = useMemo(() => {
    return '♥'.repeat(lives)
  }, [lives])

  const pickNextWord = useCallback(() => {
    const seenWords = seenWordsRef.current
    const usedNewWords = usedNewWordsRef.current
    const unseenWords = WORD_LIST.filter((w) => !usedNewWords.has(w))
    const allSeen = unseenWords.length === 0

    // 50% chance to show a seen word (if any exist), otherwise show new
    const showSeen = seenWords.size > 0 && (allSeen || Math.random() < 0.5)

    if (showSeen) {
      const word = pickRandomFromSet(seenWords)
      setCurrentWord(word)
      setIsCurrentWordSeen(true)
    } else {
      const word = pickRandom(unseenWords)
      setCurrentWord(word)
      setIsCurrentWordSeen(false)
      // Mark as used (will be added to seenWords after the player responds)
    }
  }, [])

  const handleStart = useCallback(() => {
    seenWordsRef.current = new Set()
    usedNewWordsRef.current = new Set()
    setLives(3)
    setScore(0)
    setFlash(false)
    setPhase('playing')
    // Pick first word (always new)
    const word = pickRandom(WORD_LIST)
    setCurrentWord(word)
    setIsCurrentWordSeen(false)
  }, [])

  const handleAnswer = useCallback((answer: 'seen' | 'new') => {
    const correct =
      (answer === 'seen' && isCurrentWordSeen) ||
      (answer === 'new' && !isCurrentWordSeen)

    // After answering, mark the current word as seen
    seenWordsRef.current.add(currentWord)
    usedNewWordsRef.current.add(currentWord)

    if (correct) {
      const newScore = score + 1
      setScore(newScore)
      pickNextWord()
    } else {
      const newLives = lives - 1
      setLives(newLives)

      // Brief red flash
      setFlash(true)
      setTimeout(() => setFlash(false), 300)

      if (newLives <= 0) {
        setPhase('gameover')
        onComplete(score)
      } else {
        pickNextWord()
      }
    }
  }, [isCurrentWordSeen, currentWord, score, lives, pickNextWord, onComplete])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const bgColor = flash ? '#dc2626' : '#d97706'
  const badge = phase === 'playing' ? heartsDisplay : undefined

  return (
    <GameCard bgColor={bgColor} badge={badge}>
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
            <div className="text-6xl mb-6" aria-hidden="true">💬</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Verbal Memory</p>
            <p className="text-white/70 text-lg mb-2 max-w-sm mx-auto">
              You will see words one at a time. If you&apos;ve seen a word before, click SEEN. If it&apos;s new, click NEW.
            </p>
            <p className="text-white/50 text-base">Click to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: {bestScore} points</p>
            )}
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center px-6">
          <div className="text-center text-white w-full max-w-sm">
            <p className="text-white/60 text-sm mb-2">Score: {score}</p>
            <p
              className="text-3xl md:text-4xl font-bold mb-10"
              aria-live="polite"
            >
              {currentWord}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleAnswer('seen')}
                className="flex-1 max-w-[160px] px-6 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-semibold text-lg min-h-[44px] transition-colors"
                aria-label="I have seen this word before"
              >
                SEEN
              </button>
              <button
                onClick={() => handleAnswer('new')}
                className="flex-1 max-w-[160px] px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-semibold text-lg min-h-[44px] transition-colors"
                aria-label="This is a new word"
              >
                NEW
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center px-6">
          <div className="text-center text-white w-full max-w-md">
            <div className="text-6xl mb-6" aria-hidden="true">📝</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Verbal Memory</p>
            <div className="bg-white/10 rounded-xl px-6 py-4 mb-6 inline-block">
              <p className="text-white/60 text-sm mb-1">Score</p>
              <p className="text-4xl md:text-5xl font-bold">{score}</p>
              <p className="text-white/60 text-sm mt-1">correct answers</p>
            </div>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/60 text-sm mb-6">Your best: {bestScore} points</p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleTryAgain}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </GameCard>
  )
}
