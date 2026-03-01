'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { getChordsForLevel, type ChordInfo } from '../data/chords'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Root note range: C3 to C4 (lower range for richer chords)
const ROOT_FREQUENCIES = [
  130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63,
]

function semitoneToFreq(rootFreq: number, semitones: number): number {
  return rootFreq * Math.pow(2, semitones / 12)
}

function generateRound(level: number): {
  rootFreq: number
  correct: ChordInfo
  options: ChordInfo[]
} {
  const pool = getChordsForLevel(level)
  const shuffled = shuffleArray(pool)
  const correct = shuffled[0]
  const distractors = shuffled.slice(1, 4)

  while (distractors.length < 3) {
    const extra = pool.find(
      (c) => c.symbol !== correct.symbol && !distractors.some((d) => d.symbol === c.symbol)
    )
    if (extra) distractors.push(extra)
    else break
  }

  return {
    rootFreq: pickRandom(ROOT_FREQUENCIES),
    correct,
    options: shuffleArray([correct, ...distractors]),
  }
}

export function ChordIdentification({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState<ChordInfo | null>(null)
  const [options, setOptions] = useState<ChordInfo[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [currentRootFreq, setCurrentRootFreq] = useState(0)

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

  const playChord = useCallback((rootFreq: number, chord: ChordInfo) => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const masterGain = ctx.createGain()
    // Reduce gain per note to prevent clipping
    masterGain.gain.setValueAtTime(0.2 / chord.offsets.length, ctx.currentTime)
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    masterGain.connect(ctx.destination)

    for (const offset of chord.offsets) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(semitoneToFreq(rootFreq, offset), ctx.currentTime)
      osc.connect(masterGain)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.5)
    }
  }, [getAudioContext])

  const startRound = useCallback((lvl: number) => {
    const round = generateRound(lvl)
    setCorrect(round.correct)
    setOptions(round.options)
    setCurrentRootFreq(round.rootFreq)
    setSelectedSymbol(null)
    setWasCorrect(false)
    setPhase('playing')
    playTimeoutRef.current = setTimeout(() => {
      playChord(round.rootFreq, round.correct)
    }, 100)
  }, [playChord])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1)
  }, [startRound])

  const handleAnswer = useCallback((chord: ChordInfo) => {
    if (phase !== 'playing' || !correct) return

    const isCorrect = chord.symbol === correct.symbol
    setSelectedSymbol(chord.symbol)
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
  }, [phase, correct, level, lives, startRound, onComplete])

  const handleReplay = useCallback(() => {
    if (correct) {
      playChord(currentRootFreq, correct)
    }
  }, [correct, currentRootFreq, playChord])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#ec4899'
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

  const getButtonStyle = (chord: ChordInfo) => {
    if (phase !== 'feedback') {
      return 'bg-white/20 hover:bg-white/30 text-white'
    }
    if (chord.symbol === correct?.symbol) {
      return 'bg-green-500 ring-2 ring-white text-white'
    }
    if (chord.symbol === selectedSymbol) {
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
            aria-label="Start chord identification test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎹</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Chord Identification</p>
            <p className="text-white/70 text-lg mb-2">Listen to a chord and identify its type</p>
            <p className="text-white/60 text-sm">🎧 Headphones recommended</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-6">
            <p className="text-lg text-white/70 mb-6">What chord is this?</p>
            <button
              onClick={handleReplay}
              className="mb-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors text-lg"
              aria-label="Replay the chord"
            >
              🔊 Replay
            </button>
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((chord) => (
                <button
                  key={chord.symbol}
                  onClick={() => handleAnswer(chord)}
                  className={`rounded-xl text-lg font-bold min-h-[56px] transition-colors ${getButtonStyle(chord)}`}
                  aria-label={`Select ${chord.name}`}
                >
                  {chord.name}
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
            <p className="text-2xl md:text-3xl font-bold mb-6">
              {wasCorrect ? 'Correct!' : `It was ${correct?.name}`}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((chord) => (
                <div
                  key={chord.symbol}
                  className={`rounded-xl text-lg font-bold min-h-[56px] flex items-center justify-center ${getButtonStyle(chord)}`}
                >
                  {chord.name}
                </div>
              ))}
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
