# Human Benchmark: 4 Graph Theory Tests — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4 graph theory puzzle tests (Five Rooms, Four Colour Theorem, Planarity, Three Utilities) to the Human Benchmark, in a new "Graph Theory" category, bringing the total to 27 tests.

**Architecture:** Each test follows the existing HB pattern: a `tests/<name>.tsx` component using `GameCard`, phase state machine (`intro` → `playing` → `gameover`), SVG rendering, and `TestComponentProps`. Puzzle data lives in `data/<name>-puzzles.ts` (except Three Utilities which generates K_{m,n} procedurally). A new "Graph Theory" category is added to the dashboard.

**Tech Stack:** React 19, TypeScript strict, SVG, Tailwind CSS v4, Next.js 16 App Router

---

## Task 1: Register 4 new test IDs and configs

**Files:**
- Modify: `tools/human-benchmark/types.ts`
- Modify: `tools/human-benchmark/constants.ts`
- Modify: `app/tools/human-benchmark/page.tsx`

**Step 1: Add TestIds to types.ts**

In the `TestId` union type, add these 4 new IDs after `'tangram'`:

```ts
  | 'five-rooms'
  | 'four-colour'
  | 'planarity'
  | 'three-utilities'
```

**Step 2: Add TestConfigs to constants.ts**

Add the 4 new entries to the `TEST_CONFIGS` array. Each needs all required fields. Use `React.createElement` for icons (this is a `.ts` file, not `.tsx`).

```ts
  // ── Graph Theory ──────────────────────────────────
  {
    id: 'five-rooms' as TestId,
    name: 'Five Rooms',
    description: 'Draw a line that crosses every wall exactly once without retracing.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' }),
    ),
    iconBg: 'bg-purple-900/30',
    iconColor: 'text-purple-400',
    iconBgLight: 'bg-purple-100',
    iconColorLight: 'text-purple-600',
    gameBgColor: '#8B5CF6',
    unit: 'level',
    lowerIsBetter: false,
    category: 'Graph Theory',
  },
  {
    id: 'four-colour' as TestId,
    name: 'Four Colour',
    description: 'Color every region of a map using at most 4 colors with no adjacent matches.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' }),
    ),
    iconBg: 'bg-amber-900/30',
    iconColor: 'text-amber-400',
    iconBgLight: 'bg-amber-100',
    iconColorLight: 'text-amber-600',
    gameBgColor: '#F59E0B',
    unit: 'level',
    lowerIsBetter: false,
    category: 'Graph Theory',
  },
  {
    id: 'planarity' as TestId,
    name: 'Planarity',
    description: 'Untangle a messy graph by dragging nodes until no edges cross.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' }),
    ),
    iconBg: 'bg-cyan-900/30',
    iconColor: 'text-cyan-400',
    iconBgLight: 'bg-cyan-100',
    iconColorLight: 'text-cyan-600',
    gameBgColor: '#06B6D4',
    unit: 'level',
    lowerIsBetter: false,
    category: 'Graph Theory',
  },
  {
    id: 'three-utilities' as TestId,
    name: 'Three Utilities',
    description: 'Connect houses to utilities with the fewest possible line crossings.',
    icon: React.createElement(
      'svg',
      { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor', className: 'w-6 h-6' },
      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21' }),
    ),
    iconBg: 'bg-red-900/30',
    iconColor: 'text-red-400',
    iconBgLight: 'bg-red-100',
    iconColorLight: 'text-red-600',
    gameBgColor: '#EF4444',
    unit: 'level',
    lowerIsBetter: false,
    category: 'Graph Theory',
  },
```

**Step 3: Update CATEGORY_ORDER in constants.ts**

Add `'Graph Theory'` to the end:

```ts
export const CATEGORY_ORDER = [
  'Reflexes & Speed',
  'Memory',
  'Audio & Music',
  'Language & Logic',
  'Spatial & Visual',
  'Graph Theory',
]
```

**Step 4: Add placeholder imports to page.tsx**

Import the 4 new components and add to `TEST_COMPONENTS`. They don't exist yet but will be created in subsequent tasks:

```ts
import { FiveRooms } from '@/tools/human-benchmark/tests/five-rooms'
import { FourColour } from '@/tools/human-benchmark/tests/four-colour'
import { Planarity } from '@/tools/human-benchmark/tests/planarity'
import { ThreeUtilities } from '@/tools/human-benchmark/tests/three-utilities'

// In TEST_COMPONENTS:
  'five-rooms': FiveRooms,
  'four-colour': FourColour,
  'planarity': Planarity,
  'three-utilities': ThreeUtilities,
```

**Step 5: Verify and commit**

Run: `pnpm tsc --noEmit` — expected: will fail until test components are created. That's OK — just commit the types/constants changes first.

```bash
git add tools/human-benchmark/types.ts tools/human-benchmark/constants.ts
git commit -m "feat(human-benchmark): register 4 graph theory test IDs and configs"
```

---

## Task 2: Five Rooms Puzzle

**Files:**
- Create: `tools/human-benchmark/data/five-rooms-puzzles.ts`
- Create: `tools/human-benchmark/tests/five-rooms.tsx`

### Step 1: Create puzzle data

Create `tools/human-benchmark/data/five-rooms-puzzles.ts`.

Each puzzle defines rooms (polygons) and wall segments. A wall is a shared boundary between two rooms (or a room and the exterior). The player must draw a path crossing each wall exactly once.

```ts
export interface WallSegment {
  x1: number; y1: number
  x2: number; y2: number
  /** IDs of the two rooms this wall separates (exterior = 'ext') */
  rooms: [string, string]
}

export interface RoomRegion {
  id: string
  /** SVG path d-string for the room fill area */
  path: string
  label?: string
}

export interface FiveRoomsPuzzle {
  name: string
  rooms: RoomRegion[]
  walls: WallSegment[]
  /** Whether this puzzle is solvable (has Euler path) */
  solvable: boolean
}

export const FIVE_ROOMS_PUZZLES: FiveRoomsPuzzle[][] = [
  // Level 1: 3 rooms — simple horizontal split (solvable)
  // 4 walls: top, middle, bottom exterior + 2 internal
  // Rooms: A (top half), B (bottom half), ext
  // Degree check: A borders ext(3 walls: top, left-top, right-top) + B(1 internal) = 4 even
  //               B borders ext(3 walls: bottom, left-bot, right-bot) + A(1 internal) = 4 even
  //               ext borders A(3) + B(3) = 6 even → Euler circuit exists
  [
    {
      name: 'Simple Split',
      rooms: [
        { id: 'A', path: 'M 50,50 L 250,50 L 250,150 L 50,150 Z', label: 'A' },
        { id: 'B', path: 'M 50,150 L 250,150 L 250,250 L 50,250 Z', label: 'B' },
      ],
      walls: [
        // Exterior walls of A
        { x1: 50, y1: 50, x2: 250, y2: 50, rooms: ['A', 'ext'] },     // top
        { x1: 50, y1: 50, x2: 50, y2: 150, rooms: ['A', 'ext'] },     // left-A
        { x1: 250, y1: 50, x2: 250, y2: 150, rooms: ['A', 'ext'] },   // right-A
        // Interior wall
        { x1: 50, y1: 150, x2: 250, y2: 150, rooms: ['A', 'B'] },     // middle
        // Exterior walls of B
        { x1: 50, y1: 150, x2: 50, y2: 250, rooms: ['B', 'ext'] },    // left-B
        { x1: 250, y1: 150, x2: 250, y2: 250, rooms: ['B', 'ext'] },  // right-B
        { x1: 50, y1: 250, x2: 250, y2: 250, rooms: ['B', 'ext'] },   // bottom
      ],
      solvable: true,
    },
  ],

  // Level 2: 4 rooms — 2x2 grid (solvable)
  // Cross shape interior. Each room borders 2 others + exterior.
  [
    {
      name: 'Four Quarters',
      rooms: [
        { id: 'A', path: 'M 50,50 L 150,50 L 150,150 L 50,150 Z', label: 'A' },
        { id: 'B', path: 'M 150,50 L 250,50 L 250,150 L 150,150 Z', label: 'B' },
        { id: 'C', path: 'M 50,150 L 150,150 L 150,250 L 50,250 Z', label: 'C' },
        { id: 'D', path: 'M 150,150 L 250,150 L 250,250 L 150,250 Z', label: 'D' },
      ],
      walls: [
        // Exterior
        { x1: 50, y1: 50, x2: 150, y2: 50, rooms: ['A', 'ext'] },
        { x1: 150, y1: 50, x2: 250, y2: 50, rooms: ['B', 'ext'] },
        { x1: 250, y1: 50, x2: 250, y2: 150, rooms: ['B', 'ext'] },
        { x1: 250, y1: 150, x2: 250, y2: 250, rooms: ['D', 'ext'] },
        { x1: 150, y1: 250, x2: 250, y2: 250, rooms: ['D', 'ext'] },
        { x1: 50, y1: 250, x2: 150, y2: 250, rooms: ['C', 'ext'] },
        { x1: 50, y1: 150, x2: 50, y2: 250, rooms: ['C', 'ext'] },
        { x1: 50, y1: 50, x2: 50, y2: 150, rooms: ['A', 'ext'] },
        // Interior
        { x1: 150, y1: 50, x2: 150, y2: 150, rooms: ['A', 'B'] },
        { x1: 150, y1: 150, x2: 150, y2: 250, rooms: ['C', 'D'] },
        { x1: 50, y1: 150, x2: 150, y2: 150, rooms: ['A', 'C'] },
        { x1: 150, y1: 150, x2: 250, y2: 150, rooms: ['B', 'D'] },
      ],
      solvable: true,
    },
  ],

  // Level 3: Classic 5 rooms (IMPOSSIBLE — 4 rooms with odd degree)
  // Rectangle divided by a cross, exterior is 5th room
  [
    {
      name: 'Classic Five Rooms',
      rooms: [
        { id: 'A', path: 'M 50,50 L 150,50 L 150,150 L 50,150 Z', label: 'A' },
        { id: 'B', path: 'M 150,50 L 250,50 L 250,150 L 150,150 Z', label: 'B' },
        { id: 'C', path: 'M 50,150 L 150,150 L 150,250 L 50,250 Z', label: 'C' },
        { id: 'D', path: 'M 150,150 L 250,150 L 250,250 L 150,250 Z', label: 'D' },
      ],
      walls: [
        // Exterior top
        { x1: 50, y1: 50, x2: 150, y2: 50, rooms: ['A', 'ext'] },
        { x1: 150, y1: 50, x2: 250, y2: 50, rooms: ['B', 'ext'] },
        // Exterior right
        { x1: 250, y1: 50, x2: 250, y2: 150, rooms: ['B', 'ext'] },
        { x1: 250, y1: 150, x2: 250, y2: 250, rooms: ['D', 'ext'] },
        // Exterior bottom
        { x1: 150, y1: 250, x2: 250, y2: 250, rooms: ['D', 'ext'] },
        { x1: 50, y1: 250, x2: 150, y2: 250, rooms: ['C', 'ext'] },
        // Exterior left
        { x1: 50, y1: 150, x2: 50, y2: 250, rooms: ['C', 'ext'] },
        { x1: 50, y1: 50, x2: 50, y2: 150, rooms: ['A', 'ext'] },
        // Interior cross
        { x1: 150, y1: 50, x2: 150, y2: 150, rooms: ['A', 'B'] },
        { x1: 150, y1: 150, x2: 150, y2: 250, rooms: ['C', 'D'] },
        { x1: 50, y1: 150, x2: 150, y2: 150, rooms: ['A', 'C'] },
        { x1: 150, y1: 150, x2: 250, y2: 150, rooms: ['B', 'D'] },
        // Extra diagonal wall making it unsolvable (5 odd-degree nodes)
        { x1: 50, y1: 50, x2: 150, y2: 150, rooms: ['A', 'ext'] },
      ],
      solvable: false,
    },
  ],

  // Levels 4-8: Additional solvable layouts with increasing room counts
  // (Implementer: create 5 more puzzles with 5-8 rooms, all solvable with Euler paths.
  //  Verify: exactly 0 or 2 rooms with odd wall-count. Use a rectangle subdivided
  //  by horizontal/vertical/diagonal walls.)
]
```

**Note to implementer**: The Level 3 "classic five rooms" puzzle above is a simplified version. The implementer should verify Euler path properties by computing the dual graph degree of each room (count how many walls border it). For the puzzle to have an Euler path: exactly 0 or 2 nodes (rooms + exterior) should have odd degree. For impossible puzzles: 4+ nodes have odd degree.

Add at least 5 more solvable levels (levels 4-8) with increasing numbers of rooms (5, 6, 7, 8, 9 rooms). Each must be verified for Euler path solvability.

### Step 2: Create test component

Create `tools/human-benchmark/tests/five-rooms.tsx`.

The component structure follows the standard HB pattern:

```tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { FIVE_ROOMS_PUZZLES } from '../data/five-rooms-puzzles'
import type { FiveRoomsPuzzle, WallSegment } from '../data/five-rooms-puzzles'

type Phase = 'intro' | 'playing' | 'gameover'
```

**Key game mechanics:**
- Player taps wall segments to add them to their path
- A wall is only valid if it shares a room with the previously crossed wall (continuity)
- Each wall can only be crossed once
- Crossed walls turn green; invalid taps shake red
- When all walls are crossed → level complete
- For impossible puzzles: after 3 failed attempts (getting stuck), reveal "This puzzle is impossible!" with a brief explanation, then advance to next level anyway
- 3 lives system, score = level reached

**SVG structure:**
- `viewBox="0 0 300 300"`
- Room fills as `<path>` with light translucent colors
- Wall segments as `<line>` elements (grey = unvisited, green = crossed)
- Current room indicator (the room the path is "in")
- Path visualization as connected line through wall midpoints

### Step 3: Commit

```bash
git add tools/human-benchmark/data/five-rooms-puzzles.ts tools/human-benchmark/tests/five-rooms.tsx
git commit -m "feat(human-benchmark): implement Five Rooms puzzle"
```

---

## Task 3: Four Colour Theorem

**Files:**
- Create: `tools/human-benchmark/data/four-colour-maps.ts`
- Create: `tools/human-benchmark/tests/four-colour.tsx`

### Step 1: Create map data

Create `tools/human-benchmark/data/four-colour-maps.ts`.

Each map defines regions as SVG paths with an adjacency list. All maps are guaranteed 4-colorable.

```ts
export interface MapRegion {
  id: string
  path: string           // SVG path d-string
  label?: string         // Optional display name
  centroid: [number, number]  // Center point for label placement
}

export interface FourColourMap {
  name: string
  regions: MapRegion[]
  /** Adjacency: region ID → array of neighbor region IDs */
  adjacency: Record<string, string[]>
  /** Minimum colors needed (2, 3, or 4) */
  chromaticNumber: number
}

export const FOUR_COLOUR_MAPS: FourColourMap[][] = [
  // Level 1: 4 regions, linear chain (needs 2 colors)
  // Level 2: 5 regions, cycle (needs 3 colors)
  // Level 3: 6 regions (needs 3 colors)
  // Level 4: 7 regions (needs 4 colors)
  // Level 5-8: 8-15 regions (needs 4 colors)
  // ...
]
```

**Implementer**: Create at least 8 levels of maps. Levels 1-2 should use 4-5 regions. Levels 3-5 use 6-8 regions. Levels 6-8 use 10-15 regions. Regions should be SVG `<path>` elements that tile a 300×300 viewBox without gaps. Verify adjacency is correct and symmetric. Use geometric shapes (rectangles, triangles, hexagons) to build the maps. Every map must be verifiably 4-colorable.

### Step 2: Create test component

Create `tools/human-benchmark/tests/four-colour.tsx`.

```tsx
'use client'

import { useState, useCallback } from 'react'
import { GameCard } from '../game-card'
import type { TestComponentProps } from '../types'
import { FOUR_COLOUR_MAPS } from '../data/four-colour-maps'
import type { FourColourMap } from '../data/four-colour-maps'

type Phase = 'intro' | 'playing' | 'gameover'

const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#EAB308'] // red, blue, green, yellow
const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow']
```

**Key game mechanics:**
- Player taps a region to select it (white stroke highlight)
- Then taps a color swatch to fill it
- Adjacent conflicts: pulsing red border between conflicting regions
- "Submit" button to check solution (or auto-check when all regions colored)
- If valid → level complete. If conflicts → lose a life, reset colors
- Bonus display if solved with fewer than 4 colors
- 3 lives, score = level reached

**SVG structure:**
- `viewBox="0 0 300 300"`
- Regions as `<path>` with dynamic `fill` from state
- Selected region: white stroke, strokeWidth=3
- Color palette: 4 circles below the SVG (44px touch targets)
- Conflict indicator: animated dashed stroke between conflicting neighbors

### Step 3: Commit

```bash
git add tools/human-benchmark/data/four-colour-maps.ts tools/human-benchmark/tests/four-colour.tsx
git commit -m "feat(human-benchmark): implement Four Colour Theorem test"
```

---

## Task 4: Planarity

**Files:**
- Create: `tools/human-benchmark/data/planarity-graphs.ts`
- Create: `tools/human-benchmark/tests/planarity.tsx`

### Step 1: Create graph data

Create `tools/human-benchmark/data/planarity-graphs.ts`.

Each graph defines a planar graph with a known planar embedding (solution positions) and scrambled initial positions.

```ts
export interface PlanarityGraph {
  /** Solution node positions (planar layout with no crossings) */
  solutionPositions: [number, number][]
  /** Scrambled starting positions */
  startPositions: [number, number][]
  edges: [number, number][]
}

export const PLANARITY_GRAPHS: PlanarityGraph[][] = [
  // Level 1: 4 nodes, 4 edges (square)
  // Level 2: 5 nodes, 7 edges
  // Level 3: 6 nodes, 9 edges
  // Level 4: 7 nodes, 11 edges
  // ...up to level 10: 15 nodes
]
```

**Implementer**: Generate graphs by starting from a known planar embedding (triangulation or maximal planar graph), then scramble node positions into a tangled arrangement. Ensure every graph is actually planar. Start positions should create visible crossings. Use coordinates in a 300×300 viewBox.

### Step 2: Create test component

Create `tools/human-benchmark/tests/planarity.tsx`.

**Key game mechanics:**
- Nodes rendered as draggable `<circle>` elements (r=12, touch-friendly)
- Edges as `<line>` elements, color-coded: green = no crossing, red = crossing
- Real-time crossing detection on every node drag using line segment intersection
- Crossing counter badge: "3 crossings remaining"
- When crossings = 0 → level complete (brief celebration, auto-advance)
- 3 lives — lose one if timer expires (90 seconds per level)
- Score = level reached

**Line segment intersection algorithm** (implement as utility function):
```ts
function segmentsIntersect(
  p1: [number, number], p2: [number, number],
  p3: [number, number], p4: [number, number]
): boolean {
  // Standard cross-product method
  // Returns true if segments p1-p2 and p3-p4 properly intersect
  // Exclude shared endpoints (edges sharing a node don't count as crossing)
}
```

**Drag implementation:**
- Use `onPointerDown` on each node `<g>` element
- `setPointerCapture` for reliable drag
- Convert client coords to SVG coords using `getScreenCTM()` (with null guard!)
- Update node position in state on `onPointerMove` on the SVG element
- `onPointerUp` releases drag

### Step 3: Commit

```bash
git add tools/human-benchmark/data/planarity-graphs.ts tools/human-benchmark/tests/planarity.tsx
git commit -m "feat(human-benchmark): implement Planarity test"
```

---

## Task 5: Three Utilities Problem

**Files:**
- Create: `tools/human-benchmark/tests/three-utilities.tsx`

No data file needed — K_{m,n} bipartite graphs generated procedurally.

### Step 1: Create test component

Create `tools/human-benchmark/tests/three-utilities.tsx`.

**Level progression:**
```ts
function getLevelConfig(level: number): { m: number; n: number; minCrossings: number } {
  // Level 1: K2,2 → 0 crossings (planar)
  // Level 2: K2,3 → 0 crossings (planar)
  // Level 3: K3,3 → 1 crossing (classic!)
  // Level 4: K3,4 → 2 crossings
  // Level 5: K4,4 → 4 crossings
  // Level 6: K3,5 → 4 crossings
  // Level 7: K4,5 → 8 crossings
  // Level 8: K5,5 → 16 crossings
  const levels = [
    { m: 2, n: 2, minCrossings: 0 },
    { m: 2, n: 3, minCrossings: 0 },
    { m: 3, n: 3, minCrossings: 1 },
    { m: 3, n: 4, minCrossings: 2 },
    { m: 4, n: 4, minCrossings: 4 },
    { m: 3, n: 5, minCrossings: 4 },
    { m: 4, n: 5, minCrossings: 8 },
    { m: 5, n: 5, minCrossings: 16 },
  ]
  return levels[Math.min(level - 1, levels.length - 1)]
}
```

**Key game mechanics:**
- Top row: house nodes (colored squares with H1, H2, etc.)
- Bottom row: utility nodes (colored circles with W, G, E, etc.)
- Player taps a house, then taps a utility to draw a straight-line connection
- All m×n connections must be drawn
- Crossings counted in real-time (same intersection algorithm as Planarity)
- Crossing dots rendered as red ✕ markers at intersection points
- When all connections drawn → compare crossings to minimum
- If crossings ≤ minimum → perfect, advance. If crossings ≤ minimum + 2 → pass with score. If crossings > minimum + 2 → lose a life
- 3 lives, score = level reached
- Educational note shown after each level: "K₃,₃ has crossing number 1"

**SVG structure:**
- `viewBox="0 0 300 300"`
- Houses at top: y=50, evenly spaced
- Utilities at bottom: y=250, evenly spaced
- Connections as `<line>` with house-specific colors
- Active connection (in progress): dashed line following pointer
- Crossing markers: red circles at intersection points

### Step 2: Commit

```bash
git add tools/human-benchmark/tests/three-utilities.tsx
git commit -m "feat(human-benchmark): implement Three Utilities Problem test"
```

---

## Task 6: Wire up page.tsx imports and build verify

**Files:**
- Modify: `app/tools/human-benchmark/page.tsx`

### Step 1: Add imports and map entries

Add the 4 imports and TEST_COMPONENTS entries (as specified in Task 1 Step 4).

### Step 2: Build verification

Run:
```bash
pnpm tsc --noEmit
pnpm build
```

Both must pass with zero errors.

### Step 3: Commit

```bash
git add app/tools/human-benchmark/page.tsx
git commit -m "feat(human-benchmark): wire up 4 graph theory tests (27 total)"
```

---

## Task 7: Browser verification

Run the webapp-testing skill to verify all 4 tests load and play on the dev server:

1. Dashboard shows "Graph Theory" category with 4 test cards
2. Five Rooms: loads intro, click to start, tap walls to draw path
3. Four Colour: loads intro, click to start, tap regions and color them
4. Planarity: loads intro, click to start, drag nodes to untangle
5. Three Utilities: loads intro, click to start, connect houses to utilities

Take screenshots of each test in playing state. Verify no console errors.
