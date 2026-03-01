'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import { getRandomPattern } from '../data/rhythms'
import type { RhythmPattern } from '../data/rhythms'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'listen' | 'record' | 'result'

const TOTAL_ROUNDS = 3
const DIFFICULTIES: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard']

function playClick(audioCtx: AudioContext) {
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  oscillator.type = 'square'
  oscillator.frequency.value = 800
  gainNode.gain.value = 0.3
  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  oscillator.start()
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05)
  oscillator.stop(audioCtx.currentTime + 0.05)
}

function scoreRound(originalBeats: number[], userTaps: number[]): number {
  const matched = new Set<number>()
  let sumBeatScores = 0

  for (const beat of originalBeats) {
    let bestScore = 0
    let bestIdx = -1

    for (let i = 0; i < userTaps.length; i++) {
      if (matched.has(i)) continue
      const deviation = Math.abs(userTaps[i] - beat)
      if (deviation <= 200) {
        const score = Math.max(0, 1 - deviation / 200)
        if (score > bestScore) {
          bestScore = score
          bestIdx = i
        }
      }
    }

    if (bestIdx >= 0) {
      matched.add(bestIdx)
    }
    sumBeatScores += bestScore
  }

  const extraTaps = userTaps.length - matched.size
  const penalty = extraTaps * 0.5
  const roundScore = ((sumBeatScores - penalty) / originalBeats.length) * 100

  return Math.max(0, Math.min(100, roundScore))
}

export function RhythmTest({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(1)
  const [pattern, setPattern] = useState<RhythmPattern | null>(null)
  const [activeBeatIndex, setActiveBeatIndex] = useState(-1)
  const [isPulsing, setIsPulsing] = useState(false)
  const [userTaps, setUserTaps] = useState<number[]>([])
  const [tapCount, setTapCount] = useState(0)
  const [roundScores, setRoundScores] = useState<number[]>([])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const recordStartRef = useRef(0)

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts()
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    }
  }, [clearAllTimeouts])

  const triggerPulse = useCallback(() => {
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), 100)
  }, [])

  const startListening = useCallback((roundNum: number) => {
    clearAllTimeouts()
    const difficulty = DIFFICULTIES[roundNum - 1]
    const pat = getRandomPattern(difficulty)
    setPattern(pat)
    setActiveBeatIndex(-1)
    setUserTaps([])
    setTapCount(0)
    setPhase('listen')

    // 500ms delay before pattern starts
    addTimeout(() => {
      const ctx = getAudioContext()
      pat.beats.forEach((beatTime, i) => {
        addTimeout(() => {
          playClick(ctx)
          triggerPulse()
          setActiveBeatIndex(i)
        }, beatTime)
      })

      // After last beat + 1200ms, transition to record
      const lastBeat = pat.beats[pat.beats.length - 1]
      addTimeout(() => {
        setActiveBeatIndex(-1)
        setPhase('record')
        recordStartRef.current = performance.now()
      }, lastBeat + 1200)
    }, 500)
  }, [clearAllTimeouts, addTimeout, getAudioContext, triggerPulse])

  const handleTap = useCallback(() => {
    if (phase !== 'record') return
    const ctx = getAudioContext()
    playClick(ctx)
    triggerPulse()
    const timestamp = performance.now() - recordStartRef.current
    setUserTaps(prev => [...prev, timestamp])
    setTapCount(prev => prev + 1)
  }, [phase, getAudioContext, triggerPulse])

  const handleSubmitRound = useCallback(() => {
    if (!pattern) return
    const score = scoreRound(pattern.beats, userTaps)
    const newScores = [...roundScores, score]
    setRoundScores(newScores)

    if (newScores.length >= TOTAL_ROUNDS) {
      const average = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length)
      setPhase('result')
      onComplete(average)
    } else {
      const nextRound = round + 1
      setRound(nextRound)
      startListening(nextRound)
    }
  }, [pattern, userTaps, roundScores, round, onComplete, startListening])

  // Keyboard support: spacebar to tap during record phase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && phase === 'record') {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, handleTap])

  const handleStart = useCallback(() => {
    getAudioContext() // Initialize on user gesture
    setRound(1)
    setRoundScores([])
    startListening(1)
  }, [getAudioContext, startListening])

  const handleTryAgain = useCallback(() => {
    clearAllTimeouts()
    setPhase('intro')
    setRound(1)
    setRoundScores([])
    setPattern(null)
    setActiveBeatIndex(-1)
    setUserTaps([])
    setTapCount(0)
  }, [clearAllTimeouts])

  const getBgColor = () => {
    if (phase === 'result') return '#2563eb'
    return '#8b5cf6'
  }

  const getBadge = () => {
    if (phase === 'listen') return `ROUND ${round}/${TOTAL_ROUNDS} — LISTEN`
    if (phase === 'record') return `ROUND ${round}/${TOTAL_ROUNDS} — TAP`
    return undefined
  }

  const averageScore = roundScores.length > 0
    ? Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length)
    : 0

  return (
    <GameCard bgColor={getBgColor()} badge={getBadge()}>
      <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center select-none">
        {phase === 'intro' && (
          <button
            type="button"
            onClick={handleStart}
            className="text-center text-white w-full h-full flex flex-col items-center justify-center min-h-[44px] cursor-pointer bg-transparent border-0 p-8"
            aria-label="Start Rhythm Test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🥁</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Rhythm Test</p>
            <p className="text-white/70 text-lg mb-2">Listen to the rhythm, then tap it back</p>
            <p className="text-white/50 text-sm mb-4">🎧 Headphones recommended &bull; 3 rounds</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm">Your best: {bestScore}%</p>
            )}
          </button>
        )}

        {phase === 'listen' && pattern && (
          <div className="text-center text-white px-6">
            {/* Visual pulse circle */}
            <div
              className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-100 ${
                isPulsing ? 'scale-110 bg-white/40' : 'bg-white/20'
              }`}
              aria-hidden="true"
            >
              <span className="text-4xl">🔊</span>
            </div>
            <p className="text-lg font-semibold mb-4">Listen carefully...</p>
            {/* Beat indicator dots */}
            <div className="flex justify-center gap-2" aria-label={`Pattern with ${pattern.beats.length} beats`}>
              {pattern.beats.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-100 ${
                    i <= activeBeatIndex ? 'bg-white scale-125' : 'bg-white/30'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}

        {phase === 'record' && pattern && (
          <div className="text-center text-white px-6">
            {/* Beat indicator dots showing user progress */}
            <div className="flex justify-center gap-2 mb-6" aria-label={`${tapCount} of ${pattern.beats.length} beats tapped`}>
              {pattern.beats.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-100 ${
                    i < tapCount ? 'bg-white scale-125' : 'bg-white/30'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            {/* Tap button */}
            <button
              type="button"
              onClick={handleTap}
              className={`w-40 h-40 rounded-full mx-auto flex items-center justify-center text-5xl transition-all duration-100 min-h-[44px] cursor-pointer active:bg-white/50 ${
                isPulsing ? 'scale-95 bg-white/40' : 'bg-white/20'
              }`}
              aria-label="Tap to record beat"
            >
              <span aria-hidden="true">👆</span>
            </button>
            <p className="text-white/70 text-sm mt-4 mb-2">Tap the rhythm or press Spacebar</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleSubmitRound()
              }}
              className="mt-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] text-white transition-colors"
            >
              Done — Submit Round
            </button>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">Average Accuracy</p>
            <p className="text-5xl md:text-6xl font-black mb-2">
              {averageScore}<span className="text-2xl font-bold">%</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
              {roundScores.map((s, i) => (
                <span key={i} className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                  R{i + 1}: {Math.round(s)}%
                </span>
              ))}
            </div>
            <button
              type="button"
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
