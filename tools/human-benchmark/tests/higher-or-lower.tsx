'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function generateRound(level: number): {
  freq1: number
  freq2: number
  higherIs: 1 | 2
} {
  // Gap decreases with level: starts at ~150Hz, shrinks
  const gap = Math.max(5, 150 / (1 + (level - 1) * 0.3))

  // Base frequency range: 200-600Hz
  const baseFreq = 200 + Math.random() * 400

  const higher = baseFreq + gap / 2
  const lower = baseFreq - gap / 2

  // Randomly assign which is first vs second
  if (Math.random() < 0.5) {
    return { freq1: higher, freq2: lower, higherIs: 1 }
  } else {
    return { freq1: lower, freq2: higher, higherIs: 2 }
  }
}

export function HigherOrLower({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [freq1, setFreq1] = useState(0)
  const [freq2, setFreq2] = useState(0)
  const [higherIs, setHigherIs] = useState<1 | 2>(1)
  const [selectedAnswer, setSelectedAnswer] = useState<1 | 2 | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current)
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playTonePair = useCallback((f1: number, f2: number) => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    // Tone 1: 0-300ms
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(f1, ctx.currentTime)
    gain1.gain.setValueAtTime(0.3, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.3)

    // Tone 2: 500-800ms (200ms gap)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(f2, ctx.currentTime + 0.5)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.5)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.5)
    osc2.stop(ctx.currentTime + 0.8)
  }, [getAudioContext])

  const startRound = useCallback((lvl: number) => {
    const round = generateRound(lvl)
    setFreq1(round.freq1)
    setFreq2(round.freq2)
    setHigherIs(round.higherIs)
    setSelectedAnswer(null)
    setWasCorrect(false)
    setPhase('playing')
    playTimeoutRef.current = setTimeout(() => {
      playTonePair(round.freq1, round.freq2)
    }, 100)
  }, [playTonePair])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1)
  }, [startRound])

  const handleAnswer = useCallback((answer: 1 | 2) => {
    if (phase !== 'playing') return

    const isCorrect = answer === higherIs
    setSelectedAnswer(answer)
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel)
      }, 800)
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
  }, [phase, higherIs, level, lives, startRound, onComplete])

  const handleReplay = useCallback(() => {
    playTonePair(freq1, freq2)
  }, [freq1, freq2, playTonePair])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#0ea5e9'
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

  const getAnswerButtonStyle = (answer: 1 | 2) => {
    if (phase !== 'feedback') {
      return 'bg-white/20 hover:bg-white/30 text-white'
    }
    if (answer === higherIs) {
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
            aria-label="Start higher or lower test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🔊</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Higher or Lower</p>
            <p className="text-white/70 text-lg mb-2">Which of the two tones was higher?</p>
            <p className="text-white/60 text-sm">🎧 Headphones recommended</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-6">
            <p className="text-lg text-white/70 mb-6">Which tone was higher?</p>
            <button
              onClick={handleReplay}
              className="mb-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors text-lg"
              aria-label="Replay the tones"
            >
              🔊 Replay
            </button>
            <div className="flex gap-4 justify-center max-w-[320px] mx-auto">
              <button
                onClick={() => handleAnswer(1)}
                className={`flex-1 rounded-xl text-xl font-bold min-h-[80px] transition-colors ${getAnswerButtonStyle(1)}`}
                aria-label="First tone was higher"
              >
                1st
              </button>
              <button
                onClick={() => handleAnswer(2)}
                className={`flex-1 rounded-xl text-xl font-bold min-h-[80px] transition-colors ${getAnswerButtonStyle(2)}`}
                aria-label="Second tone was higher"
              >
                2nd
              </button>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-4" aria-hidden="true">
              {wasCorrect ? '✅' : '❌'}
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-6">
              {wasCorrect ? 'Correct!' : `The ${higherIs === 1 ? '1st' : '2nd'} was higher`}
            </p>
            <div className="flex gap-4 justify-center max-w-[320px] mx-auto">
              <div
                className={`flex-1 rounded-xl text-xl font-bold min-h-[80px] flex items-center justify-center ${getAnswerButtonStyle(1)}`}
              >
                1st
              </div>
              <div
                className={`flex-1 rounded-xl text-xl font-bold min-h-[80px] flex items-center justify-center ${getAnswerButtonStyle(2)}`}
              >
                2nd
              </div>
            </div>
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
