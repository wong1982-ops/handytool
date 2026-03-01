# Human Benchmark — 4 New Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4 new cognitive tests (Pitch Identification, Mental Rotation, Schulte Grid, Rhythm Test) to the existing Human Benchmark tool, bringing total from 8 to 12 tests.

**Architecture:** Each test follows the existing pattern: a React component accepting `TestComponentProps`, using phase-based state machines, wrapped in `GameCard`. Data files go in `tools/human-benchmark/data/`. Config, types, and tips are extended in existing files.

**Tech Stack:** React 19, TypeScript, Web Audio API (for pitch + rhythm tests), SVG (for mental rotation shapes), `performance.now()` (for Schulte Grid timer)

**Design Doc:** `docs/plans/2026-03-01-human-benchmark-4-new-tests-design.md`

---

## Task 1: Extend Types and Config (Foundation)

**Files:**
- Modify: `tools/human-benchmark/types.ts`
- Modify: `tools/human-benchmark/constants.ts`

**Step 1: Add 4 new test IDs to the TestId union type**

In `tools/human-benchmark/types.ts`, replace the `TestId` type:

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
```

**Step 2: Add 4 new test configs to constants.ts**

Append these 4 entries to the `TEST_CONFIGS` array in `tools/human-benchmark/constants.ts` (after the `typing` entry, before the closing `]`):

```typescript
  {
    id: 'pitch-identification',
    name: 'Pitch Identification',
    description: 'Test your ear by identifying musical tones played at different frequencies.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'm9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z' }),
    ),
    iconBg: 'bg-amber-900/30',
    iconColor: 'text-amber-400',
    iconBgLight: 'bg-amber-100',
    iconColorLight: 'text-amber-600',
    gameBgColor: '#f59e0b',
    unit: 'level',
    lowerIsBetter: false,
  },
  {
    id: 'mental-rotation',
    name: 'Mental Rotation',
    description: 'Identify which shape is a rotation of the original — not a mirror image.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'm21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25' }),
    ),
    iconBg: 'bg-cyan-900/30',
    iconColor: 'text-cyan-400',
    iconBgLight: 'bg-cyan-100',
    iconColorLight: 'text-cyan-600',
    gameBgColor: '#06b6d4',
    unit: 'level',
    lowerIsBetter: false,
  },
  {
    id: 'schulte-grid',
    name: 'Schulte Grid',
    description: 'Find numbers 1 to 25 in order on a shuffled 5×5 grid as fast as you can.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12h2.25m-2.25 0c-.621 0-1.125.504-1.125 1.125M13.125 12c.621 0 1.125.504 1.125 1.125m-2.25 0v1.5c0 .621.504 1.125 1.125 1.125m-2.25-2.625c0 .621-.504 1.125-1.125 1.125H3.375m0 0h7.5' }),
    ),
    iconBg: 'bg-rose-900/30',
    iconColor: 'text-rose-400',
    iconBgLight: 'bg-rose-100',
    iconColorLight: 'text-rose-600',
    gameBgColor: '#f43f5e',
    unit: 's',
    lowerIsBetter: true,
  },
  {
    id: 'rhythm-test',
    name: 'Rhythm Test',
    description: 'Listen to a rhythm pattern, then tap it back as accurately as you can.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z' }),
    ),
    iconBg: 'bg-violet-900/30',
    iconColor: 'text-violet-400',
    iconBgLight: 'bg-violet-100',
    iconColorLight: 'text-violet-600',
    gameBgColor: '#8b5cf6',
    unit: '%',
    lowerIsBetter: false,
  },
```

**Step 3: Verify build**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit 2>&1 | head -20`

Expected: No new errors related to the type changes (page.tsx will error because TEST_COMPONENTS doesn't have the new IDs yet — that's expected and fixed in later tasks).

**Step 4: Commit**

```bash
git add tools/human-benchmark/types.ts tools/human-benchmark/constants.ts
git commit -m "feat(human-benchmark): add types and configs for 4 new tests"
```

---

## Task 2: Create Data Files

**Files:**
- Create: `tools/human-benchmark/data/notes.ts`
- Create: `tools/human-benchmark/data/shapes.ts`
- Create: `tools/human-benchmark/data/rhythms.ts`

**Step 1: Create notes.ts — frequency map for Pitch Identification**

Create `tools/human-benchmark/data/notes.ts`:

```typescript
export interface NoteInfo {
  name: string
  frequency: number
  octave: number
}

// Standard equal temperament tuning, A4 = 440Hz
export const NOTES: NoteInfo[] = [
  { name: 'C3', frequency: 130.81, octave: 3 },
  { name: 'D3', frequency: 146.83, octave: 3 },
  { name: 'E3', frequency: 164.81, octave: 3 },
  { name: 'F3', frequency: 174.61, octave: 3 },
  { name: 'G3', frequency: 196.00, octave: 3 },
  { name: 'A3', frequency: 220.00, octave: 3 },
  { name: 'B3', frequency: 246.94, octave: 3 },
  { name: 'C4', frequency: 261.63, octave: 4 },
  { name: 'C#4', frequency: 277.18, octave: 4 },
  { name: 'D4', frequency: 293.66, octave: 4 },
  { name: 'D#4', frequency: 311.13, octave: 4 },
  { name: 'E4', frequency: 329.63, octave: 4 },
  { name: 'F4', frequency: 349.23, octave: 4 },
  { name: 'F#4', frequency: 369.99, octave: 4 },
  { name: 'G4', frequency: 392.00, octave: 4 },
  { name: 'G#4', frequency: 415.30, octave: 4 },
  { name: 'A4', frequency: 440.00, octave: 4 },
  { name: 'A#4', frequency: 466.16, octave: 4 },
  { name: 'B4', frequency: 493.88, octave: 4 },
  { name: 'C5', frequency: 523.25, octave: 5 },
  { name: 'D5', frequency: 587.33, octave: 5 },
  { name: 'E5', frequency: 659.25, octave: 5 },
  { name: 'F5', frequency: 698.46, octave: 5 },
  { name: 'G5', frequency: 783.99, octave: 5 },
  { name: 'A5', frequency: 880.00, octave: 5 },
  { name: 'B5', frequency: 987.77, octave: 5 },
  { name: 'C6', frequency: 1046.50, octave: 6 },
]

// Difficulty pools: which notes can appear as options per level range
// Easy (levels 1-3): widely spaced natural notes
export const EASY_NOTES = NOTES.filter(n =>
  ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'].includes(n.name)
)

// Medium (levels 4-6): all natural notes in octave 4
export const MEDIUM_NOTES = NOTES.filter(n =>
  n.octave === 4 && !n.name.includes('#')
)

// Hard (levels 7+): all chromatic notes in octave 4
export const HARD_NOTES = NOTES.filter(n => n.octave === 4)
```

**Step 2: Create shapes.ts — SVG shape data for Mental Rotation**

Create `tools/human-benchmark/data/shapes.ts`:

```typescript
export interface ShapeData {
  id: string
  points: [number, number][]  // polygon vertices as [x, y] pairs, centered on 50,50
  difficulty: 1 | 2 | 3
}

// Shapes are defined as polygons centered on (50, 50) in a 100x100 viewbox.
// Using point arrays instead of SVG path strings for easier rotation/mirror transforms.
export const SHAPES: ShapeData[] = [
  // Difficulty 1: Simple, distinctive shapes
  { id: 'L', difficulty: 1, points: [[25,20],[45,20],[45,50],[65,50],[65,70],[25,70]] },
  { id: 'T', difficulty: 1, points: [[20,25],[80,25],[80,45],[60,45],[60,75],[40,75],[40,45],[20,45]] },
  { id: 'arrow', difficulty: 1, points: [[50,15],[75,45],[60,45],[60,85],[40,85],[40,45],[25,45]] },
  { id: 'zigzag', difficulty: 1, points: [[20,25],[50,25],[50,45],[70,45],[70,75],[40,75],[40,55],[20,55]] },
  { id: 'hook', difficulty: 1, points: [[30,20],[50,20],[50,55],[70,55],[70,75],[30,75],[30,55],[30,55]] },

  // Difficulty 2: More complex, harder to distinguish rotation from mirror
  { id: 'pentagon-cut', difficulty: 2, points: [[50,15],[78,35],[68,70],[32,70],[22,35]] },
  { id: 'chevron', difficulty: 2, points: [[20,30],[50,15],[80,30],[80,50],[50,35],[20,50]] },
  { id: 'stairs', difficulty: 2, points: [[20,20],[40,20],[40,40],[60,40],[60,60],[80,60],[80,80],[20,80]] },
  { id: 'flag', difficulty: 2, points: [[25,15],[70,15],[75,40],[55,35],[55,85],[25,85]] },
  { id: 'cross-cut', difficulty: 2, points: [[35,15],[65,15],[65,35],[85,35],[85,65],[65,65],[65,85],[35,85],[35,65],[15,65],[15,35],[35,35]] },

  // Difficulty 3: Complex asymmetric polygons
  { id: 'complex-a', difficulty: 3, points: [[30,10],[70,15],[85,40],[75,70],[55,85],[25,75],[15,45]] },
  { id: 'complex-b', difficulty: 3, points: [[45,10],[75,20],[85,50],[70,80],[40,85],[15,65],[20,30]] },
  { id: 'complex-c', difficulty: 3, points: [[50,10],[80,25],[85,55],[65,80],[35,85],[15,60],[20,25],[40,15]] },
  { id: 'complex-d', difficulty: 3, points: [[40,10],[65,15],[80,35],[75,60],[85,80],[50,85],[20,70],[15,40]] },
  { id: 'complex-e', difficulty: 3, points: [[55,10],[80,20],[85,50],[75,75],[45,85],[20,75],[10,45],[25,20]] },
]

/**
 * Rotate polygon points by angle (degrees) around center (50, 50)
 */
export function rotatePoints(points: [number, number][], angleDeg: number): [number, number][] {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return points.map(([x, y]) => {
    const dx = x - 50
    const dy = y - 50
    return [50 + dx * cos - dy * sin, 50 + dx * sin + dy * cos]
  })
}

/**
 * Mirror polygon points horizontally around x=50
 */
export function mirrorPoints(points: [number, number][]): [number, number][] {
  return points.map(([x, y]) => [100 - x, y])
}

/**
 * Convert points array to SVG polygon points string
 */
export function pointsToSvg(points: [number, number][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}
```

**Step 3: Create rhythms.ts — beat patterns for Rhythm Test**

Create `tools/human-benchmark/data/rhythms.ts`:

```typescript
export interface RhythmPattern {
  name: string
  beats: number[]       // timestamps in ms relative to start
  difficulty: 'easy' | 'medium' | 'hard'
}

export const RHYTHM_PATTERNS: RhythmPattern[] = [
  // Easy: 4 beats, even quarter-note spacing
  { name: 'Steady Four', difficulty: 'easy', beats: [0, 500, 1000, 1500] },
  { name: 'Slow March', difficulty: 'easy', beats: [0, 600, 1200, 1800] },
  { name: 'Quick Pulse', difficulty: 'easy', beats: [0, 400, 800, 1200] },
  { name: 'Wide Four', difficulty: 'easy', beats: [0, 700, 1400, 2100] },
  { name: 'Standard Beat', difficulty: 'easy', beats: [0, 500, 1000, 1500] },

  // Medium: 6 beats, mixed quarter + eighth note spacing
  { name: 'Swing Feel', difficulty: 'medium', beats: [0, 500, 750, 1250, 1500, 2000] },
  { name: 'Gallop', difficulty: 'medium', beats: [0, 250, 500, 1000, 1250, 1500] },
  { name: 'Shuffle', difficulty: 'medium', beats: [0, 333, 666, 1000, 1500, 2000] },
  { name: 'Dotted Rhythm', difficulty: 'medium', beats: [0, 750, 1000, 1750, 2000, 2500] },
  { name: 'Push Beat', difficulty: 'medium', beats: [0, 500, 1000, 1250, 1750, 2250] },

  // Hard: 8 beats, syncopated/triplet patterns
  { name: 'Syncopated', difficulty: 'hard', beats: [0, 250, 750, 1000, 1500, 1750, 2000, 2500] },
  { name: 'Triplet Flow', difficulty: 'hard', beats: [0, 333, 666, 1000, 1333, 1666, 2000, 2500] },
  { name: 'Complex Groove', difficulty: 'hard', beats: [0, 200, 500, 750, 1000, 1400, 1700, 2000] },
  { name: 'Off-Beat', difficulty: 'hard', beats: [0, 250, 500, 1000, 1250, 1500, 2000, 2250] },
  { name: 'Jazz Pattern', difficulty: 'hard', beats: [0, 375, 750, 1000, 1375, 1500, 1875, 2250] },
]

export function getPatternsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): RhythmPattern[] {
  return RHYTHM_PATTERNS.filter(p => p.difficulty === difficulty)
}

export function getRandomPattern(difficulty: 'easy' | 'medium' | 'hard'): RhythmPattern {
  const patterns = getPatternsByDifficulty(difficulty)
  return patterns[Math.floor(Math.random() * patterns.length)]
}
```

**Step 4: Commit**

```bash
git add tools/human-benchmark/data/notes.ts tools/human-benchmark/data/shapes.ts tools/human-benchmark/data/rhythms.ts
git commit -m "feat(human-benchmark): add data files for pitch, shapes, and rhythm tests"
```

---

## Task 3: Add Tips for New Tests

**Files:**
- Modify: `tools/human-benchmark/data/tips.ts`

**Step 1: Add 4 new tip entries**

Append these 4 entries to the `TEST_TIPS` object in `tools/human-benchmark/data/tips.ts`:

```typescript
  'pitch-identification': [
    'Use headphones for clearer sound — speakers can distort subtle pitch differences',
    'Hum along with the tone to better internalize the pitch before answering',
    'Learn the reference pitch A4 (440Hz) — it helps anchor other notes',
    'Listen for the "brightness" or "darkness" of a tone rather than trying to name it instantly',
    'Practice with a piano or tuner app to train your ear between sessions',
  ],
  'mental-rotation': [
    'Focus on one distinctive feature of the shape (a corner or notch) and trace where it moves',
    'Mentally rotate the shape in small increments rather than trying to visualize the full rotation at once',
    'Look for asymmetric features — they make it easier to distinguish rotations from mirrors',
    'Use your finger to trace the outline if needed, especially on harder levels',
    'Eliminate mirror images first — they are the most common distractors',
  ],
  'schulte-grid': [
    'Soften your gaze to take in the whole grid at once rather than scanning cell by cell',
    'Start by locating 1, but use peripheral vision to spot 2 and 3 nearby while tapping',
    'Practice expanding your peripheral vision — it is the key skill for this test',
    'Keep your eyes near the center of the grid and let numbers come to you',
    'Avoid reading numbers sequentially left-to-right; let your eyes jump to the next target',
  ],
  'rhythm-test': [
    'Tap along lightly during the listen phase to build muscle memory before recording',
    'Focus on the spacing between beats, not the beats themselves',
    'Use your whole body to feel the rhythm — nod or bob to internalize the tempo',
    'Listen for the "groove" or pattern, not individual clicks',
    'Stay relaxed — tension in your hand will throw off your timing',
  ],
```

**Step 2: Commit**

```bash
git add tools/human-benchmark/data/tips.ts
git commit -m "feat(human-benchmark): add tips for 4 new tests"
```

---

## Task 4: Implement Schulte Grid Test

This is the simplest of the 4 tests (no audio API needed) — good to build first.

**Files:**
- Create: `tools/human-benchmark/tests/schulte-grid.tsx`

**Step 1: Create the Schulte Grid component**

Create `tools/human-benchmark/tests/schulte-grid.tsx`:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'result'

const GRID_SIZE = 5
const TOTAL = GRID_SIZE * GRID_SIZE

function shuffleArray(arr: number[]): number[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function SchulteGrid({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [grid, setGrid] = useState<number[]>([])
  const [currentTarget, setCurrentTarget] = useState(1)
  const [found, setFound] = useState<Set<number>>(new Set())
  const [flashCell, setFlashCell] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const startTimeRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    }
  }, [])

  const updateTimer = useCallback(() => {
    setElapsed(performance.now() - startTimeRef.current)
    animFrameRef.current = requestAnimationFrame(updateTimer)
  }, [])

  const startGame = useCallback(() => {
    const numbers = Array.from({ length: TOTAL }, (_, i) => i + 1)
    setGrid(shuffleArray(numbers))
    setCurrentTarget(1)
    setFound(new Set())
    setElapsed(0)
    setPhase('playing')
    startTimeRef.current = performance.now()
    animFrameRef.current = requestAnimationFrame(updateTimer)
  }, [updateTimer])

  const handleCellClick = useCallback((num: number) => {
    if (phase !== 'playing' || found.has(num)) return

    if (num === currentTarget) {
      const newFound = new Set(found)
      newFound.add(num)
      setFound(newFound)

      if (newFound.size >= TOTAL) {
        cancelAnimationFrame(animFrameRef.current)
        const finalTime = performance.now() - startTimeRef.current
        const score = Math.round(finalTime)
        setElapsed(finalTime)
        setPhase('result')
        onComplete(score)
      } else {
        setCurrentTarget(num + 1)
      }
    } else {
      // Wrong tap — red flash
      setFlashCell(num)
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = setTimeout(() => setFlashCell(null), 200)
    }
  }, [phase, currentTarget, found, onComplete])

  const formatTime = (ms: number) => (ms / 1000).toFixed(2)

  const getBadge = () => {
    if (phase === 'playing') return `${found.size}/${TOTAL}`
    return undefined
  }

  return (
    <GameCard bgColor="#f43f5e" badge={getBadge()}>
      <div className="w-full h-full min-h-[350px] md:min-h-[400px] flex items-center justify-center select-none">
        {phase === 'intro' && (
          <div
            className="text-center text-white px-6 cursor-pointer"
            onClick={startGame}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startGame() } }}
          >
            <div className="text-6xl mb-6" aria-hidden="true">#️⃣</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Schulte Grid</p>
            <p className="text-white/70 text-lg mb-2">Find numbers 1 to 25 in order</p>
            <p className="text-white/50 text-sm">Click anywhere to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: {formatTime(bestScore)}s</p>
            )}
          </div>
        )}

        {phase === 'playing' && (
          <div className="flex flex-col items-center gap-3 px-4 py-4 w-full max-w-[400px]">
            <div className="flex items-center justify-between w-full text-white mb-1">
              <span className="text-lg font-bold">Find: <span className="text-2xl">{currentTarget}</span></span>
              <span className="font-mono text-lg tabular-nums">{formatTime(elapsed)}s</span>
            </div>
            <div
              className="grid gap-1.5 w-full"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
              role="grid"
              aria-label="Schulte grid"
            >
              {grid.map((num, idx) => {
                const isFound = found.has(num)
                const isFlash = flashCell === num
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(num)}
                    disabled={isFound}
                    className={`
                      aspect-square rounded-lg font-bold text-lg md:text-xl
                      flex items-center justify-center min-h-[44px]
                      transition-colors duration-150
                      ${isFound
                        ? 'bg-white/20 text-white/30 cursor-default'
                        : isFlash
                          ? 'bg-red-300 text-red-900'
                          : 'bg-white/90 text-slate-900 hover:bg-white active:bg-white/70 cursor-pointer'
                      }
                    `}
                    aria-label={isFound ? `${num} found` : `Number ${num}`}
                  >
                    {isFound ? '✓' : num}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">Completion Time</p>
            <p className="text-5xl md:text-6xl font-black mb-2">
              {formatTime(elapsed)}<span className="text-2xl font-bold">s</span>
            </p>
            <button
              onClick={startGame}
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

**Step 2: Commit**

```bash
git add tools/human-benchmark/tests/schulte-grid.tsx
git commit -m "feat(human-benchmark): implement Schulte Grid test"
```

---

## Task 5: Implement Pitch Identification Test

**Files:**
- Create: `tools/human-benchmark/tests/pitch-identification.tsx`

**Step 1: Create the Pitch Identification component**

Create `tools/human-benchmark/tests/pitch-identification.tsx`:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { EASY_NOTES, MEDIUM_NOTES, HARD_NOTES, type NoteInfo } from '../data/notes'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

const MAX_LIVES = 3

function getNotesForLevel(level: number): NoteInfo[] {
  if (level <= 3) return EASY_NOTES
  if (level <= 6) return MEDIUM_NOTES
  return HARD_NOTES
}

function pickOptions(pool: NoteInfo[], count: number): { correct: NoteInfo; options: NoteInfo[] } {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const correct = shuffled[0]
  const distractors = shuffled.slice(1, count)
  const options = [correct, ...distractors].sort(() => Math.random() - 0.5)
  return { correct, options }
}

export function PitchIdentification({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(MAX_LIVES)
  const [correctNote, setCorrectNote] = useState<NoteInfo | null>(null)
  const [options, setOptions] = useState<NoteInfo[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      oscillatorRef.current?.stop()
      audioCtxRef.current?.close()
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration = 1) => {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
    oscillatorRef.current = osc
  }, [getAudioCtx])

  const startRound = useCallback((lvl: number) => {
    const pool = getNotesForLevel(lvl)
    const { correct, options: opts } = pickOptions(pool, 4)
    setCorrectNote(correct)
    setOptions(opts)
    setSelected(null)
    setPhase('playing')
    playTone(correct.frequency)
  }, [playTone])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(MAX_LIVES)
    startRound(1)
  }, [startRound])

  const handleAnswer = useCallback((note: NoteInfo) => {
    if (phase !== 'playing' || selected) return

    setSelected(note.name)
    const correct = note.name === correctNote?.name
    setIsCorrect(correct)
    setPhase('feedback')

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)

    if (correct) {
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
  }, [phase, selected, correctNote, level, lives, onComplete, startRound])

  const handleReplay = useCallback(() => {
    if (correctNote && phase === 'playing') {
      playTone(correctNote.frequency)
    }
  }, [correctNote, phase, playTone])

  const livesDisplay = '♥'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives)

  const getBgColor = () => {
    if (phase === 'feedback') return isCorrect ? '#16a34a' : '#dc2626'
    if (phase === 'gameover') return '#2563eb'
    return '#f59e0b'
  }

  const getBadge = () => {
    if (phase === 'playing' || phase === 'feedback') return `LEVEL ${level}  ${livesDisplay}`
    return undefined
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
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStart() } }}
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎵</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Pitch Identification</p>
            <p className="text-white/70 text-lg mb-2">Listen to the tone and identify the note</p>
            <p className="text-white/50 text-sm">🎧 Headphones recommended</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && (
          <div className="flex flex-col items-center gap-4 px-4">
            <p className="text-white/80 text-lg mb-2">Which note is playing?</p>

            <button
              onClick={handleReplay}
              disabled={phase === 'feedback'}
              className="mb-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium min-h-[44px] transition-colors disabled:opacity-50"
              aria-label="Replay tone"
            >
              🔊 Replay
            </button>

            <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
              {options.map((note) => {
                const isSelected = selected === note.name
                const isAnswer = correctNote?.name === note.name
                let btnClass = 'bg-white/20 hover:bg-white/30 text-white'
                if (phase === 'feedback') {
                  if (isAnswer) btnClass = 'bg-green-500 text-white ring-2 ring-white'
                  else if (isSelected && !isCorrect) btnClass = 'bg-red-500 text-white'
                  else btnClass = 'bg-white/10 text-white/50'
                }
                return (
                  <button
                    key={note.name}
                    onClick={() => handleAnswer(note)}
                    disabled={phase === 'feedback'}
                    className={`
                      px-4 py-4 rounded-xl font-bold text-xl min-h-[56px]
                      transition-all duration-200 ${btnClass}
                    `}
                    aria-label={`Select note ${note.name}`}
                  >
                    {note.name}
                  </button>
                )
              })}
            </div>

            {phase === 'feedback' && (
              <p className="text-white font-medium mt-2">
                {isCorrect ? '✅ Correct!' : `❌ It was ${correctNote?.name}`}
              </p>
            )}
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">You reached</p>
            <p className="text-5xl md:text-6xl font-black mb-2">
              {level}<span className="text-2xl font-bold ml-2">level</span>
            </p>
            <button
              onClick={handleStart}
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

**Step 2: Commit**

```bash
git add tools/human-benchmark/tests/pitch-identification.tsx
git commit -m "feat(human-benchmark): implement Pitch Identification test"
```

---

## Task 6: Implement Mental Rotation Test

**Files:**
- Create: `tools/human-benchmark/tests/mental-rotation.tsx`

**Step 1: Create the Mental Rotation component**

Create `tools/human-benchmark/tests/mental-rotation.tsx`:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { SHAPES, rotatePoints, mirrorPoints, pointsToSvg, type ShapeData } from '../data/shapes'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

const MAX_LIVES = 3

interface Option {
  points: [number, number][]
  isCorrect: boolean
  id: string
}

function getShapesForLevel(level: number): ShapeData[] {
  if (level <= 3) return SHAPES.filter(s => s.difficulty === 1)
  if (level <= 6) return SHAPES.filter(s => s.difficulty <= 2)
  return SHAPES
}

function getRotationAngles(level: number): number[] {
  if (level <= 3) return [90, 180, 270]
  if (level <= 6) return [45, 90, 135, 180, 225, 270, 315]
  return [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
}

function generateRound(level: number): { reference: [number, number][]; options: Option[] } {
  const shapes = getShapesForLevel(level)
  const shape = shapes[Math.floor(Math.random() * shapes.length)]
  const angles = getRotationAngles(level)

  // Pick a random rotation for the correct answer
  const correctAngle = angles[Math.floor(Math.random() * angles.length)]
  const correctPoints = rotatePoints(shape.points, correctAngle)

  // Generate 3 distractors (mirrored then rotated differently)
  const mirrored = mirrorPoints(shape.points)
  const usedAngles = new Set<number>()
  const distractors: Option[] = []

  while (distractors.length < 3) {
    const angle = angles[Math.floor(Math.random() * angles.length)]
    if (usedAngles.has(angle)) continue
    usedAngles.add(angle)
    distractors.push({
      points: rotatePoints(mirrored, angle),
      isCorrect: false,
      id: `distractor-${distractors.length}`,
    })
  }

  const options: Option[] = [
    { points: correctPoints, isCorrect: true, id: 'correct' },
    ...distractors,
  ].sort(() => Math.random() - 0.5)

  return { reference: shape.points, options }
}

function ShapeSvg({ points, className, color }: { points: [number, number][]; className?: string; color: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <polygon points={pointsToSvg(points)} fill={color} stroke="white" strokeWidth="2" />
    </svg>
  )
}

export function MentalRotation({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(MAX_LIVES)
  const [reference, setReference] = useState<[number, number][]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])

  const startRound = useCallback((lvl: number) => {
    const round = generateRound(lvl)
    setReference(round.reference)
    setOptions(round.options)
    setSelectedId(null)
    setPhase('playing')
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(MAX_LIVES)
    startRound(1)
  }, [startRound])

  const handleSelect = useCallback((option: Option) => {
    if (phase !== 'playing' || selectedId) return

    setSelectedId(option.id)
    setIsCorrect(option.isCorrect)
    setPhase('feedback')

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)

    if (option.isCorrect) {
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
  }, [phase, selectedId, level, lives, onComplete, startRound])

  const livesDisplay = '♥'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives)

  const getBgColor = () => {
    if (phase === 'feedback') return isCorrect ? '#16a34a' : '#dc2626'
    if (phase === 'gameover') return '#2563eb'
    return '#06b6d4'
  }

  const getBadge = () => {
    if (phase === 'playing' || phase === 'feedback') return `LEVEL ${level}  ${livesDisplay}`
    return undefined
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
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStart() } }}
          >
            <div className="text-6xl mb-6" aria-hidden="true">🧊</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Mental Rotation</p>
            <p className="text-white/70 text-lg mb-2">Find the rotated shape — not the mirror!</p>
            <p className="text-white/50 text-sm">Click anywhere to start</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: Level {bestScore}</p>
            )}
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && (
          <div className="flex flex-col items-center gap-4 px-4 py-4">
            <p className="text-white/80 text-sm">REFERENCE SHAPE</p>
            <div className="bg-white/20 rounded-xl p-3">
              <ShapeSvg points={reference} className="w-20 h-20 md:w-24 md:h-24" color="rgba(255,255,255,0.9)" />
            </div>

            <p className="text-white/80 text-sm mt-1">Which one is a rotation?</p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
              {options.map((opt) => {
                const isSelected = selectedId === opt.id
                let borderClass = 'border-2 border-white/20 hover:border-white/50'
                if (phase === 'feedback') {
                  if (opt.isCorrect) borderClass = 'border-2 border-green-400 ring-2 ring-green-400/50'
                  else if (isSelected) borderClass = 'border-2 border-red-400 ring-2 ring-red-400/50'
                  else borderClass = 'border-2 border-white/10'
                }
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    disabled={phase === 'feedback'}
                    className={`
                      rounded-xl p-3 flex items-center justify-center min-h-[80px]
                      bg-white/10 transition-all duration-200 cursor-pointer ${borderClass}
                    `}
                    aria-label="Shape option"
                  >
                    <ShapeSvg points={opt.points} className="w-16 h-16 md:w-20 md:h-20" color="rgba(255,255,255,0.85)" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'gameover' && (
          <div className="text-center text-white px-6">
            <div className="text-6xl mb-6" aria-hidden="true">🏆</div>
            <p className="text-lg text-white/70 mb-2">You reached</p>
            <p className="text-5xl md:text-6xl font-black mb-2">
              {level}<span className="text-2xl font-bold ml-2">level</span>
            </p>
            <button
              onClick={handleStart}
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

**Step 2: Commit**

```bash
git add tools/human-benchmark/tests/mental-rotation.tsx
git commit -m "feat(human-benchmark): implement Mental Rotation test"
```

---

## Task 7: Implement Rhythm Test

**Files:**
- Create: `tools/human-benchmark/tests/rhythm-test.tsx`

**Step 1: Create the Rhythm Test component**

Create `tools/human-benchmark/tests/rhythm-test.tsx`:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { getRandomPattern, type RhythmPattern } from '../data/rhythms'

type Phase = 'intro' | 'listen' | 'record' | 'analysis' | 'result'

const TOTAL_ROUNDS = 3
const TOLERANCE_MS = 200
const DIFFICULTIES: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard']

function calculateAccuracy(original: number[], userTaps: number[]): number {
  if (userTaps.length === 0) return 0

  let totalScore = 0
  const matchedTaps = new Set<number>()

  for (const beat of original) {
    let bestDev = Infinity
    let bestIdx = -1
    for (let i = 0; i < userTaps.length; i++) {
      if (matchedTaps.has(i)) continue
      const dev = Math.abs(beat - userTaps[i])
      if (dev < bestDev) {
        bestDev = dev
        bestIdx = i
      }
    }
    if (bestIdx !== -1 && bestDev <= TOLERANCE_MS) {
      matchedTaps.add(bestIdx)
      totalScore += Math.max(0, 1 - bestDev / TOLERANCE_MS)
    }
    // else: missed beat, score 0
  }

  // Penalty for extra taps
  const extraTaps = userTaps.length - matchedTaps.size
  const penalty = extraTaps * 0.5

  const raw = ((totalScore - penalty) / original.length) * 100
  return Math.round(Math.max(0, Math.min(100, raw)))
}

export function RhythmTest({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [round, setRound] = useState(0)
  const [pattern, setPattern] = useState<RhythmPattern | null>(null)
  const [userTaps, setUserTaps] = useState<number[]>([])
  const [roundScores, setRoundScores] = useState<number[]>([])
  const [activeBeat, setActiveBeat] = useState(-1)
  const [isPulsing, setIsPulsing] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const recordStartRef = useRef(0)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      audioCtxRef.current?.close()
    }
  }, [])

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playClick = useCallback(() => {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 800
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.05)
  }, [getAudioCtx])

  const pulse = useCallback(() => {
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), 100)
  }, [])

  const startListenPhase = useCallback((pat: RhythmPattern) => {
    setPhase('listen')
    setActiveBeat(-1)
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    pat.beats.forEach((time, idx) => {
      const t = setTimeout(() => {
        playClick()
        pulse()
        setActiveBeat(idx)
      }, time + 500) // 500ms delay before pattern starts
      timeoutsRef.current.push(t)
    })

    // After pattern finishes, transition to record phase
    const lastBeat = pat.beats[pat.beats.length - 1]
    const t = setTimeout(() => {
      setActiveBeat(-1)
      setPhase('record')
      setUserTaps([])
      recordStartRef.current = performance.now()
    }, lastBeat + 1200) // 1.2s pause after last beat
    timeoutsRef.current.push(t)
  }, [playClick, pulse])

  const startRound = useCallback((roundIdx: number) => {
    const difficulty = DIFFICULTIES[Math.min(roundIdx, DIFFICULTIES.length - 1)]
    const pat = getRandomPattern(difficulty)
    setPattern(pat)
    setRound(roundIdx)
    startListenPhase(pat)
  }, [startListenPhase])

  const handleStart = useCallback(() => {
    setRoundScores([])
    startRound(0)
  }, [startRound])

  const handleTap = useCallback(() => {
    if (phase !== 'record') return
    playClick()
    pulse()
    const tapTime = performance.now() - recordStartRef.current
    setUserTaps(prev => [...prev, tapTime])
  }, [phase, playClick, pulse])

  const handleSubmitRound = useCallback(() => {
    if (!pattern) return

    const accuracy = calculateAccuracy(pattern.beats, userTaps)
    const newScores = [...roundScores, accuracy]
    setRoundScores(newScores)

    if (newScores.length >= TOTAL_ROUNDS) {
      const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length)
      setPhase('result')
      onComplete(avg)
    } else {
      startRound(newScores.length)
    }
  }, [pattern, userTaps, roundScores, onComplete, startRound])

  const getBgColor = () => {
    if (phase === 'result') return '#2563eb'
    return '#8b5cf6'
  }

  const getBadge = () => {
    if (phase === 'listen') return `ROUND ${round + 1}/${TOTAL_ROUNDS} — LISTEN`
    if (phase === 'record') return `ROUND ${round + 1}/${TOTAL_ROUNDS} — TAP`
    return undefined
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
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStart() } }}
          >
            <div className="text-6xl mb-6" aria-hidden="true">🥁</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Rhythm Test</p>
            <p className="text-white/70 text-lg mb-2">Listen to the rhythm, then tap it back</p>
            <p className="text-white/50 text-sm">🎧 Headphones recommended • 3 rounds</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-4">Your best: {bestScore}%</p>
            )}
          </div>
        )}

        {phase === 'listen' && pattern && (
          <div className="flex flex-col items-center gap-6 px-4">
            <p className="text-white text-xl font-bold">Listen...</p>

            {/* Beat indicators */}
            <div className="flex gap-2 flex-wrap justify-center">
              {pattern.beats.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-100 ${
                    idx <= activeBeat ? 'bg-white scale-125' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Visual pulse circle */}
            <div
              className={`w-32 h-32 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-100 ${
                isPulsing ? 'scale-110 bg-white/40' : ''
              }`}
            >
              <span className="text-4xl">🔊</span>
            </div>
          </div>
        )}

        {phase === 'record' && pattern && (
          <div className="flex flex-col items-center gap-4 px-4">
            <p className="text-white text-xl font-bold">Your turn! Tap the rhythm</p>

            {/* Beat indicators for user taps */}
            <div className="flex gap-2 flex-wrap justify-center">
              {pattern.beats.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-100 ${
                    idx < userTaps.length ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Tap button */}
            <button
              onClick={handleTap}
              onKeyDown={(e) => { if (e.key === ' ') { e.preventDefault(); handleTap() } }}
              className={`w-40 h-40 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/50 flex items-center justify-center transition-all duration-75 cursor-pointer min-h-[44px] ${
                isPulsing ? 'scale-95 bg-white/40' : ''
              }`}
              aria-label="Tap rhythm"
            >
              <span className="text-5xl">👆</span>
            </button>

            <button
              onClick={handleSubmitRound}
              className="mt-2 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold min-h-[44px] transition-colors"
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
              {Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length)}
              <span className="text-2xl font-bold">%</span>
            </p>
            <div className="flex justify-center gap-2 mt-4 mb-6">
              {roundScores.map((s, i) => (
                <span key={i} className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                  R{i + 1}: {s}%
                </span>
              ))}
            </div>
            <button
              onClick={handleStart}
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

**Step 2: Commit**

```bash
git add tools/human-benchmark/tests/rhythm-test.tsx
git commit -m "feat(human-benchmark): implement Rhythm Test"
```

---

## Task 8: Wire Up All 4 Tests in page.tsx

**Files:**
- Modify: `app/tools/human-benchmark/page.tsx`

**Step 1: Add imports and register components**

In `app/tools/human-benchmark/page.tsx`, add 4 new imports after the existing test imports (after line 17):

```typescript
import { PitchIdentification } from '@/tools/human-benchmark/tests/pitch-identification'
import { MentalRotation } from '@/tools/human-benchmark/tests/mental-rotation'
import { SchulteGrid } from '@/tools/human-benchmark/tests/schulte-grid'
import { RhythmTest } from '@/tools/human-benchmark/tests/rhythm-test'
```

Then add 4 new entries to `TEST_COMPONENTS` (after the `'typing': TypingTest` entry):

```typescript
  'pitch-identification': PitchIdentification,
  'mental-rotation': MentalRotation,
  'schulte-grid': SchulteGrid,
  'rhythm-test': RhythmTest,
```

**Step 2: Verify TypeScript compiles**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm tsc --noEmit 2>&1 | head -30`

Expected: No type errors. The `TEST_COMPONENTS` Record now covers all 12 `TestId` values.

**Step 3: Commit**

```bash
git add app/tools/human-benchmark/page.tsx
git commit -m "feat(human-benchmark): wire up 4 new tests in page router"
```

---

## Task 9: Verify All Tests Work in Browser

**Step 1: Start dev server**

Run: `cd /Users/mercury/WebstormProjects/handytool-workspace && pnpm dev`

**Step 2: Use webapp-testing skill to verify each test**

Navigate to `http://localhost:3000/tools/human-benchmark` and verify:

1. **Dashboard** — All 12 test cards visible with correct icons and descriptions
2. **Schulte Grid** — Click to start → 5×5 grid appears → tap numbers in order → timer runs → result shows time
3. **Pitch Identification** — Click to start → tone plays → 4 note buttons → correct/wrong feedback → level progression
4. **Mental Rotation** — Click to start → reference shape + 4 options → select rotation → feedback → level progression
5. **Rhythm Test** — Click to start → listen phase with dots + pulse → record phase with tap button → submit → score

Check for:
- No console errors
- Responsive on mobile (test at 375px width)
- Dark mode works
- Keyboard navigation (Enter/Space to start, Escape to go back)
- Audio plays correctly (Pitch + Rhythm tests)

**Step 3: Fix any issues found, then final commit**

```bash
git add -A
git commit -m "feat(human-benchmark): complete 4 new tests - pitch, rotation, schulte, rhythm"
```

---

## Summary

| Task | Description | Est. Files |
|------|-------------|-----------|
| 1 | Extend types + configs | 2 modified |
| 2 | Create data files (notes, shapes, rhythms) | 3 created |
| 3 | Add tips for new tests | 1 modified |
| 4 | Implement Schulte Grid | 1 created |
| 5 | Implement Pitch Identification | 1 created |
| 6 | Implement Mental Rotation | 1 created |
| 7 | Implement Rhythm Test | 1 created |
| 8 | Wire up in page.tsx | 1 modified |
| 9 | Browser verification | 0 (testing) |

**Total:** 4 new test components, 3 data files, 4 modified files.
