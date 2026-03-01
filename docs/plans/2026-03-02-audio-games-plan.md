# 4 New Audio Games Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4 new audio-based tests (Interval Recognition, Chord Identification, Tone Memory, Higher or Lower) to the Human Benchmark tool, bringing total tests from 12 to 16.

**Architecture:** Each test is an independent React component following the existing `TestComponentProps` pattern with phase-based state machine and `GameCard` wrapper. Audio is generated via Web Audio API (`OscillatorNode` + `GainNode`). New data files define interval ratios and chord structures. All tests use the existing scoring/localStorage infrastructure.

**Tech Stack:** React 19, Next.js 16, TypeScript, Web Audio API, Tailwind CSS v4

---

### Task 1: Update types and add data files

**Files:**
- Modify: `tools/human-benchmark/types.ts:1-13`
- Create: `tools/human-benchmark/data/intervals.ts`
- Create: `tools/human-benchmark/data/chords.ts`

**Step 1: Add 4 new TestId values to types.ts**

In `tools/human-benchmark/types.ts`, add 4 new IDs to the `TestId` union type (after `'rhythm-test'`):

```typescript
export type TestId =
  | 'reaction-time'
  | 'sequence-memory'
  | 'aim-trainer'
  | 'number-memory'
  | 'verbal-memory'
  | 'chimp-test'
  | 'visual-memory'
  | 'typing'
  | 'pitch-identification'
  | 'mental-rotation'
  | 'schulte-grid'
  | 'rhythm-test'
  | 'interval-recognition'
  | 'chord-identification'
  | 'tone-memory'
  | 'higher-or-lower'
```

**Step 2: Create `tools/human-benchmark/data/intervals.ts`**

```typescript
export interface IntervalInfo {
  name: string
  shortName: string
  semitones: number
  difficulty: 1 | 2 | 3
}

export const INTERVALS: IntervalInfo[] = [
  { name: 'Major 3rd', shortName: 'M3', semitones: 4, difficulty: 1 },
  { name: 'Perfect 5th', shortName: 'P5', semitones: 7, difficulty: 1 },
  { name: 'Octave', shortName: 'P8', semitones: 12, difficulty: 1 },
  { name: 'Major 2nd', shortName: 'M2', semitones: 2, difficulty: 2 },
  { name: 'Perfect 4th', shortName: 'P4', semitones: 5, difficulty: 2 },
  { name: 'Major 6th', shortName: 'M6', semitones: 9, difficulty: 2 },
  { name: 'Major 7th', shortName: 'M7', semitones: 11, difficulty: 2 },
  { name: 'Minor 2nd', shortName: 'm2', semitones: 1, difficulty: 3 },
  { name: 'Minor 3rd', shortName: 'm3', semitones: 3, difficulty: 3 },
  { name: 'Tritone', shortName: 'TT', semitones: 6, difficulty: 3 },
  { name: 'Minor 6th', shortName: 'm6', semitones: 8, difficulty: 3 },
  { name: 'Minor 7th', shortName: 'm7', semitones: 10, difficulty: 3 },
]

export const EASY_INTERVALS = INTERVALS.filter((i) => i.difficulty === 1)
export const MEDIUM_INTERVALS = INTERVALS.filter((i) => i.difficulty <= 2)
export const HARD_INTERVALS = INTERVALS

/** Convert semitones to frequency ratio */
export function semitoneRatio(semitones: number): number {
  return Math.pow(2, semitones / 12)
}

/** Get interval pool for a given level */
export function getIntervalsForLevel(level: number): IntervalInfo[] {
  if (level <= 3) return EASY_INTERVALS
  if (level <= 6) return MEDIUM_INTERVALS
  return HARD_INTERVALS
}
```

**Step 3: Create `tools/human-benchmark/data/chords.ts`**

```typescript
export interface ChordInfo {
  name: string
  symbol: string
  offsets: number[]
  difficulty: 1 | 2 | 3
}

export const CHORDS: ChordInfo[] = [
  { name: 'Major', symbol: 'maj', offsets: [0, 4, 7], difficulty: 1 },
  { name: 'Minor', symbol: 'min', offsets: [0, 3, 7], difficulty: 1 },
  { name: 'Diminished', symbol: 'dim', offsets: [0, 3, 6], difficulty: 2 },
  { name: 'Augmented', symbol: 'aug', offsets: [0, 4, 8], difficulty: 2 },
  { name: 'Major 7th', symbol: 'maj7', offsets: [0, 4, 7, 11], difficulty: 3 },
  { name: 'Minor 7th', symbol: 'min7', offsets: [0, 3, 7, 10], difficulty: 3 },
  { name: 'Dominant 7th', symbol: 'dom7', offsets: [0, 4, 7, 10], difficulty: 3 },
]

export const EASY_CHORDS = CHORDS.filter((c) => c.difficulty === 1)
export const MEDIUM_CHORDS = CHORDS.filter((c) => c.difficulty <= 2)
export const HARD_CHORDS = CHORDS

/** Get chord pool for a given level */
export function getChordsForLevel(level: number): ChordInfo[] {
  if (level <= 3) return EASY_CHORDS
  if (level <= 6) return MEDIUM_CHORDS
  return HARD_CHORDS
}
```

**Step 4: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm exec tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 5: Commit**

```bash
git add tools/human-benchmark/types.ts tools/human-benchmark/data/intervals.ts tools/human-benchmark/data/chords.ts
git commit -m "feat(human-benchmark): add types and data files for 4 new audio tests"
```

---

### Task 2: Add tips for new tests

**Files:**
- Modify: `tools/human-benchmark/data/tips.ts:79-80`

**Step 1: Add tips for all 4 new tests**

Add these 4 entries before the closing `}` in `tools/human-benchmark/data/tips.ts`:

```typescript
  'interval-recognition': [
    'Learn to associate each interval with a famous melody (e.g., Perfect 5th = Star Wars theme)',
    'Focus on the "distance" between the two notes — wider intervals sound more open',
    'Sing or hum the interval back to yourself before choosing your answer',
    'Minor intervals sound "darker" while major intervals sound "brighter"',
    'Start by mastering the easy intervals (3rd, 5th, octave) before moving to harder ones',
  ],
  'chord-identification': [
    'Major chords sound happy and bright, minor chords sound sad and dark',
    'Diminished chords have a tense, unstable quality — like something scary is about to happen',
    'Augmented chords sound dreamy and unresolved, like a question hanging in the air',
    'Listen to the overall "mood" of the chord rather than trying to pick out individual notes',
    'Use headphones for clearer chord separation — speakers can muddy the individual notes',
  ],
  'tone-memory': [
    'Associate each colored button with a feeling or image to strengthen the memory',
    'Repeat the sequence in your head as it plays — verbal rehearsal helps memory',
    'Focus on the pattern of movements (up-down-up) rather than individual notes',
    'Build on what you already know — each level only adds one new note to remember',
    'Close your eyes during playback to focus entirely on the sound sequence',
  ],
  'higher-or-lower': [
    'Focus on your gut feeling right after hearing both tones — your first instinct is usually right',
    'Use the replay button if unsure — sometimes a second listen makes the difference clear',
    'Higher-pitched tones sound "thinner" and "brighter", lower ones sound "fuller" and "warmer"',
    'Try to feel the pitch in your body — higher tones resonate in your head, lower ones in your chest',
    'At harder levels, hum along with each tone to better feel the difference',
  ],
```

**Step 2: Commit**

```bash
git add tools/human-benchmark/data/tips.ts
git commit -m "feat(human-benchmark): add tips for 4 new audio tests"
```

---

### Task 3: Create Interval Recognition test component

**Files:**
- Create: `tools/human-benchmark/tests/interval-recognition.tsx`

**Step 1: Create the component**

Create `tools/human-benchmark/tests/interval-recognition.tsx` with the full implementation:

```tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import {
  getIntervalsForLevel,
  semitoneRatio,
  type IntervalInfo,
} from '../data/intervals'

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

// Root note range: C3 (130.81Hz) to C5 (523.25Hz)
const ROOT_FREQUENCIES = [
  130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94,
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25,
]

function generateRound(level: number): {
  rootFreq: number
  intervalFreq: number
  correct: IntervalInfo
  options: IntervalInfo[]
} {
  const pool = getIntervalsForLevel(level)
  const shuffled = shuffleArray(pool)
  const correct = shuffled[0]
  const distractors = shuffled.slice(1, 4)

  // If pool has < 4 items, pad with items from the full pool
  while (distractors.length < 3) {
    const extra = pool.find(
      (i) => i.shortName !== correct.shortName && !distractors.some((d) => d.shortName === i.shortName)
    )
    if (extra) distractors.push(extra)
    else break
  }

  const rootFreq = pickRandom(ROOT_FREQUENCIES)
  const intervalFreq = rootFreq * semitoneRatio(correct.semitones)

  return {
    rootFreq,
    intervalFreq,
    correct,
    options: shuffleArray([correct, ...distractors]),
  }
}

export function IntervalRecognition({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState<IntervalInfo | null>(null)
  const [options, setOptions] = useState<IntervalInfo[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [rootFreq, setRootFreq] = useState(0)
  const [intervalFreq, setIntervalFreq] = useState(0)

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

  const playTone = useCallback((frequency: number, startDelay: number, duration: number) => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay)
    gain.gain.setValueAtTime(0.3, ctx.currentTime + startDelay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime + startDelay)
    osc.stop(ctx.currentTime + startDelay + duration)
  }, [getAudioContext])

  const playInterval = useCallback((root: number, interval: number) => {
    playTone(root, 0, 0.5)
    playTone(interval, 0.6, 0.5)
  }, [playTone])

  const startRound = useCallback((lvl: number) => {
    const round = generateRound(lvl)
    setCorrect(round.correct)
    setOptions(round.options)
    setRootFreq(round.rootFreq)
    setIntervalFreq(round.intervalFreq)
    setSelectedName(null)
    setWasCorrect(false)
    setPhase('playing')
    playTimeoutRef.current = setTimeout(() => {
      playInterval(round.rootFreq, round.intervalFreq)
    }, 100)
  }, [playInterval])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1)
  }, [startRound])

  const handleAnswer = useCallback((interval: IntervalInfo) => {
    if (phase !== 'playing' || !correct) return

    const isCorrect = interval.shortName === correct.shortName
    setSelectedName(interval.shortName)
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
    playInterval(rootFreq, intervalFreq)
  }, [rootFreq, intervalFreq, playInterval])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '♥'.repeat(lives) + '♡'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#14b8a6'
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

  const getButtonStyle = (interval: IntervalInfo) => {
    if (phase !== 'feedback') {
      return 'bg-white/20 hover:bg-white/30 text-white'
    }
    if (interval.shortName === correct?.shortName) {
      return 'bg-green-500 ring-2 ring-white text-white'
    }
    if (interval.shortName === selectedName) {
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
            aria-label="Start interval recognition test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎼</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Interval Recognition</p>
            <p className="text-white/70 text-lg mb-2">Listen to two notes and name the interval</p>
            <p className="text-white/60 text-sm">🎧 Headphones recommended</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-6">
            <p className="text-lg text-white/70 mb-6">What interval is this?</p>
            <button
              onClick={handleReplay}
              className="mb-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors text-lg"
              aria-label="Replay the interval"
            >
              🔊 Replay
            </button>
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((interval) => (
                <button
                  key={interval.shortName}
                  onClick={() => handleAnswer(interval)}
                  className={`rounded-xl text-lg font-bold min-h-[56px] transition-colors ${getButtonStyle(interval)}`}
                  aria-label={`Select ${interval.name}`}
                >
                  {interval.name}
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
              {options.map((interval) => (
                <div
                  key={interval.shortName}
                  className={`rounded-xl text-lg font-bold min-h-[56px] flex items-center justify-center ${getButtonStyle(interval)}`}
                >
                  {interval.name}
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
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm exec tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add tools/human-benchmark/tests/interval-recognition.tsx
git commit -m "feat(human-benchmark): add Interval Recognition test"
```

---

### Task 4: Create Chord Identification test component

**Files:**
- Create: `tools/human-benchmark/tests/chord-identification.tsx`

**Step 1: Create the component**

Create `tools/human-benchmark/tests/chord-identification.tsx`:

```tsx
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

  const heartsDisplay = '♥'.repeat(lives) + '♡'.repeat(3 - lives)

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
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm exec tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add tools/human-benchmark/tests/chord-identification.tsx
git commit -m "feat(human-benchmark): add Chord Identification test"
```

---

### Task 5: Create Tone Memory test component

**Files:**
- Create: `tools/human-benchmark/tests/tone-memory.tsx`

**Step 1: Create the component**

Create `tools/human-benchmark/tests/tone-memory.tsx`:

```tsx
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

  const heartsDisplay = '♥'.repeat(lives) + '♡'.repeat(3 - lives)

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
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm exec tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add tools/human-benchmark/tests/tone-memory.tsx
git commit -m "feat(human-benchmark): add Tone Memory test"
```

---

### Task 6: Create Higher or Lower test component

**Files:**
- Create: `tools/human-benchmark/tests/higher-or-lower.tsx`

**Step 1: Create the component**

Create `tools/human-benchmark/tests/higher-or-lower.tsx`:

```tsx
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

  const heartsDisplay = '♥'.repeat(lives) + '♡'.repeat(3 - lives)

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
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm exec tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 3: Commit**

```bash
git add tools/human-benchmark/tests/higher-or-lower.tsx
git commit -m "feat(human-benchmark): add Higher or Lower test"
```

---

### Task 7: Wire up constants.ts and page.tsx

**Files:**
- Modify: `tools/human-benchmark/constants.ts:326-355`
- Modify: `app/tools/human-benchmark/page.tsx:1-36`

**Step 1: Add 4 new TEST_CONFIGS entries in `constants.ts`**

Add these 4 entries after the existing `rhythm-test` config (before the closing `]`):

```typescript
  {
    id: 'interval-recognition',
    name: 'Interval Recognition',
    description:
      'Hear two notes and identify the musical interval between them.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-9L16.5 3m0 0L12 7.5m4.5-4.5v13.5',
      }),
    ),
    iconBg: 'bg-teal-900/30',
    iconColor: 'text-teal-400',
    iconBgLight: 'bg-teal-100',
    iconColorLight: 'text-teal-600',
    gameBgColor: '#14b8a6',
    unit: 'level',
    lowerIsBetter: false,
  },
  {
    id: 'chord-identification',
    name: 'Chord Identification',
    description:
      'Listen to a chord and identify whether it is major, minor, or another type.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z',
      }),
    ),
    iconBg: 'bg-pink-900/30',
    iconColor: 'text-pink-400',
    iconBgLight: 'bg-pink-100',
    iconColorLight: 'text-pink-600',
    gameBgColor: '#ec4899',
    unit: 'level',
    lowerIsBetter: false,
  },
  {
    id: 'tone-memory',
    name: 'Tone Memory',
    description:
      'Remember an ever-growing sequence of tones and play them back in order.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
      }),
    ),
    iconBg: 'bg-emerald-900/30',
    iconColor: 'text-emerald-400',
    iconBgLight: 'bg-emerald-100',
    iconColorLight: 'text-emerald-600',
    gameBgColor: '#10b981',
    unit: 'level',
    lowerIsBetter: false,
  },
  {
    id: 'higher-or-lower',
    name: 'Higher or Lower',
    description:
      'Hear two tones and decide which one was higher in pitch. Gets harder as gaps shrink.',
    icon: React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 1.5,
        stroke: 'currentColor',
        className: 'w-6 h-6',
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-4.5L16.5 21m0 0L12 16.5m4.5 4.5V7.5',
      }),
    ),
    iconBg: 'bg-sky-900/30',
    iconColor: 'text-sky-400',
    iconBgLight: 'bg-sky-100',
    iconColorLight: 'text-sky-600',
    gameBgColor: '#0ea5e9',
    unit: 'level',
    lowerIsBetter: false,
  },
```

**Step 2: Add imports and TEST_COMPONENTS entries in `page.tsx`**

Add 4 new imports (after existing `RhythmTest` import at line 21):

```typescript
import { IntervalRecognition } from '@/tools/human-benchmark/tests/interval-recognition'
import { ChordIdentification } from '@/tools/human-benchmark/tests/chord-identification'
import { ToneMemory } from '@/tools/human-benchmark/tests/tone-memory'
import { HigherOrLower } from '@/tools/human-benchmark/tests/higher-or-lower'
```

Add 4 new entries to the `TEST_COMPONENTS` map (after `'rhythm-test': RhythmTest`):

```typescript
  'interval-recognition': IntervalRecognition,
  'chord-identification': ChordIdentification,
  'tone-memory': ToneMemory,
  'higher-or-lower': HigherOrLower,
```

Update the comment from "12 test components" to "16 test components".

**Step 3: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm exec tsc --noEmit 2>&1 | head -20`
Expected: No errors

**Step 4: Commit**

```bash
git add tools/human-benchmark/constants.ts app/tools/human-benchmark/page.tsx
git commit -m "feat(human-benchmark): wire up 4 new audio tests in constants and page"
```

---

### Task 8: Browser verification

**Files:** None (testing only)

**Step 1: Start dev server**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev`

**Step 2: Verify dashboard**

- Navigate to `http://localhost:3000/tools/human-benchmark`
- Confirm 16 test cards are visible
- Confirm 4 new cards: Interval Recognition, Chord Identification, Tone Memory, Higher or Lower

**Step 3: Test each new game**

For each of the 4 new tests:
1. Click the card on the dashboard
2. Verify intro screen renders with correct title, emoji, and "Click to start"
3. Click to start
4. Verify audio plays (tones, intervals, chords, or tone pairs)
5. Verify answer buttons work
6. Verify feedback (green/red) appears
7. Verify game over screen shows level reached
8. Verify "Try Again" returns to intro

**Step 4: Commit any fixes if needed**
