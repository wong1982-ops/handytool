# Human Benchmark Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix Rhythm Test (name + revamp), add 4 audio games and 4 cognitive tests, bringing total from 12 to 20 tests.

**Architecture:** Each test follows the existing pattern: phase-based state machine, `TestComponentProps` interface, `GameCard` wrapper, localStorage scoring via `useTestScores`. Audio tests use Web Audio API. All tests use endless levels with 3 lives. New data files provide word lists, color definitions, equation generators, interval ratios, and chord structures.

**Tech Stack:** React 19, Next.js 16, TypeScript strict, Web Audio API, Tailwind CSS v4, requestAnimationFrame

**Reference:** Design doc at `docs/plans/2026-03-02-hb-enhancements-design.md`. Audio games detailed code at `docs/plans/2026-03-02-audio-games-plan.md`.

---

### Task 1: Update types and fix Rhythm Test name

**Files:**
- Modify: `tools/human-benchmark/types.ts:1-13`
- Modify: `tools/human-benchmark/constants.ts:327` (rhythm-test name)

**Step 1: Add 8 new TestId values to types.ts**

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
  | 'stroop-test'
  | 'quick-math'
  | 'word-scramble'
  | 'tracking-test'
```

**Step 2: Fix Rhythm Test name in constants.ts**

Change `name: 'Rhythm Test'` to `name: 'Rhythm'` (line ~328). The TestView component already appends " Test".

**Step 3: Also change the unit from `'%'` to `'level'` since we're switching to level-based scoring.**

**Step 4: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit 2>&1 | head -20`

**Step 5: Commit**

```bash
git add tools/human-benchmark/types.ts tools/human-benchmark/constants.ts
git commit -m "feat(human-benchmark): add 8 new TestIds, fix Rhythm Test name and scoring"
```

---

### Task 2: Create data files for all new tests

**Files:**
- Create: `tools/human-benchmark/data/intervals.ts`
- Create: `tools/human-benchmark/data/chords.ts`
- Create: `tools/human-benchmark/data/colors.ts`
- Create: `tools/human-benchmark/data/equations.ts`
- Create: `tools/human-benchmark/data/words.ts`
- Modify: `tools/human-benchmark/data/rhythms.ts`

**Step 1: Create `tools/human-benchmark/data/intervals.ts`**

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

export function semitoneRatio(semitones: number): number {
  return Math.pow(2, semitones / 12)
}

export function getIntervalsForLevel(level: number): IntervalInfo[] {
  if (level <= 3) return INTERVALS.filter((i) => i.difficulty === 1)
  if (level <= 6) return INTERVALS.filter((i) => i.difficulty <= 2)
  return INTERVALS
}
```

**Step 2: Create `tools/human-benchmark/data/chords.ts`**

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

export function getChordsForLevel(level: number): ChordInfo[] {
  if (level <= 3) return CHORDS.filter((c) => c.difficulty === 1)
  if (level <= 6) return CHORDS.filter((c) => c.difficulty <= 2)
  return CHORDS
}
```

**Step 3: Create `tools/human-benchmark/data/colors.ts`**

```typescript
export interface StroopColor {
  name: string
  hex: string
  tw: string // Tailwind text class
}

export const BASIC_COLORS: StroopColor[] = [
  { name: 'Red', hex: '#ef4444', tw: 'text-red-500' },
  { name: 'Blue', hex: '#3b82f6', tw: 'text-blue-500' },
  { name: 'Green', hex: '#22c55e', tw: 'text-green-500' },
  { name: 'Yellow', hex: '#eab308', tw: 'text-yellow-500' },
]

export const EXTENDED_COLORS: StroopColor[] = [
  ...BASIC_COLORS,
  { name: 'Purple', hex: '#a855f7', tw: 'text-purple-500' },
  { name: 'Orange', hex: '#f97316', tw: 'text-orange-500' },
]

export function getColorsForLevel(level: number): StroopColor[] {
  if (level <= 3) return BASIC_COLORS
  return EXTENDED_COLORS
}
```

**Step 4: Create `tools/human-benchmark/data/equations.ts`**

```typescript
export interface Equation {
  display: string
  answer: number
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateEquation(level: number): Equation {
  if (level <= 3) {
    // Addition only, 1-10
    const a = randInt(1, 10)
    const b = randInt(1, 10)
    return { display: `${a} + ${b}`, answer: a + b }
  }

  if (level <= 6) {
    // Add or subtract, 1-20
    const op = Math.random() < 0.5 ? '+' : '-'
    if (op === '+') {
      const a = randInt(1, 20)
      const b = randInt(1, 20)
      return { display: `${a} + ${b}`, answer: a + b }
    }
    const a = randInt(5, 25)
    const b = randInt(1, a) // ensure positive result
    return { display: `${a} - ${b}`, answer: a - b }
  }

  if (level <= 9) {
    // Add, subtract, multiply
    const opRoll = Math.random()
    if (opRoll < 0.33) {
      const a = randInt(5, 30)
      const b = randInt(5, 30)
      return { display: `${a} + ${b}`, answer: a + b }
    }
    if (opRoll < 0.66) {
      const a = randInt(10, 40)
      const b = randInt(1, a)
      return { display: `${a} - ${b}`, answer: a - b }
    }
    const a = randInt(2, 12)
    const b = randInt(2, 12)
    return { display: `${a} × ${b}`, answer: a * b }
  }

  // Level 10+: all operations including division
  const opRoll = Math.random()
  if (opRoll < 0.25) {
    const a = randInt(10, 50)
    const b = randInt(10, 50)
    return { display: `${a} + ${b}`, answer: a + b }
  }
  if (opRoll < 0.5) {
    const a = randInt(20, 60)
    const b = randInt(1, a)
    return { display: `${a} - ${b}`, answer: a - b }
  }
  if (opRoll < 0.75) {
    const a = randInt(3, 15)
    const b = randInt(3, 15)
    return { display: `${a} × ${b}`, answer: a * b }
  }
  // Division — ensure clean integer result
  const b = randInt(2, 12)
  const answer = randInt(2, 12)
  const a = b * answer
  return { display: `${a} ÷ ${b}`, answer }
}

export function generateDistractors(answer: number): number[] {
  const distractors = new Set<number>()
  while (distractors.size < 3) {
    const offset = randInt(1, Math.max(5, Math.abs(Math.floor(answer * 0.3))))
    const d = Math.random() < 0.5 ? answer + offset : answer - offset
    if (d !== answer && d >= 0) {
      distractors.add(d)
    }
  }
  return Array.from(distractors)
}

export function getTimeForLevel(level: number): number {
  if (level <= 3) return 5000
  if (level <= 6) return 4000
  if (level <= 9) return 4000
  return 3000
}
```

**Step 5: Create `tools/human-benchmark/data/words.ts`**

```typescript
export const WORDS_4: string[] = [
  'apple', 'house', 'water', 'light', 'stone', 'plant', 'music', 'dance',
  'beach', 'cloud', 'dream', 'flame', 'ghost', 'heart', 'judge', 'knife',
  'lemon', 'mouse', 'night', 'ocean', 'piano', 'queen', 'river', 'smile',
  'tiger', 'voice', 'world', 'youth', 'brain', 'chair', 'earth', 'grain',
]

export const WORDS_5: string[] = [
  'bridge', 'garden', 'planet', 'silver', 'orange', 'forest', 'castle',
  'desert', 'island', 'monkey', 'pencil', 'rabbit', 'simple', 'temple',
  'unique', 'violet', 'winter', 'bronze', 'candle', 'dinner', 'eleven',
  'frozen', 'gentle', 'hollow', 'insect', 'jungle', 'kitten', 'liquid',
  'marble', 'needle', 'oxygen', 'pepper', 'rocket', 'shadow', 'tunnel',
]

export const WORDS_6: string[] = [
  'circuit', 'journey', 'kitchen', 'mystery', 'organic', 'picture',
  'quality', 'rainbow', 'society', 'traffic', 'uniform', 'venture',
  'weather', 'ancient', 'balance', 'cabinet', 'diamond', 'eclipse',
  'fashion', 'glacier', 'harvest', 'impulse', 'lantern', 'machine',
  'network', 'opinion', 'pattern', 'quantum', 'refresh', 'shelter',
]

export const WORDS_7: string[] = [
  'elephant', 'discover', 'treasure', 'sandwich', 'champion', 'umbrella',
  'alphabet', 'building', 'calendar', 'december', 'envelope', 'firework',
  'geometry', 'harmonic', 'interact', 'keyboard', 'magnetic', 'notebook',
  'opposite', 'platform', 'resource', 'struggle', 'together', 'universe',
]

export function getWordsForLevel(level: number): string[] {
  if (level <= 3) return WORDS_4
  if (level <= 6) return WORDS_5
  if (level <= 9) return WORDS_6
  return WORDS_7
}

export function getTimeForLevel(level: number): number {
  if (level <= 3) return 15000
  if (level <= 6) return 12000
  if (level <= 9) return 10000
  return 8000
}

export function scrambleWord(word: string): string {
  const chars = word.split('')
  let scrambled: string
  // Ensure scrambled != original
  do {
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    scrambled = chars.join('')
  } while (scrambled === word)
  return scrambled
}
```

**Step 6: Add `generateRandomPattern` to `tools/human-benchmark/data/rhythms.ts`**

Add this function at the end of the existing file:

```typescript
export function generateRandomPattern(level: number): number[] {
  const beatCount = 4 + Math.floor(Math.min(level, 8) / 2)
  const baseTempo = Math.max(250, 600 - level * 30)
  const jitter = Math.min(0.4, 0.1 + level * 0.03)

  const beats: number[] = [0]
  for (let i = 1; i < beatCount; i++) {
    const variation = 1 + (Math.random() * 2 - 1) * jitter
    const gap = Math.max(150, baseTempo * variation)
    beats.push(Math.round(beats[i - 1] + gap))
  }
  return beats
}
```

**Step 7: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit 2>&1 | head -20`

**Step 8: Commit**

```bash
git add tools/human-benchmark/data/intervals.ts tools/human-benchmark/data/chords.ts tools/human-benchmark/data/colors.ts tools/human-benchmark/data/equations.ts tools/human-benchmark/data/words.ts tools/human-benchmark/data/rhythms.ts
git commit -m "feat(human-benchmark): add data files for 8 new tests and rhythm generation"
```

---

### Task 3: Add tips for all new tests

**Files:**
- Modify: `tools/human-benchmark/data/tips.ts`

**Step 1: Add 8 new entries before the closing `}`**

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
  'stroop-test': [
    'Focus on the color of the text, not the word itself — let your eyes see the color first',
    'Try squinting slightly to blur the text and make the color more dominant',
    'Build a mental routine: look, identify color, tap — do not read the word',
    'Speed comes with practice — your brain learns to suppress the automatic reading response',
    'If you feel confused, take a breath — rushing leads to reading the word instead of the color',
  ],
  'quick-math': [
    'For addition, look for combinations that make 10 (e.g., 7+3, 6+4)',
    'For subtraction, count up from the smaller number rather than counting down',
    'For multiplication, memorize times tables up to 12×12 — it pays off quickly',
    'Eliminate obviously wrong answers first to speed up your decision',
    'Stay calm under time pressure — panic slows down mental arithmetic',
  ],
  'word-scramble': [
    'Look for common letter patterns first: -tion, -ing, -ght, th-, sh-',
    'Try to identify vowels and consonants — most words alternate between them',
    'Start with the first and last letters — your brain can often fill in the middle',
    'Say the jumbled letters out loud — hearing them can trigger word recognition',
    'Common short words hide inside longer scrambles — look for them as anchors',
  ],
  'tracking-test': [
    'Keep your eyes on the target, not your cursor — your hand will follow naturally',
    'Anticipate direction changes rather than reacting after the target moves',
    'Use smooth, flowing movements instead of jerky corrections',
    'On mobile, use the tip of your finger for precision — avoid using the pad',
    'Relax your grip on the mouse — tense muscles reduce precision and speed',
  ],
```

**Step 2: Commit**

```bash
git add tools/human-benchmark/data/tips.ts
git commit -m "feat(human-benchmark): add tips for 8 new tests"
```

---

### Task 4: Revamp Rhythm Test component

**Files:**
- Modify: `tools/human-benchmark/tests/rhythm-test.tsx` (full rewrite)

**Step 1: Rewrite rhythm-test.tsx**

Replace entire file content. Key changes: endless levels with 3 lives, random pattern generation, level-based scoring, accuracy threshold (≥60%) to advance.

```tsx
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
  const rawScore = ((sumBeatScores - penalty) / originalBeats.length) * 100

  return Math.max(0, Math.min(100, rawScore))
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
    const accuracy = scoreRound(beats, userTaps)
    setLastAccuracy(Math.round(accuracy))
    const passed = accuracy >= 60

    setWasCorrect(passed)
    setPhase('feedback')

    if (passed) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startListening(nextLevel)
      }, 1000)
    } else {
      const newLives = lives - 1
      setLives(newLives)

      if (newLives <= 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setPhase('gameover')
          onComplete(level)
        }, 1000)
      } else {
        feedbackTimeoutRef.current = setTimeout(() => {
          startListening(level)
        }, 1000)
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

        {phase === 'feedback' && (
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-4" aria-hidden="true">
              {wasCorrect ? '✅' : '❌'}
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              {wasCorrect ? 'Nice rhythm!' : 'Off beat!'}
            </p>
            <p className="text-white/70 text-lg">Accuracy: {lastAccuracy}%</p>
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
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit 2>&1 | head -20`

**Step 3: Commit**

```bash
git add tools/human-benchmark/tests/rhythm-test.tsx
git commit -m "feat(human-benchmark): revamp Rhythm Test — endless levels, random patterns, 3 lives"
```

---

### Task 5: Create Interval Recognition test (PARALLEL with Tasks 6-11)

**Files:**
- Create: `tools/human-benchmark/tests/interval-recognition.tsx`

Full code is in `docs/plans/2026-03-02-audio-games-plan.md` Task 3. Copy that implementation exactly.

**Commit:** `git commit -m "feat(human-benchmark): add Interval Recognition test"`

---

### Task 6: Create Chord Identification test (PARALLEL)

**Files:**
- Create: `tools/human-benchmark/tests/chord-identification.tsx`

Full code is in `docs/plans/2026-03-02-audio-games-plan.md` Task 4. Copy that implementation exactly.

**Commit:** `git commit -m "feat(human-benchmark): add Chord Identification test"`

---

### Task 7: Create Tone Memory test (PARALLEL)

**Files:**
- Create: `tools/human-benchmark/tests/tone-memory.tsx`

Full code is in `docs/plans/2026-03-02-audio-games-plan.md` Task 5. Copy that implementation exactly.

**Commit:** `git commit -m "feat(human-benchmark): add Tone Memory test"`

---

### Task 8: Create Higher or Lower test (PARALLEL)

**Files:**
- Create: `tools/human-benchmark/tests/higher-or-lower.tsx`

Full code is in `docs/plans/2026-03-02-audio-games-plan.md` Task 6. Copy that implementation exactly.

**Commit:** `git commit -m "feat(human-benchmark): add Higher or Lower test"`

---

### Task 9: Create Stroop Test (PARALLEL)

**Files:**
- Create: `tools/human-benchmark/tests/stroop-test.tsx`

```tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { getColorsForLevel, type StroopColor } from '../data/colors'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getTimeForLevel(level: number): number {
  if (level <= 3) return 3000
  if (level <= 6) return 2000
  return 1500
}

function generateRound(level: number): {
  word: string
  inkColor: StroopColor
  options: StroopColor[]
} {
  const colors = getColorsForLevel(level)
  const inkColor = pickRandom(colors)
  // Word is always a different color name (creates the Stroop conflict)
  const otherColors = colors.filter((c) => c.name !== inkColor.name)
  const wordColor = pickRandom(otherColors)

  return {
    word: wordColor.name.toUpperCase(),
    inkColor,
    options: shuffleArray(colors).slice(0, 4),
  }
}

export function StroopTest({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [word, setWord] = useState('')
  const [inkColor, setInkColor] = useState<StroopColor | null>(null)
  const [options, setOptions] = useState<StroopColor[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100) // percentage

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartRef = useRef(0)
  const timeLimitRef = useRef(3000)

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleWrong = useCallback((lvl: number, livesLeft: number) => {
    stopTimer()
    setWasCorrect(false)
    setPhase('feedback')
    const newLives = livesLeft - 1
    setLives(newLives)

    if (newLives <= 0) {
      feedbackTimeoutRef.current = setTimeout(() => {
        setPhase('gameover')
        onComplete(lvl)
      }, 800)
    } else {
      feedbackTimeoutRef.current = setTimeout(() => {
        startRound(lvl, newLives)
      }, 800)
    }
  }, [stopTimer, onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives?: number) => {
    const round = generateRound(lvl)
    setWord(round.word)
    setInkColor(round.inkColor)
    setOptions(round.options)
    setSelectedName(null)
    setWasCorrect(false)
    setTimeLeft(100)
    setPhase('playing')

    const timeLimit = getTimeForLevel(lvl)
    timeLimitRef.current = timeLimit
    timerStartRef.current = performance.now()

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - timerStartRef.current
      const remaining = Math.max(0, 100 - (elapsed / timeLimit) * 100)
      setTimeLeft(remaining)

      if (remaining <= 0) {
        handleWrong(lvl, currentLives ?? 3)
      }
    }, 50)
  }, [handleWrong])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleAnswer = useCallback((color: StroopColor) => {
    if (phase !== 'playing' || !inkColor) return
    stopTimer()

    const isCorrect = color.name === inkColor.name
    setSelectedName(color.name)
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel, lives)
      }, 600)
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
          startRound(level, newLives)
        }, 800)
      }
    }
  }, [phase, inkColor, level, lives, stopTimer, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#f97316'
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

  const getButtonStyle = (color: StroopColor) => {
    if (phase !== 'feedback') {
      return 'hover:ring-2 hover:ring-white/50'
    }
    if (color.name === inkColor?.name) {
      return 'ring-2 ring-white scale-105'
    }
    if (color.name === selectedName) {
      return 'ring-2 ring-red-400 opacity-50'
    }
    return 'opacity-30'
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
            aria-label="Start Stroop test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">👁️</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Stroop</p>
            <p className="text-white/70 text-lg mb-2">Name the INK COLOR, not the word!</p>
            <p className="text-white/50 text-sm mb-4">The word says one color but is written in another</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && inkColor && (
          <div className="text-center text-white px-6 w-full">
            {/* Timer bar */}
            <div className="w-full max-w-[320px] mx-auto h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${timeLeft}%` }}
              />
            </div>

            <p className="text-white/60 text-sm mb-4">What COLOR is the text?</p>

            {/* The Stroop word */}
            <p
              className="text-5xl md:text-6xl font-black mb-8"
              style={{ color: inkColor.hex }}
            >
              {word}
            </p>

            {/* Color buttons */}
            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleAnswer(color)}
                  className={`rounded-xl min-h-[56px] font-bold text-lg text-white transition-all ${getButtonStyle(color)}`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Select ${color.name}`}
                >
                  {color.name}
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
            <p className="text-2xl md:text-3xl font-bold mb-4">
              {wasCorrect ? 'Correct!' : `It was ${inkColor?.name}`}
            </p>
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

**Commit:** `git commit -m "feat(human-benchmark): add Stroop test"`

---

### Task 10: Create Quick Math test (PARALLEL)

**Files:**
- Create: `tools/human-benchmark/tests/quick-math.tsx`

```tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import {
  generateEquation,
  generateDistractors,
  getTimeForLevel as getMathTime,
} from '../data/equations'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function QuickMath({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [equation, setEquation] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [options, setOptions] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100)

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartRef = useRef(0)

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleWrongAnswer = useCallback((lvl: number, currentLives: number) => {
    stopTimer()
    setWasCorrect(false)
    setPhase('feedback')
    const newLives = currentLives - 1
    setLives(newLives)

    if (newLives <= 0) {
      feedbackTimeoutRef.current = setTimeout(() => {
        setPhase('gameover')
        onComplete(lvl)
      }, 800)
    } else {
      feedbackTimeoutRef.current = setTimeout(() => {
        startRound(lvl, newLives)
      }, 800)
    }
  }, [stopTimer, onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives?: number) => {
    const eq = generateEquation(lvl)
    const distractors = generateDistractors(eq.answer)
    setEquation(eq.display)
    setCorrectAnswer(eq.answer)
    setOptions(shuffleArray([eq.answer, ...distractors]))
    setSelectedAnswer(null)
    setWasCorrect(false)
    setTimeLeft(100)
    setPhase('playing')

    const timeLimit = getMathTime(lvl)
    timerStartRef.current = performance.now()

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - timerStartRef.current
      const remaining = Math.max(0, 100 - (elapsed / timeLimit) * 100)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        handleWrongAnswer(lvl, currentLives ?? 3)
      }
    }, 50)
  }, [handleWrongAnswer])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleAnswer = useCallback((answer: number) => {
    if (phase !== 'playing') return
    stopTimer()

    const isCorrect = answer === correctAnswer
    setSelectedAnswer(answer)
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel, lives)
      }, 600)
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
          startRound(level, newLives)
        }, 800)
      }
    }
  }, [phase, correctAnswer, level, lives, stopTimer, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#6366f1'
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

  const getButtonStyle = (answer: number) => {
    if (phase !== 'feedback') {
      return 'bg-white/20 hover:bg-white/30 text-white'
    }
    if (answer === correctAnswer) {
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
            aria-label="Start Quick Math test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🔢</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Quick Math</p>
            <p className="text-white/70 text-lg mb-2">Solve equations as fast as you can</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-6 w-full">
            <div className="w-full max-w-[320px] mx-auto h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${timeLeft}%` }}
              />
            </div>

            <p className="text-4xl md:text-5xl font-black mb-8">
              {equation} = ?
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`rounded-xl text-xl font-bold min-h-[56px] transition-colors ${getButtonStyle(opt)}`}
                >
                  {opt}
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
            <p className="text-2xl md:text-3xl font-bold mb-4">
              {wasCorrect ? 'Correct!' : `${equation} = ${correctAnswer}`}
            </p>
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

**Commit:** `git commit -m "feat(human-benchmark): add Quick Math test"`

---

### Task 11: Create Word Scramble test (PARALLEL)

**Files:**
- Create: `tools/human-benchmark/tests/word-scramble.tsx`

```tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import {
  getWordsForLevel,
  getTimeForLevel as getWordTime,
  scrambleWord,
} from '../data/words'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function WordScramble({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [scrambled, setScrambled] = useState('')
  const [answer, setAnswer] = useState('')
  const [userInput, setUserInput] = useState('')
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartRef = useRef(0)
  const usedWordsRef = useRef(new Set<string>())

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleWrongAnswer = useCallback((lvl: number, currentLives: number) => {
    stopTimer()
    setWasCorrect(false)
    setPhase('feedback')
    const newLives = currentLives - 1
    setLives(newLives)

    if (newLives <= 0) {
      feedbackTimeoutRef.current = setTimeout(() => {
        setPhase('gameover')
        onComplete(lvl)
      }, 1200)
    } else {
      feedbackTimeoutRef.current = setTimeout(() => {
        startRound(lvl, newLives)
      }, 1200)
    }
  }, [stopTimer, onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives?: number) => {
    const pool = getWordsForLevel(lvl)
    // Avoid repeating words
    let word: string
    let attempts = 0
    do {
      word = pickRandom(pool)
      attempts++
    } while (usedWordsRef.current.has(word) && attempts < 20)
    usedWordsRef.current.add(word)

    setAnswer(word)
    setScrambled(scrambleWord(word).toUpperCase())
    setUserInput('')
    setWasCorrect(false)
    setTimeLeft(100)
    setPhase('playing')

    const timeLimit = getWordTime(lvl)
    timerStartRef.current = performance.now()

    timerRef.current = setInterval(() => {
      const elapsed = performance.now() - timerStartRef.current
      const remaining = Math.max(0, 100 - (elapsed / timeLimit) * 100)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        handleWrongAnswer(lvl, currentLives ?? 3)
      }
    }, 50)

    setTimeout(() => inputRef.current?.focus(), 100)
  }, [handleWrongAnswer])

  const handleStart = useCallback(() => {
    usedWordsRef.current.clear()
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleSubmit = useCallback(() => {
    if (phase !== 'playing') return
    stopTimer()

    const isCorrect = userInput.toLowerCase().trim() === answer.toLowerCase()
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel, lives)
      }, 800)
    } else {
      const newLives = lives - 1
      setLives(newLives)

      if (newLives <= 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setPhase('gameover')
          onComplete(level)
        }, 1200)
      } else {
        feedbackTimeoutRef.current = setTimeout(() => {
          startRound(level, newLives)
        }, 1200)
      }
    }
  }, [phase, userInput, answer, level, lives, stopTimer, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    stopTimer()
    setPhase('intro')
  }, [stopTimer])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#a855f7'
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
            aria-label="Start Word Scramble test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🔤</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Word Scramble</p>
            <p className="text-white/70 text-lg mb-2">Unscramble the jumbled word</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="text-center text-white px-6 w-full">
            <div className="w-full max-w-[320px] mx-auto h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${timeLeft}%` }}
              />
            </div>

            <p className="text-4xl md:text-5xl font-black mb-8 tracking-widest">
              {scrambled}
            </p>

            <div className="max-w-[280px] mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                className="w-full bg-white/20 border-2 border-white/30 rounded-xl px-4 py-3 text-center text-xl font-bold text-white placeholder-white/40 focus:outline-none focus:border-white/60"
                placeholder="Type the word..."
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button
                onClick={handleSubmit}
                className="mt-4 w-full px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-4" aria-hidden="true">
              {wasCorrect ? '✅' : '❌'}
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              {wasCorrect ? 'Correct!' : `It was "${answer}"`}
            </p>
            <p className="text-white/60 text-lg">{scrambled}</p>
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

**Commit:** `git commit -m "feat(human-benchmark): add Word Scramble test"`

---

### Task 12: Create Tracking Test (PARALLEL)

**Files:**
- Create: `tools/human-benchmark/tests/tracking-test.tsx`

```tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

const ROUND_DURATION = 10000 // 10 seconds
const TARGET_RADIUS = 18

function getSpeedForLevel(level: number): number {
  return Math.min(1.5 + level * 0.5, 8)
}

export function TrackingTest({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [targetX, setTargetX] = useState(50)
  const [targetY, setTargetY] = useState(50)
  const [isOnTarget, setIsOnTarget] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [timeLeft, setTimeLeft] = useState(100)

  const areaRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Movement state stored in refs for animation loop
  const posRef = useRef({ x: 50, y: 50 })
  const velRef = useRef({ x: 1, y: 0.8 })
  const mouseRef = useRef({ x: -1, y: -1 })
  const framesOnRef = useRef(0)
  const totalFramesRef = useRef(0)
  const startTimeRef = useRef(0)

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])

  const endRound = useCallback((lvl: number, currentLives: number) => {
    cancelAnimationFrame(animFrameRef.current)
    const total = totalFramesRef.current
    const on = framesOnRef.current
    const acc = total > 0 ? Math.round((on / total) * 100) : 0
    setAccuracy(acc)

    const passed = acc >= 50
    setWasCorrect(passed)
    setPhase('feedback')

    if (passed) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = lvl + 1
        setLevel(nextLevel)
        startRound(nextLevel, currentLives)
      }, 1000)
    } else {
      const newLives = currentLives - 1
      setLives(newLives)

      if (newLives <= 0) {
        feedbackTimeoutRef.current = setTimeout(() => {
          setPhase('gameover')
          onComplete(lvl)
        }, 1000)
      } else {
        feedbackTimeoutRef.current = setTimeout(() => {
          startRound(lvl, newLives)
        }, 1000)
      }
    }
  }, [onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback((lvl: number, currentLives: number) => {
    cancelAnimationFrame(animFrameRef.current)

    const speed = getSpeedForLevel(lvl)
    const angle = Math.random() * Math.PI * 2
    posRef.current = { x: 50, y: 50 }
    velRef.current = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }
    mouseRef.current = { x: -1, y: -1 }
    framesOnRef.current = 0
    totalFramesRef.current = 0
    startTimeRef.current = performance.now()

    setTargetX(50)
    setTargetY(50)
    setIsOnTarget(false)
    setTimeLeft(100)
    setPhase('playing')

    // Direction change interval gets shorter with level
    const dirChangeInterval = Math.max(400, 2000 - lvl * 150)
    let lastDirChange = performance.now()

    const loop = () => {
      const now = performance.now()
      const elapsed = now - startTimeRef.current

      if (elapsed >= ROUND_DURATION) {
        endRound(lvl, currentLives)
        return
      }

      setTimeLeft(Math.max(0, 100 - (elapsed / ROUND_DURATION) * 100))

      // Random direction changes
      if (now - lastDirChange > dirChangeInterval) {
        const newAngle = Math.random() * Math.PI * 2
        velRef.current = {
          x: Math.cos(newAngle) * speed,
          y: Math.sin(newAngle) * speed,
        }
        lastDirChange = now
      }

      // Move target
      let { x, y } = posRef.current
      const { x: vx, y: vy } = velRef.current

      x += vx
      y += vy

      // Bounce off walls (5% margin)
      if (x < 5 || x > 95) {
        velRef.current.x *= -1
        x = Math.max(5, Math.min(95, x))
      }
      if (y < 5 || y > 95) {
        velRef.current.y *= -1
        y = Math.max(5, Math.min(95, y))
      }

      posRef.current = { x, y }
      setTargetX(x)
      setTargetY(y)

      // Check if cursor is on target
      totalFramesRef.current++
      if (areaRef.current && mouseRef.current.x >= 0) {
        const rect = areaRef.current.getBoundingClientRect()
        const targetPxX = (x / 100) * rect.width
        const targetPxY = (y / 100) * rect.height
        const dx = mouseRef.current.x - targetPxX
        const dy = mouseRef.current.y - targetPxY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const onTarget = dist <= TARGET_RADIUS + 5
        if (onTarget) framesOnRef.current++
        setIsOnTarget(onTarget)
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
  }, [endRound])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!areaRef.current) return
    const rect = areaRef.current.getBoundingClientRect()
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!areaRef.current || e.touches.length === 0) return
    const rect = areaRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1, 3)
  }, [startRound])

  const handleTryAgain = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro':
      case 'playing':
        return '#ef4444'
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
            aria-label="Start Tracking test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎯</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Tracking</p>
            <p className="text-white/70 text-lg mb-2">Keep your cursor on the moving target</p>
            <p className="text-white/50 text-sm mb-4">Need 50%+ time on target to advance</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {phase === 'playing' && (
          <div className="w-full h-full flex flex-col px-4 py-4">
            {/* Timer bar */}
            <div className="w-full h-2 bg-white/20 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${timeLeft}%` }}
              />
            </div>

            {/* Tracking area */}
            <div
              ref={areaRef}
              className="flex-1 relative bg-white/10 rounded-xl overflow-hidden cursor-none"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              aria-label="Tracking area — follow the target with your cursor"
            >
              {/* Target */}
              <div
                className={`absolute rounded-full transition-colors duration-100 ${
                  isOnTarget ? 'bg-green-400' : 'bg-white'
                }`}
                style={{
                  width: TARGET_RADIUS * 2,
                  height: TARGET_RADIUS * 2,
                  left: `${targetX}%`,
                  top: `${targetY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[2px] h-full bg-black/30" />
                  <div className="absolute w-full h-[2px] bg-black/30" />
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="text-center text-white px-6">
            <div className="text-4xl mb-4" aria-hidden="true">
              {wasCorrect ? '✅' : '❌'}
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              {wasCorrect ? 'On target!' : 'Too slow!'}
            </p>
            <p className="text-white/70 text-lg">Accuracy: {accuracy}%</p>
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

**Commit:** `git commit -m "feat(human-benchmark): add Tracking test"`

---

### Task 13: Wire up all 8 new tests in constants.ts and page.tsx

**Files:**
- Modify: `tools/human-benchmark/constants.ts` (add 8 TEST_CONFIGS entries)
- Modify: `app/tools/human-benchmark/page.tsx` (add 8 imports + TEST_COMPONENTS entries)

**Step 1: Add 8 new TEST_CONFIGS to `constants.ts`**

Add after the existing rhythm-test config (before closing `]`):

```typescript
  {
    id: 'interval-recognition',
    name: 'Interval Recognition',
    description: 'Hear two notes and identify the musical interval between them.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-9L16.5 3m0 0L12 7.5m4.5-4.5v13.5' })),
    iconBg: 'bg-teal-900/30', iconColor: 'text-teal-400', iconBgLight: 'bg-teal-100', iconColorLight: 'text-teal-600',
    gameBgColor: '#14b8a6', unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'chord-identification',
    name: 'Chord Identification',
    description: 'Listen to a chord and identify whether it is major, minor, or another type.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'm9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z' })),
    iconBg: 'bg-pink-900/30', iconColor: 'text-pink-400', iconBgLight: 'bg-pink-100', iconColorLight: 'text-pink-600',
    gameBgColor: '#ec4899', unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'tone-memory',
    name: 'Tone Memory',
    description: 'Remember an ever-growing sequence of tones and play them back in order.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z' })),
    iconBg: 'bg-emerald-900/30', iconColor: 'text-emerald-400', iconBgLight: 'bg-emerald-100', iconColorLight: 'text-emerald-600',
    gameBgColor: '#10b981', unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'higher-or-lower',
    name: 'Higher or Lower',
    description: 'Hear two tones and decide which one was higher in pitch.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-4.5L16.5 21m0 0L12 16.5m4.5 4.5V7.5' })),
    iconBg: 'bg-sky-900/30', iconColor: 'text-sky-400', iconBgLight: 'bg-sky-100', iconColorLight: 'text-sky-600',
    gameBgColor: '#0ea5e9', unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'stroop-test',
    name: 'Stroop',
    description: 'Name the ink color of the word, not the word itself.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z' }),
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' })),
    iconBg: 'bg-orange-900/30', iconColor: 'text-orange-400', iconBgLight: 'bg-orange-100', iconColorLight: 'text-orange-600',
    gameBgColor: '#f97316', unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'quick-math',
    name: 'Quick Math',
    description: 'Solve arithmetic equations as fast as you can.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.25-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H12.75v-.008Zm0 2.25h.008v.008H12.75v-.008Zm2.25-2.25h.008v.008H15v-.008Zm0 2.25h.008v.008H15v-.008ZM8.25 6h7.5v2.25h-7.5V6ZM6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75A2.25 2.25 0 0 0 15.75 1.5h-7.5A2.25 2.25 0 0 0 6 3.75Z' })),
    iconBg: 'bg-indigo-900/30', iconColor: 'text-indigo-400', iconBgLight: 'bg-indigo-100', iconColorLight: 'text-indigo-600',
    gameBgColor: '#6366f1', unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble the jumbled letters to find the hidden word.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' })),
    iconBg: 'bg-purple-900/30', iconColor: 'text-purple-400', iconBgLight: 'bg-purple-100', iconColorLight: 'text-purple-600',
    gameBgColor: '#a855f7', unit: 'level', lowerIsBetter: false,
  },
  {
    id: 'tracking-test',
    name: 'Tracking',
    description: 'Keep your cursor on a moving target as it gets faster and more erratic.',
    icon: React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5' })),
    iconBg: 'bg-red-900/30', iconColor: 'text-red-400', iconBgLight: 'bg-red-100', iconColorLight: 'text-red-600',
    gameBgColor: '#ef4444', unit: 'level', lowerIsBetter: false,
  },
```

**Step 2: Add imports and TEST_COMPONENTS entries in `page.tsx`**

Add 8 new imports:

```typescript
import { IntervalRecognition } from '@/tools/human-benchmark/tests/interval-recognition'
import { ChordIdentification } from '@/tools/human-benchmark/tests/chord-identification'
import { ToneMemory } from '@/tools/human-benchmark/tests/tone-memory'
import { HigherOrLower } from '@/tools/human-benchmark/tests/higher-or-lower'
import { StroopTest } from '@/tools/human-benchmark/tests/stroop-test'
import { QuickMath } from '@/tools/human-benchmark/tests/quick-math'
import { WordScramble } from '@/tools/human-benchmark/tests/word-scramble'
import { TrackingTest } from '@/tools/human-benchmark/tests/tracking-test'
```

Add to `TEST_COMPONENTS`:

```typescript
  'interval-recognition': IntervalRecognition,
  'chord-identification': ChordIdentification,
  'tone-memory': ToneMemory,
  'higher-or-lower': HigherOrLower,
  'stroop-test': StroopTest,
  'quick-math': QuickMath,
  'word-scramble': WordScramble,
  'tracking-test': TrackingTest,
```

Update comment: "Import all 20 test components"

**Step 3: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit 2>&1 | head -20`

**Step 4: Commit**

```bash
git add tools/human-benchmark/constants.ts app/tools/human-benchmark/page.tsx
git commit -m "feat(human-benchmark): wire up 8 new tests in constants and page (20 total)"
```

---

### Task 14: Browser verification

**Step 1: Start dev server and verify dashboard shows 20 tests**
**Step 2: Test each new game (click, play, verify phases)**
**Step 3: Test Rhythm Test revamp (endless levels, random patterns)**
**Step 4: Fix any issues found**
