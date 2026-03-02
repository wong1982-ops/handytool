# Human Benchmark: 4 Graph Theory Tests — Design

## Overview

Add 4 new graph theory / topology puzzle tests to the Human Benchmark, in a new **Graph Theory** category. Total tests: 27 (23 existing + 4 new).

## Tests

### 1. Five Rooms Puzzle

**Concept**: A house floor plan with rooms and walls. Draw a continuous line that crosses every wall segment exactly once (Euler path through the dual graph).

**Gameplay**:
- Progressive levels. Level 1 = simple 3-room layout (solvable). Levels progress to harder multi-room layouts. Classic 5-room (impossible) appears as a discovery level — reveal impossibility after N attempts.
- Tap wall segments in sequence to draw the path. Each wall highlights green when crossed. Invalid moves (re-crossing, breaking continuity) shake red.
- 3 lives, score = level reached.

**Rendering**: SVG. Room walls as `<line>` segments, rooms as `<rect>`/`<polygon>` regions. Path drawn as colored polyline overlay.

**Color theme**: `#8B5CF6` (purple)

---

### 2. Four Colour Theorem

**Concept**: Color regions of a planar map using at most 4 colors so no two adjacent regions share the same color.

**Gameplay**:
- Progressive levels with increasing region count. Level 1 = 4 regions, up to 15+ at high levels.
- Tap a region to select, then tap a color swatch (red, blue, green, yellow) to fill. Adjacent conflicts highlighted with pulsing border. Recolor freely before submitting.
- 3 lives — lose one on submit with conflicts.
- Scoring: time + number of color changes. Bonus for using fewer than 4 colors.

**Map generation**: Handcrafted maps per difficulty tier with pre-computed adjacency. Guarantee 4-colorability.

**Rendering**: SVG. Regions as `<path>` with fill. 4 color circles as palette below map. Selected region gets white stroke.

**Color theme**: `#F59E0B` (amber)

---

### 3. Planarity

**Concept**: Given a tangled planar graph, drag nodes to rearrange so no edges cross.

**Gameplay**:
- Progressive levels. Level 1 = 4 nodes, 5 edges. Up to 15+ nodes at high levels.
- Drag nodes freely on SVG canvas. Edges follow as rubber-band lines. Crossing edges = red, non-crossing = green. All green → level complete.
- 3 lives — lose one on timeout.
- Scoring: time + number of moves.

**Edge crossing detection**: Real-time line segment intersection check on every node drag. O(E²) per move.

**Puzzle generation**: Start from known planar embedding, scramble node positions to create tangles. Solvability guaranteed by construction.

**Rendering**: SVG. Nodes as draggable `<circle>` (r=15). Edges as `<line>` color-coded by crossing state. Crossing count badge.

**Color theme**: `#06B6D4` (cyan)

---

### 4. Three Utilities Problem (K₃,₃ Minimum Crossings)

**Concept**: Connect houses to utilities (Water, Gas, Electricity). Goal: minimize edge crossings. Classic K₃,₃ is non-planar (minimum 1 crossing).

**Gameplay**:
- Progressive levels. Level 1 = K₂,₂ (0 crossings possible). Level 2 = K₂,₃. Level 3 = K₃,₃ (minimum 1 crossing). Level 4+ = K₃,₄, K₄,₄ with increasing minimum crossings.
- Tap house → tap utility to draw connection (straight line). Crossings detected and counted in real-time.
- 3 lives — lose one if exceeding minimum by 3+.
- Score: how close to theoretical minimum crossing number.
- Educational note after each level explaining the graph theory.

**Generation**: K_{m,n} bipartite graphs generated procedurally — no data file needed.

**Rendering**: SVG. Houses as colored icons (top row), utilities as W/G/E icons (bottom row). Connections as `<line>` or `<path>`. Crossings marked with red ✕.

**Color theme**: `#EF4444` (red)

---

## Architecture

### Dashboard
- New "Graph Theory" category (6th), added to `CATEGORY_ORDER`
- 4 new test cards
- Total: 27 tests

### Shared Patterns (existing)
- Phase state machine: `intro` → `playing` → `gameover`
- `GameCard` wrapper with `bgColor` and `badge`
- `TestComponentProps` with `onComplete`, `bestScore`
- Score stored via `useTestScores` hook
- SVG rendering

### New Files
- `tools/human-benchmark/tests/five-rooms.tsx`
- `tools/human-benchmark/tests/four-colour.tsx`
- `tools/human-benchmark/tests/planarity.tsx`
- `tools/human-benchmark/tests/three-utilities.tsx`
- `tools/human-benchmark/data/five-rooms-puzzles.ts`
- `tools/human-benchmark/data/four-colour-maps.ts`
- `tools/human-benchmark/data/planarity-graphs.ts`

### Modified Files
- `tools/human-benchmark/types.ts` — add 4 TestIds
- `tools/human-benchmark/constants.ts` — add 4 TestConfigs + update CATEGORY_ORDER
- `app/tools/human-benchmark/page.tsx` — add 4 imports + TEST_COMPONENTS entries
