'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'listen' | 'replay' | 'feedback' | 'gameover'

// 4 tones mapped to 4 colored buttons
const TONES = [
  { id: 0, frequency: 261.63, color: 'bg-red-500', activeColor: 'bg-red-400', label: 'Red' },
  { id: 1, frequency: 329.63, color: 'bg-blue-500', activeColor: 'bg-blue-400', label: 'Blue' },
  { id: 2, frequency: 392.0, color: 'bg-green-500', activeColor: 'bg-green-400', label: 'Green' },
  { id: 3, frequency: 523.25, color: 'bg-yellow-500', activeColor: 'bg-yellow-400', label: 'Yellow' },
]

export function ToneMemory({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playbackTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      playbackTimeoutsRef.current.forEach(clearTimeout)
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playToneAt = useCallback((frequency: number) => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  }, [getAudioContext])

  const playSequence = useCallback((seq: number[], onDone: () => void) => {
    // Clear any existing playback timeouts
    playbackTimeoutsRef.current.forEach(clearTimeout)
    playbackTimeoutsRef.current = []

    seq.forEach((toneId, index) => {
      const delay = index * 600 // 400ms tone + 200ms gap

      const showTimeout = setTimeout(() => {
        setActiveButton(toneId)
        playToneAt(TONES[toneId].frequency)
      }, delay)

      const hideTimeout = setTimeout(() => {
        setActiveButton(null)
      }, delay + 400)

      playbackTimeoutsRef.current.push(showTimeout, hideTimeout)
    })

    const doneTimeout = setTimeout(onDone, seq.length * 600 + 200)
    playbackTimeoutsRef.current.push(doneTimeout)
  }, [playToneAt])

  const startRound = useCallback((lvl: number, existingSequence: number[]) => {
    // Add one random tone to the sequence
    const newTone = Math.floor(Math.random() * 4)
    const newSequence = [...existingSequence, newTone]
    setSequence(newSequence)
    setPlayerIndex(0)
    setWasCorrect(false)
    setPhase('listen')

    // Play the sequence after a brief delay
    setTimeout(() => {
      playSequence(newSequence, () => {
        setPhase('replay')
      })
    }, 300)
  }, [playSequence])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    // Start with a sequence of 2 tones
    const initial = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ]
    setSequence(initial)
    setPlayerIndex(0)
    setPhase('listen')

    setTimeout(() => {
      playSequence(initial, () => {
        setPhase('replay')
      })
    }, 300)
  }, [playSequence])

  const handleButtonClick = useCallback((toneId: number) => {
    if (phase !== 'replay') return

    // Visual + audio feedback for the click
    setActiveButton(toneId)
    playToneAt(TONES[toneId].frequency)
    setTimeout(() => setActiveButton(null), 200)

    if (toneId === sequence[playerIndex]) {
      // Correct
      const nextIndex = playerIndex + 1
      if (nextIndex >= sequence.length) {
        // Completed the whole sequence!
        setWasCorrect(true)
        setPhase('feedback')
        feedbackTimeoutRef.current = setTimeout(() => {
          const nextLevel = level + 1
          setLevel(nextLevel)
          startRound(nextLevel, sequence)
        }, 800)
      } else {
        setPlayerIndex(nextIndex)
      }
    } else {
      // Wrong!
      setWasCorrect(false)
      setPhase('feedback')
      const newLives = lives - 1
      setLives(newLives)

      if (newLives <= 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setPhase('gameover')
          onComplete(level)
        }, 800)
      } else {
        // Replay same level with same sequence
        feedbackTimeoutRef.current = setTimeout(() => {
          setPlayerIndex(0)
          setPhase('listen')
          setTimeout(() => {
            playSequence(sequence, () => {
              setPhase('replay')
            })
          }, 300)
        }, 800)
      }
    }
  }, [phase, sequence, playerIndex, level, lives, startRound, playToneAt, playSequence, onComplete])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'listen':
      case 'replay':
        return '#10b981'
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
            aria-label="Start tone memory test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🧠</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Tone Memory</p>
            <p className="text-white/70 text-lg mb-2">Remember the tone sequence and play it back</p>
            <p className="text-white/60 text-sm">🎧 Headphones recommended</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {(phase === 'listen' || phase === 'replay') && (
          <div className="text-center text-white px-6">
            <p className="text-lg text-white/70 mb-2">
              {phase === 'listen' ? 'Listen carefully...' : 'Your turn! Replay the sequence'}
            </p>
            <p className="text-white/50 text-sm mb-6">
              {phase === 'replay' ? `${playerIndex}/${sequence.length}` : `${sequence.length} notes`}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-[240px] mx-auto">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => handleButtonClick(tone.id)}
                  disabled={phase === 'listen'}
                  className={`rounded-xl min-h-[80px] md:min-h-[96px] transition-all duration-150 ${
                    activeButton === tone.id
                      ? `${tone.activeColor} scale-105 ring-2 ring-white`
                      : `${tone.color} ${phase === 'replay' ? 'hover:brightness-110 cursor-pointer' : 'opacity-70 cursor-default'}`
                  }`}
                  aria-label={`${tone.label} tone button`}
                />
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
              {wasCorrect ? 'Correct!' : 'Wrong sequence!'}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-[240px] mx-auto opacity-50">
              {TONES.map((tone) => (
                <div
                  key={tone.id}
                  className={`rounded-xl min-h-[80px] md:min-h-[96px] ${tone.color}`}
                />
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
