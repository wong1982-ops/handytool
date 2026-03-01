'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { EASY_NOTES, MEDIUM_NOTES, HARD_NOTES, type NoteInfo } from '../data/notes'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function getNotesForLevel(level: number): NoteInfo[] {
  if (level <= 3) return EASY_NOTES
  if (level <= 6) return MEDIUM_NOTES
  return HARD_NOTES
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateOptions(level: number): { correct: NoteInfo; options: NoteInfo[] } {
  const pool = getNotesForLevel(level)
  const shuffledPool = shuffleArray(pool)
  const correct = shuffledPool[0]
  const distractors = shuffledPool.slice(1, 4)
  const options = shuffleArray([correct, ...distractors])
  return { correct, options }
}

export function PitchIdentification({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [correctNote, setCorrectNote] = useState<NoteInfo | null>(null)
  const [options, setOptions] = useState<NoteInfo[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current)
      }
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop() } catch { /* already stopped */ }
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playTone = useCallback((frequency: number) => {
    const ctx = getAudioContext()

    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Stop any existing oscillator
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop() } catch { /* already stopped */ }
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1)

    oscillatorRef.current = oscillator
    gainNodeRef.current = gainNode
  }, [getAudioContext])

  const startRound = useCallback((lvl: number) => {
    const { correct, options: opts } = generateOptions(lvl)
    setCorrectNote(correct)
    setOptions(opts)
    setSelectedName(null)
    setWasCorrect(false)
    setPhase('playing')
    // Play the tone after a brief delay to let UI update
    setTimeout(() => playTone(correct.frequency), 100)
  }, [playTone])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1)
  }, [startRound])

  const handleAnswer = useCallback((note: NoteInfo) => {
    if (phase !== 'playing' || !correctNote) return

    const isCorrect = note.name === correctNote.name
    setSelectedName(note.name)
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
  }, [phase, correctNote, level, lives, startRound, onComplete])

  const handleReplay = useCallback(() => {
    if (correctNote) {
      playTone(correctNote.frequency)
    }
  }, [correctNote, playTone])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
    setLevel(1)
    setLives(3)
    setCorrectNote(null)
    setOptions([])
    setSelectedName(null)
  }, [])

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
        return '#f59e0b'
      case 'playing':
        return '#f59e0b'
      case 'feedback':
        return wasCorrect ? '#16a34a' : '#dc2626'
      case 'gameover':
        return '#2563eb'
    }
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    const hearts = '♥'.repeat(lives) + '♡'.repeat(3 - lives)
    return `LEVEL ${level}  ${hearts}`
  }

  const getButtonStyle = (note: NoteInfo) => {
    if (phase !== 'feedback') {
      return 'bg-white/20 hover:bg-white/30 text-white'
    }

    if (note.name === correctNote?.name) {
      return 'bg-green-500 ring-2 ring-white text-white'
    }

    if (note.name === selectedName) {
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
            aria-label="Start pitch identification test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎵</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Pitch Identification</p>
            <p className="text-white/70 text-lg mb-2">Listen to the tone and identify the note</p>
            <p className="text-white/60 text-sm">🎧 Headphones recommended</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-6">
            <p className="text-lg text-white/70 mb-6">What note is this?</p>
            <button
              onClick={handleReplay}
              className="mb-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors text-lg"
              aria-label="Replay the tone"
            >
              🔊 Replay
            </button>
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((note) => (
                <button
                  key={note.name}
                  onClick={() => handleAnswer(note)}
                  className={`rounded-xl text-xl font-bold min-h-[56px] transition-colors ${getButtonStyle(note)}`}
                  aria-label={`Select note ${note.name}`}
                >
                  {note.name}
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
              {wasCorrect ? 'Correct!' : `It was ${correctNote?.name}`}
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((note) => (
                <div
                  key={note.name}
                  className={`rounded-xl text-xl font-bold min-h-[56px] flex items-center justify-center ${getButtonStyle(note)}`}
                >
                  {note.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">You reached</p>
            <p className="text-5xl md:text-6xl font-black mb-2">
              Level {level}
            </p>
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
