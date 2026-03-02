# 3 Spatial & Visual HB Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 3 new Human Benchmark tests — Color Sensitivity, One Stroke (Eulerian Path), Tangram — bringing the total to 23.

**Architecture:** Each test is a self-contained React component following the existing `TestComponentProps` pattern (intro → playing → result phases, 3 lives, level-based scoring). All 3 use inline SVG for rendering. Puzzle data is pre-defined in data files. No backend needed.

**Tech Stack:** React 19, TypeScript, SVG, Tailwind CSS v4

---

### Task 1: Register 3 new test IDs and configs

**Files:**
- Modify: `tools/human-benchmark/types.ts:1-21` (TestId union)
- Modify: `tools/human-benchmark/constants.ts:428` (append 3 configs)
- Modify: `app/tools/human-benchmark/page.tsx:31-52` (TEST_COMPONENTS map)

**Step 1: Add TestIds to the union type**

In `tools/human-benchmark/types.ts`, add 3 new IDs to the `TestId` union:

```typescript
// After line 21 ('tracking-test'), add:
  | 'color-sensitivity'
  | 'one-stroke'
  | 'tangram'
```

**Step 2: Add TestConfig entries**

In `tools/human-benchmark/constants.ts`, append 3 new entries to the `TEST_CONFIGS` array (before the closing `]`). Use `React.createElement` for icons matching the existing pattern:

- `color-sensitivity`: name "Color Sensitivity", description "Spot the tile with a slightly different color in a grid. Gets harder as colors converge.", unit "level", lowerIsBetter false, gameBgColor "#E8567F". Icon: eye SVG path `M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z` + inner circle `M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z`. iconBg `bg-pink-900/30`, iconColor `text-pink-400`, iconBgLight `bg-pink-100`, iconColorLight `text-pink-600`.

- `one-stroke`: name "One Stroke", description "Trace every edge of the graph exactly once without lifting your finger.", unit "level", lowerIsBetter false, gameBgColor "#4CAF50". Icon: pencil path `M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125`. iconBg `bg-green-900/30`, iconColor `text-green-400`, iconBgLight `bg-green-100`, iconColorLight `text-green-600`.

- `tangram`: name "Tangram", description "Drag and rotate the 7 tangram pieces to fill the target silhouette.", unit "level", lowerIsBetter false, gameBgColor "#FF9800". Icon: puzzle piece path `M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.089 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.421 48.421 0 01-4.163-.3c-.186-.028-.348-.132-.465-.278a1.074 1.074 0 01-.14-.653l.454-5.452A1.125 1.125 0 017.394 3h9.212a1.125 1.125 0 011.114.984l.454 5.452a1.074 1.074 0 01-.14.653c-.117.146-.279.25-.465.278a48.421 48.421 0 01-4.163.3.64.64 0 01-.657-.643v0zM12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5`. iconBg `bg-orange-900/30`, iconColor `text-orange-400`, iconBgLight `bg-orange-100`, iconColorLight `text-orange-600`.

**Step 3: Add placeholder imports in page.tsx**

In `app/tools/human-benchmark/page.tsx`, add imports for the 3 new test components (after line 29):

```typescript
import { ColorSensitivity } from '@/tools/human-benchmark/tests/color-sensitivity'
import { OneStroke } from '@/tools/human-benchmark/tests/one-stroke'
import { Tangram } from '@/tools/human-benchmark/tests/tangram'
```

Add entries to the `TEST_COMPONENTS` map (after line 51):

```typescript
  'color-sensitivity': ColorSensitivity,
  'one-stroke': OneStroke,
  'tangram': Tangram,
```

**Step 4: Commit**

```bash
git add tools/human-benchmark/types.ts tools/human-benchmark/constants.ts app/tools/human-benchmark/page.tsx
git commit -m "feat(human-benchmark): register 3 spatial/visual test IDs and configs"
```

> **Note:** Build will fail until test components exist. That's fine — Task 2–4 create them.

---

### Task 2: Implement Color Sensitivity test

**Files:**
- Create: `tools/human-benchmark/tests/color-sensitivity.tsx`

**Step 1: Create the component**

Create `tools/human-benchmark/tests/color-sensitivity.tsx` with the full implementation:

```typescript
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'

type Phase = 'intro' | 'playing' | 'feedback' | 'gameover'

function getGridSize(level: number): number {
  if (level <= 3) return 4
  if (level <= 6) return 5
  if (level <= 9) return 6
  if (level <= 12) return 7
  return 8
}

function getColorDelta(level: number): number {
  if (level <= 3) return 15
  if (level <= 6) return 10
  if (level <= 9) return 6
  if (level <= 12) return 4
  return 2
}

function randomHue(): number {
  return Math.floor(Math.random() * 360)
}

function hslToString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function ColorSensitivity({ onComplete, bestScore }: TestComponentProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [gridSize, setGridSize] = useState(4)
  const [oddIndex, setOddIndex] = useState(0)
  const [baseColor, setBaseColor] = useState('')
  const [oddColor, setOddColor] = useState('')
  const [clickedIndex, setClickedIndex] = useState<number | null>(null)
  const [wasCorrect, setWasCorrect] = useState(false)

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])

  const startRound = useCallback((lvl: number) => {
    const size = getGridSize(lvl)
    const delta = getColorDelta(lvl)
    const hue = randomHue()
    const saturation = 60 + Math.random() * 20 // 60-80%
    const lightness = 45 + Math.random() * 15  // 45-60%

    // Randomly make odd tile lighter or darker
    const direction = Math.random() > 0.5 ? 1 : -1
    const base = hslToString(hue, saturation, lightness)
    const odd = hslToString(hue, saturation, lightness + delta * direction)

    setGridSize(size)
    setOddIndex(Math.floor(Math.random() * size * size))
    setBaseColor(base)
    setOddColor(odd)
    setClickedIndex(null)
    setWasCorrect(false)
    setPhase('playing')
  }, [])

  const handleStart = useCallback(() => {
    setLevel(1)
    setLives(3)
    startRound(1)
  }, [startRound])

  const handleTileClick = useCallback((index: number) => {
    if (phase !== 'playing') return

    const isCorrect = index === oddIndex
    setClickedIndex(index)
    setWasCorrect(isCorrect)
    setPhase('feedback')

    if (isCorrect) {
      feedbackTimeoutRef.current = setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel)
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
          startRound(level)
        }, 800)
      }
    }
  }, [phase, oddIndex, level, lives, startRound, onComplete])

  const handleTryAgain = useCallback(() => {
    setPhase('intro')
  }, [])

  const heartsDisplay = '\u2665'.repeat(lives) + '\u2661'.repeat(3 - lives)

  const getBgColor = () => {
    switch (phase) {
      case 'intro': return '#E8567F'
      case 'playing': return '#E8567F'
      case 'feedback': return wasCorrect ? '#16a34a' : '#dc2626'
      case 'gameover': return '#2563eb'
    }
  }

  const getBadge = () => {
    if (phase === 'intro' || phase === 'gameover') return undefined
    return `LEVEL ${level}  ${heartsDisplay}`
  }

  const totalTiles = gridSize * gridSize

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
            aria-label="Start Color Sensitivity test"
          >
            <div className="text-6xl mb-6" aria-hidden="true">🎨</div>
            <p className="text-2xl md:text-3xl font-bold mb-3">Color Sensitivity</p>
            <p className="text-white/70 text-lg mb-2">Spot the tile with a different color</p>
            <p className="text-white/50 text-sm mb-4">Colors get more similar each level</p>
            {bestScore !== undefined && bestScore > 0 && (
              <p className="text-white/50 text-sm mt-2">Your best: Level {bestScore}</p>
            )}
            <p className="text-white/70 text-lg mt-6">Click to start</p>
          </div>
        )}

        {(phase === 'playing' || phase === 'feedback') && (
          <div className="text-center text-white px-4 w-full">
            <p className="text-white/60 text-sm mb-4">Tap the different tile</p>
            <svg
              viewBox={`0 0 ${gridSize * 50} ${gridSize * 50}`}
              className="w-full max-w-[320px] mx-auto"
              role="grid"
              aria-label={`${gridSize} by ${gridSize} color grid`}
            >
              {Array.from({ length: totalTiles }).map((_, i) => {
                const row = Math.floor(i / gridSize)
                const col = i % gridSize
                const isOdd = i === oddIndex
                const isClicked = i === clickedIndex

                let fill = isOdd ? oddColor : baseColor
                if (phase === 'feedback') {
                  if (isOdd && wasCorrect) fill = '#16a34a'
                  else if (isClicked && !wasCorrect) fill = '#dc2626'
                }

                return (
                  <rect
                    key={i}
                    x={col * 50 + 2}
                    y={row * 50 + 2}
                    width={46}
                    height={46}
                    rx={4}
                    fill={fill}
                    className={phase === 'playing' ? 'cursor-pointer' : ''}
                    onClick={() => handleTileClick(i)}
                    role="gridcell"
                    aria-label={`Tile ${row + 1}-${col + 1}`}
                  />
                )
              })}
            </svg>
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
              className="mt-6 px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold min-h-[44px] transition-colors cursor-pointer"
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

**Step 2: Verify build**

Run: `pnpm build` or check in dev server that Color Sensitivity test loads and plays correctly.

**Step 3: Commit**

```bash
git add tools/human-benchmark/tests/color-sensitivity.tsx
git commit -m "feat(human-benchmark): implement Color Sensitivity test"
```

---

### Task 3: Implement One Stroke test

**Files:**
- Create: `tools/human-benchmark/data/one-stroke-puzzles.ts`
- Create: `tools/human-benchmark/tests/one-stroke.tsx`

**Step 1: Create puzzle data**

Create `tools/human-benchmark/data/one-stroke-puzzles.ts` with pre-defined puzzles. Each puzzle is a list of nodes (x, y coordinates) and edges (pairs of node indices). All puzzles must have a valid Eulerian path (0 or 2 nodes with odd degree).

```typescript
export interface OneStrokePuzzle {
  nodes: { x: number; y: number }[]
  edges: [number, number][]
}

// Each level has multiple puzzles; one is picked at random
export const ONE_STROKE_PUZZLES: OneStrokePuzzle[][] = [
  // Level 1: Triangle (3 nodes, 3 edges)
  [
    { nodes: [{ x: 150, y: 50 }, { x: 50, y: 250 }, { x: 250, y: 250 }], edges: [[0, 1], [1, 2], [2, 0]] },
  ],
  // Level 2: Square (4 nodes, 4 edges) — has 2 odd-degree nodes
  [
    { nodes: [{ x: 80, y: 80 }, { x: 220, y: 80 }, { x: 220, y: 220 }, { x: 80, y: 220 }], edges: [[0, 1], [1, 2], [2, 3], [3, 0]] },
  ],
  // Level 3: Square + one diagonal (4 nodes, 5 edges)
  [
    { nodes: [{ x: 80, y: 80 }, { x: 220, y: 80 }, { x: 220, y: 220 }, { x: 80, y: 220 }], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]] },
  ],
  // Level 4: Square + both diagonals (4 nodes, 6 edges — all even degree)
  [
    { nodes: [{ x: 80, y: 80 }, { x: 220, y: 80 }, { x: 220, y: 220 }, { x: 80, y: 220 }], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]] },
  ],
  // Level 5: Envelope / house shape (5 nodes, 8 edges)
  [
    { nodes: [{ x: 80, y: 120 }, { x: 220, y: 120 }, { x: 220, y: 260 }, { x: 80, y: 260 }, { x: 150, y: 40 }], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [0, 4], [1, 4]] },
  ],
  // Level 6: Pentagram-like (5 nodes, 10 edges — complete graph K5 minus 0, all even)
  [
    { nodes: [{ x: 150, y: 30 }, { x: 265, y: 115 }, { x: 225, y: 260 }, { x: 75, y: 260 }, { x: 35, y: 115 }], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [0, 3], [1, 3], [1, 4], [2, 4]] },
  ],
  // Level 7: 6-node graph (6 nodes, 10 edges)
  [
    { nodes: [{ x: 80, y: 50 }, { x: 220, y: 50 }, { x: 280, y: 150 }, { x: 220, y: 250 }, { x: 80, y: 250 }, { x: 20, y: 150 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4], [2, 5], [0, 2]] },
  ],
  // Level 8: 6-node dense (6 nodes, 12 edges)
  [
    { nodes: [{ x: 80, y: 50 }, { x: 220, y: 50 }, { x: 280, y: 150 }, { x: 220, y: 250 }, { x: 80, y: 250 }, { x: 20, y: 150 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 5]] },
  ],
  // Level 9: 7-node graph (7 nodes, 12 edges)
  [
    { nodes: [{ x: 150, y: 30 }, { x: 250, y: 80 }, { x: 280, y: 180 }, { x: 220, y: 270 }, { x: 80, y: 270 }, { x: 20, y: 180 }, { x: 50, y: 80 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 3], [0, 4], [1, 5], [2, 6], [2, 4]] },
  ],
  // Level 10: 7-node dense (7 nodes, 14 edges)
  [
    { nodes: [{ x: 150, y: 30 }, { x: 250, y: 80 }, { x: 280, y: 180 }, { x: 220, y: 270 }, { x: 80, y: 270 }, { x: 20, y: 180 }, { x: 50, y: 80 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 2], [0, 4], [1, 3], [1, 5], [2, 6], [3, 5], [4, 6]] },
  ],
  // Level 11: 8-node graph (8 nodes, 16 edges)
  [
    { nodes: [{ x: 150, y: 20 }, { x: 240, y: 60 }, { x: 280, y: 150 }, { x: 240, y: 240 }, { x: 150, y: 280 }, { x: 60, y: 240 }, { x: 20, y: 150 }, { x: 60, y: 60 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 4], [1, 5], [2, 6], [3, 7], [0, 2], [2, 4], [4, 6], [6, 0]] },
  ],
  // Level 12+: 8-node very dense (8 nodes, 18 edges)
  [
    { nodes: [{ x: 150, y: 20 }, { x: 240, y: 60 }, { x: 280, y: 150 }, { x: 240, y: 240 }, { x: 150, y: 280 }, { x: 60, y: 240 }, { x: 20, y: 150 }, { x: 60, y: 60 }],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 3], [0, 5], [1, 4], [1, 6], [2, 5], [2, 7], [3, 6], [4, 7], [0, 2], [4, 6]] },
  ],
]
```

**Step 2: Create the One Stroke component**

Create `tools/human-benchmark/tests/one-stroke.tsx`:

Key implementation details:
- State: `phase` (intro/playing/gameover), `level`, `lives`, `currentPuzzle`, `drawnEdges` (Set of edge keys), `currentNode` (index or null), `path` (array of node indices for undo)
- `getPuzzleForLevel(level)`: picks from `ONE_STROKE_PUZZLES[Math.min(level - 1, puzzles.length - 1)]`
- Edge key: sorted pair `${Math.min(a,b)}-${Math.max(a,b)}`
- `getAdjacentEdge(from, to)`: checks if edge exists and isn't drawn yet
- Undo: pop last node from path, remove last drawn edge
- Stuck detection: after each move, check if current node has any undrawn adjacent edges. If not and edges remain undrawn → auto-fail after 1s delay
- SVG viewBox `0 0 300 300`, nodes as `<circle r="20">` with white fill, edges as `<line>` with grey (undrawn) or colored (drawn)
- Current node gets pulsing glow animation via CSS
- Touch targets: node circles ≥ 40px diameter

Follow the exact same component structure as `stroop-test.tsx`: `GameCard` wrapper, intro/playing/gameover phases, hearts display, try again button.

**Step 3: Verify the test plays correctly in dev server**

**Step 4: Commit**

```bash
git add tools/human-benchmark/data/one-stroke-puzzles.ts tools/human-benchmark/tests/one-stroke.tsx
git commit -m "feat(human-benchmark): implement One Stroke (Eulerian path) test"
```

---

### Task 4: Implement Tangram test

**Files:**
- Create: `tools/human-benchmark/data/tangram-puzzles.ts`
- Create: `tools/human-benchmark/tests/tangram.tsx`

**Step 1: Create tangram puzzle data**

Create `tools/human-benchmark/data/tangram-puzzles.ts`:

Each puzzle defines:
- `silhouette`: SVG path string for the target shape outline
- `pieces`: array of piece definitions, each with `id`, `type` (large-tri, medium-tri, small-tri, square, parallelogram), `points` (polygon points in solution position), `color`, `rotation` (solution rotation in 45° increments 0-7), `flip` (boolean, only for parallelogram)
- `viewBox`: SVG viewBox for this puzzle

Start with 12+ puzzles across difficulty levels:
- Levels 1–2: 3-piece puzzles (simple arrow, house)
- Levels 3–4: 4-5 piece puzzles (cat, boat)
- Levels 5–7: 6-piece puzzles (running person, bird)
- Levels 8+: full 7-piece puzzles (swan, candle, rabbit)

Each piece's `points` array defines the polygon vertices at the solution position/rotation. The initial scrambled position is randomly generated at runtime.

**Step 2: Create the Tangram component**

Create `tools/human-benchmark/tests/tangram.tsx`:

Key implementation details:
- State: `phase`, `level`, `lives`, `pieces` (array with current x, y, rotation, placed status), `selectedPieceId`, `dragState`
- Drag: `onPointerDown` / `onPointerMove` / `onPointerUp` on SVG. Track offset from piece center. Use `setPointerCapture` for reliable mobile drag.
- Rotate: when piece is selected, show a rotate button. Each tap rotates 45°. For parallelogram, also show a flip button.
- Snap: on pointer up, check if piece is within 15px of solution position AND correct rotation. If so, snap to exact position and mark as `placed: true`.
- Timer: countdown timer per level (60s/90s/120s). Display as progress bar.
- Timeout → lose 1 life. 3 timeouts → gameover.
- All pieces placed → level complete, advance to next puzzle.
- SVG viewBox `0 0 400 400`. Silhouette rendered as `<path>` with `fill="rgba(128,128,128,0.3)"`. Pieces as `<polygon>` with distinct colors.
- Piece tray: on mobile (< md), pieces start below the silhouette area. On desktop, to the right.
- Transform: each piece uses `transform="translate(x,y) rotate(deg) scale(flip)"` on a `<g>` element.

Follow the same component structure: `GameCard`, intro/playing/gameover phases, hearts, timer bar, try again button.

**Step 3: Verify in dev server — test drag, rotate, snap, and timer**

**Step 4: Commit**

```bash
git add tools/human-benchmark/data/tangram-puzzles.ts tools/human-benchmark/tests/tangram.tsx
git commit -m "feat(human-benchmark): implement Tangram test"
```

---

### Task 5: Wire up imports and verify build

**Files:**
- Modify: `app/tools/human-benchmark/page.tsx` (verify imports work)

**Step 1: Run full build**

```bash
pnpm build
```

Ensure no TypeScript errors and all 3 tests are accessible from the dashboard.

**Step 2: Manual smoke test**

- Navigate to Human Benchmark in browser
- Verify all 3 new tests appear in the grid
- Play each test: start → play → game over → try again
- Verify scores save to localStorage

**Step 3: Commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(human-benchmark): wire up 3 spatial tests and fix build issues"
```

---

### Task 6: Add dashboard category grouping (optional enhancement)

**Files:**
- Modify: `tools/human-benchmark/types.ts` (add `category` field to TestConfig)
- Modify: `tools/human-benchmark/constants.ts` (add category to all 23 configs)
- Modify: `tools/human-benchmark/dashboard.tsx` (group tests by category)

**Step 1: Add category to TestConfig**

In `types.ts`, add optional `category` field:

```typescript
export interface TestConfig {
  // ... existing fields
  category?: string
}
```

**Step 2: Add categories to all TEST_CONFIGS entries**

Suggested categories:
- **Reflexes & Speed**: reaction-time, aim-trainer, tracking-test
- **Memory**: sequence-memory, number-memory, verbal-memory, visual-memory, chimp-test, tone-memory
- **Audio & Music**: pitch-identification, rhythm-test, interval-recognition, chord-identification, higher-or-lower
- **Language & Logic**: typing, stroop-test, quick-math, word-scramble
- **Spatial & Visual**: mental-rotation, schulte-grid, color-sensitivity, one-stroke, tangram

**Step 3: Update Dashboard to render grouped sections**

In `dashboard.tsx`, replace the flat grid with grouped sections:

```typescript
// Group tests by category
const categories = [...new Set(TEST_CONFIGS.map(t => t.category ?? 'Other'))]

// Render each category as a section with heading + grid
{categories.map(cat => (
  <div key={cat} className="mb-8">
    <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-4">{cat}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {TEST_CONFIGS.filter(t => (t.category ?? 'Other') === cat).map(test => (
        <TestCard key={test.id} test={test} score={scores[test.id]} onClick={() => onSelectTest(test.id)} />
      ))}
    </div>
  </div>
))}
```

**Step 4: Commit**

```bash
git add tools/human-benchmark/types.ts tools/human-benchmark/constants.ts tools/human-benchmark/dashboard.tsx
git commit -m "feat(human-benchmark): add category grouping to dashboard (23 tests)"
```
