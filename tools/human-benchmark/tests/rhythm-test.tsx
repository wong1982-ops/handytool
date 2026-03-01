'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import { generateRandomPattern } from '../data/rhythms'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'listen' | 'record' | 'feedback' | 'gameover'

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

interface BeatMatch {
  beatTime: number
  tapTime: number | null // null = missed
  deviation: number // ms off, 0 = perfect
  score: number // 0-1
}

interface ScoreResult {
  accuracy: number
  matches: BeatMatch[]
  extraTaps: number[] // timestamps of unmatched user taps
}

function scoreRound(originalBeats: number[], userTaps: number[]): ScoreResult {
  const matched = new Set<number>()
  let sumBeatScores = 0
  const matches: BeatMatch[] = []

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
      matches.push({
        beatTime: beat,
        tapTime: userTaps[bestIdx],
        deviation: Math.abs(userTaps[bestIdx] - beat),
        score: bestScore,
      })
    } else {
      matches.push({ beatTime: beat, tapTime: null, deviation: 200, score: 0 })
    }
    sumBeatScores += bestScore
  }

  const extraTaps = userTaps
    .filter((_, i) => !matched.has(i))
    .map((t) => t)
  const penalty = extraTaps.length * 0.5
  const rawScore = ((sumBeatScores - penalty) / originalBeats.length) * 100

  return {
    accuracy: Math.max(0, Math.min(100, rawScore)),
    matches,
    extraTaps,
  }
}

export function RhythmTest({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [beats, setBeats] = useState<number[]>([])
  const [activeBeatIndex, setActiveBeatIndex] = useState(-1)
  const [isPulsing, setIsPulsing] = useState(false)
  const [userTaps, setUserTaps] = useState<number[]>([])
  const [tapCount, setTapCount] = useState(0)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [lastAccuracy, setLastAccuracy] = useState(0)
  const [lastResult, setLastResult] = useState<ScoreResult | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const recordStartRef = useRef(0)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }, [])

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }, [])

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

  const startListening = useCallback((lvl: number) => {
    clearAllTimeouts()
    const pattern = generateRandomPattern(lvl)
    setBeats(pattern)
    setActiveBeatIndex(-1)
    setUserTaps([])
    setTapCount(0)
    setPhase('listen')

    addTimeout(() => {
      const ctx = getAudioContext()
      pattern.forEach((beatTime, i) => {
        addTimeout(() => {
          playClick(ctx)
          triggerPulse()
          setActiveBeatIndex(i)
        }, beatTime)
      })

      const lastBeat = pattern[pattern.length - 1]
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
    setUserTaps((prev) => [...prev, timestamp])
    setTapCount((prev) => prev + 1)
  }, [phase, getAudioContext, triggerPulse])

  const handleSubmitRound = useCallback(() => {
    if (beats.length === 0) return
    const result = scoreRound(beats, userTaps)
    setLastAccuracy(Math.round(result.accuracy))
    setLastResult(result)
    const passed = result.accuracy >= 60

    setWasCorrect(passed)
    setPhase('feedback')

    // Longer feedback to show the timeline visualization
    const feedbackDelay = 2500

    if (passed) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startListening(nextLevel)
      }, feedbackDelay)
    } else {
      const newLives = lives - 1
      setLives(newLives)

      if (newLives <= 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setPhase('gameover')
          onComplete(level)
        }, feedbackDelay)
      } else {
        feedbackTimeoutRef.current = setTimeout(() => {
          startListening(level)
        }, feedbackDelay)
      }
    }
  }, [beats, userTaps, level, lives, startListening, onComplete])

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
    getAudioContext()
    setLevel(1)
    setLives(3)
    startListening(1)
  }, [getAudioContext, startListening])

  const handleTryAgain = useCallback(() => {
    clearAllTimeouts()
    setPhase('intro')
  }, [clearAllTimeouts])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'listen':
      case 'record':
        return '#8b5cf6'
      case 'feedback':
        return wasCorrect ? '#16a34a' : '#dc2626'
      case 'gameover':
        return '#2563eb'
    }
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    if (phase === 'listen') return `LEVEL ${level}  ${heartsDisplay} — LISTEN`
    if (phase === 'record') return `LEVEL ${level}  ${heartsDisplay} — TAP`
    return `LEVEL ${level}  ${heartsDisplay}`
  }

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
            <p className="text-2xl md:text-3xl font-bold mb-3">Rhythm</p>
            <p className="text-white/70 text-lg mb-2">Listen to the rhythm, then tap it back</p>
            <p className="text-white/50 text-sm mb-4">🎧 Headphones recommended</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm">Your best: Level {bestScore}</p>
            )}
          </button>
        )}

        {phase === 'listen' && (
          <div className="text-center text-white px-6">
            <div
              className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-100 ${
                isPulsing ? 'scale-110 bg-white/40' : 'bg-white/20'
              }`}
              aria-hidden="true"
            >
              <span className="text-4xl">🔊</span>
            </div>
            <p className="text-lg font-semibold mb-4">Listen carefully...</p>
            <div className="flex justify-center gap-2" aria-label={`Pattern with ${beats.length} beats`}>
              {beats.map((_, i) => (
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

        {phase === 'record' && (
          <div className="text-center text-white px-6">
            <div className="flex justify-center gap-2 mb-6" aria-label={`${tapCount} of ${beats.length} beats tapped`}>
              {beats.map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-100 ${
                    i < tapCount ? 'bg-white scale-125' : 'bg-white/30'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
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
              Done
            </button>
          </div>
        )}

        {phase === 'feedback' && lastResult && (
          <div className="text-center text-white px-4 w-full">
            <p className="text-xl md:text-2xl font-bold mb-1">
              {wasCorrect ? 'Nice rhythm!' : 'Off beat!'}
            </p>
            <p className="text-white/70 text-sm mb-4">Accuracy: {lastAccuracy}%</p>

            {/* Timeline comparison */}
            <div className="w-full max-w-[400px] mx-auto">
              {(() => {
                const allTimes = [
                  ...lastResult.matches.map((m) => m.beatTime),
                  ...lastResult.matches.filter((m) => m.tapTime !== null).map((m) => m.tapTime!),
                  ...lastResult.extraTaps,
                ]
                const maxTime = Math.max(...allTimes, 1)

                const getColor = (score: number) => {
                  if (score >= 0.8) return 'bg-green-400'
                  if (score >= 0.5) return 'bg-yellow-400'
                  return 'bg-red-400'
                }

                const getLabel = (deviation: number) => {
                  if (deviation < 30) return 'Perfect'
                  if (deviation < 80) return 'Good'
                  if (deviation < 150) return 'Late'
                  return 'Missed'
                }

                return (
                  <div className="flex flex-col gap-1">
                    {/* Legend */}
                    <div className="flex justify-between text-[10px] text-white/50 mb-1 px-1">
                      <span>Expected</span>
                      <span>Your taps</span>
                    </div>

                    {/* Beat-by-beat rows */}
                    {lastResult.matches.map((m, i) => {
                      const beatPos = (m.beatTime / maxTime) * 100
                      const tapPos = m.tapTime !== null ? (m.tapTime / maxTime) * 100 : null
                      const missed = m.tapTime === null

                      return (
                        <div key={i} className="relative h-8 bg-white/5 rounded-md overflow-hidden">
                          {/* Expected beat marker */}
                          <div
                            className="absolute top-0 h-full w-[3px] bg-white/40"
                            style={{ left: `${beatPos}%` }}
                          />
                          <div
                            className="absolute top-0.5 w-3 h-3 rounded-full bg-white/60 -translate-x-1/2"
                            style={{ left: `${beatPos}%` }}
                          />

                          {/* User tap marker */}
                          {tapPos !== null && (
                            <>
                              <div
                                className={`absolute bottom-0.5 w-3 h-3 rounded-full -translate-x-1/2 ${getColor(m.score)}`}
                                style={{ left: `${tapPos}%` }}
                              />
                              {/* Connecting line */}
                              <div
                                className={`absolute top-1/2 h-[1px] ${getColor(m.score)} opacity-50`}
                                style={{
                                  left: `${Math.min(beatPos, tapPos)}%`,
                                  width: `${Math.abs(beatPos - tapPos)}%`,
                                }}
                              />
                            </>
                          )}

                          {/* Label */}
                          <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium ${
                            missed ? 'text-red-400' : m.score >= 0.8 ? 'text-green-400' : m.score >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {missed ? 'Missed' : getLabel(m.deviation)}
                          </span>
                        </div>
                      )
                    })}

                    {/* Extra taps row */}
                    {lastResult.extraTaps.length > 0 && (
                      <div className="relative h-6 bg-red-500/10 rounded-md overflow-hidden">
                        {lastResult.extraTaps.map((t, i) => (
                          <div
                            key={i}
                            className="absolute top-1 w-2.5 h-2.5 rounded-full bg-red-400/70 -translate-x-1/2"
                            style={{ left: `${(t / maxTime) * 100}%` }}
                          />
                        ))}
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-red-400 font-medium">
                          +{lastResult.extraTaps.length} extra
                        </span>
                      </div>
                    )}

                    {/* Color key */}
                    <div className="flex justify-center gap-3 mt-2 text-[9px] text-white/50">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/60" />Expected</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Your tap</span>
                      {lastResult.extraTaps.length > 0 && (
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400/70" />Extra</span>
                      )}
                    </div>
                  </div>
                )
              })()}
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
