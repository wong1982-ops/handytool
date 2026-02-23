'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { TYPING_PASSAGES } from '../data/typing-passages'

type Phase = 'intro' | 'typing' | 'result'

function getRandomPassage(): string {
  return TYPING_PASSAGES[Math.floor(Math.random() * TYPING_PASSAGES.length)]
}

export function TypingTest({ onComplete, onBack, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [passage, setPassage] = useState(() => getRandomPassage())
  const [cursorPos, setCursorPos] = useState(0)
  const [charStates, setCharStates] = useState<('correct' | 'incorrect' | 'pending')[]>([])
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [liveWpm, setLiveWpm] = useState(0)
  const [finalWpm, setFinalWpm] = useState(0)
  const [finalAccuracy, setFinalAccuracy] = useState(0)
  const [finalTime, setFinalTime] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize char states when passage changes
  useEffect(() => {
    setCharStates(new Array(passage.length).fill('pending'))
  }, [passage])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Live WPM + elapsed time updater
  useEffect(() => {
    if (startTime && phase === 'typing') {
      timerRef.current = setInterval(() => {
        const now = performance.now()
        const elapsed = now - startTime
        setElapsedMs(elapsed)
        const minutes = elapsed / 60000
        if (minutes > 0) {
          const charsTyped = charStates.filter(s => s === 'correct').length
          setLiveWpm(Math.round((charsTyped / 5) / minutes))
        }
      }, 200)
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [startTime, phase, charStates])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const handleStart = useCallback(() => {
    const newPassage = getRandomPassage()
    setPassage(newPassage)
    setCharStates(new Array(newPassage.length).fill('pending'))
    setCursorPos(0)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
    setStartTime(null)
    setElapsedMs(0)
    setLiveWpm(0)
    setPhase('typing')
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const finishTest = useCallback((states: ('correct' | 'incorrect' | 'pending')[], totalKs: number, correctKs: number, start: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const endTime = performance.now()
    const timeMs = endTime - start
    const timeMinutes = timeMs / 60000
    const timeSec = timeMs / 1000

    const correctChars = states.filter(s => s === 'correct').length
    const wpm = timeMinutes > 0 ? Math.round((correctChars / 5) / timeMinutes) : 0
    const accuracy = totalKs > 0 ? Math.round((correctKs / totalKs) * 100) : 100

    setFinalWpm(wpm)
    setFinalAccuracy(accuracy)
    setFinalTime(timeSec)
    setPhase('result')
    onComplete(wpm)
  }, [onComplete])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase !== 'typing') return

    // Prevent default for most keys to avoid input value changing
    if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta' && e.key !== 'CapsLock' && e.key !== 'Tab' && e.key !== 'Escape') {
      e.preventDefault()
    }

    // Ignore modifier-only keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
      return
    }

    // Start timer on first real keystroke
    let currentStart = startTime
    if (!currentStart) {
      currentStart = performance.now()
      setStartTime(currentStart)
    }

    if (e.key === 'Backspace') {
      if (cursorPos > 0) {
        const newPos = cursorPos - 1
        setCursorPos(newPos)
        setCharStates(prev => {
          const next = [...prev]
          next[newPos] = 'pending'
          return next
        })
      }
      return
    }

    // Only process single printable characters
    if (e.key.length !== 1) return

    const expectedChar = passage[cursorPos]
    const isCorrect = e.key === expectedChar

    const newTotalKeystrokes = totalKeystrokes + 1
    const newCorrectKeystrokes = correctKeystrokes + (isCorrect ? 1 : 0)
    setTotalKeystrokes(newTotalKeystrokes)
    setCorrectKeystrokes(newCorrectKeystrokes)

    const newStates = [...charStates]
    newStates[cursorPos] = isCorrect ? 'correct' : 'incorrect'
    setCharStates(newStates)

    const newPos = cursorPos + 1
    setCursorPos(newPos)

    // Check if passage is complete
    if (newPos >= passage.length) {
      finishTest(newStates, newTotalKeystrokes, newCorrectKeystrokes, currentStart!)
    }
  }, [phase, startTime, cursorPos, passage, totalKeystrokes, correctKeystrokes, charStates, finishTest])

  const handleTryAgain = useCallback(() => {
    handleStart()
  }, [handleStart])

  const currentAccuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100
    return Math.round((correctKeystrokes / totalKeystrokes) * 100)
  }, [totalKeystrokes, correctKeystrokes])

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`
  }

  const badge = phase === 'typing' && startTime ? `${liveWpm} WPM` : undefined

  return (
    <GameCard bgColor="#4f46e5" badge={badge}>
      {/* Hidden input for capturing keystrokes */}
      {phase === 'typing' && (
        <input
          ref={inputRef}
          type="text"
          className="sr-only"
          autoFocus
          onKeyDown={handleKeyDown}
          aria-label="Type the displayed passage"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      )}

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
            <div className="text-6xl mb-6" aria-hidden="true">⌨️</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Typing Test</p>
            <p className="text-white/70 text-lg mb-6">
              Type the text below as fast and accurately as you can
            </p>
            <p className="text-white/50">Click to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: {bestScore} WPM</p>
            )}
          </div>
        </div>
      )}

      {phase === 'typing' && (
        <div
          ref={containerRef}
          className="w-full h-full min-h-[350px] md:min-h-[400px] flex flex-col items-center justify-center cursor-text px-4 md:px-8"
          onClick={focusInput}
        >
          <div className="w-full max-w-2xl">
            {/* Passage display */}
            <div
              className="font-mono text-lg md:text-xl leading-relaxed mb-6 select-none"
              aria-label="Passage to type"
            >
              {passage.split('').map((char, i) => {
                const state = charStates[i] || 'pending'
                const isCursor = i === cursorPos

                let className = 'text-white/40' // pending
                if (state === 'correct') className = 'text-green-400'
                if (state === 'incorrect') className = 'text-red-400 bg-red-400/20 rounded-sm'

                return (
                  <span
                    key={i}
                    className={`${className} ${isCursor ? 'border-b-2 border-white animate-pulse' : ''}`}
                  >
                    {char}
                  </span>
                )
              })}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-white/60 text-sm">
              <span>Accuracy: {currentAccuracy}%</span>
              <span>{formatTime(elapsedMs / 1000)} elapsed</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center">
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">Your Speed</p>
            <p className="text-5xl md:text-6xl font-black mb-2">
              {finalWpm}<span className="text-2xl font-bold"> WPM</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4 mb-6">
              <span className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
                Accuracy: {finalAccuracy}%
              </span>
              <span className="bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
                Time: {formatTime(finalTime)}
              </span>
            </div>
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
