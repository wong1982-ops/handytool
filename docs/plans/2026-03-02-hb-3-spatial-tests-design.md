# Human Benchmark — 3 Spatial & Visual Tests Design

**Date**: 2026-03-02
**Tests**: Color Sensitivity, One Stroke, Tangram
**Total after**: 23 tests

## Approach

All 3 tests use inline SVG for rendering. This gives crisp visuals at all resolutions, simple hit detection, accessible DOM elements, and consistent styling with the rest of the app.

## Shared Mechanics

- Progressive difficulty with levels
- 3 lives (wrong answers / failed puzzles / timeouts = game over)
- Score unit: `level` (higher is better)
- Phases: `intro` → `playing` → `result`
- Standard `TestComponentProps` signature

---

## Test 1: Color Sensitivity

**Mechanic**: Grid of SVG `<rect>` tiles. One tile has a slightly different hue/saturation/lightness. Player taps the odd one out.

### Progression

| Level | Grid Size | Color Delta (HSL lightness diff) |
|---|---|---|
| 1–3 | 4×4 | ~15% difference |
| 4–6 | 5×5 | ~10% |
| 7–9 | 6×6 | ~6% |
| 10–12 | 7×7 | ~4% |
| 13+ | 8×8 | ~2% (extremely subtle) |

### Scoring

- Score: level reached (higher = better)
- 3 wrong clicks = game over
- Random base hue each level
- Timer shown but not scored

### Feedback

- Correct: tile flashes green, grid reshuffles for next level
- Wrong: tile flashes red, lives indicator updates
- Game over: show level reached + "Try Again"

---

## Test 2: One Stroke (Eulerian Path)

**Mechanic**: SVG graph with `<circle>` nodes and `<line>` edges. Player taps nodes in sequence to trace every edge exactly once.

### Puzzle Generation

- Pre-defined puzzle set per level (not random — ensures solvability)
- All puzzles guaranteed to have at least one Eulerian path (0 or 2 odd-degree nodes)
- Stored in `tools/human-benchmark/data/one-stroke-puzzles.ts`

### Progression

| Level | Nodes | Edges | Shape Example |
|---|---|---|---|
| 1 | 3 | 3 | Triangle |
| 2 | 4 | 4 | Square |
| 3 | 4 | 6 | Square + diagonals |
| 4 | 5 | 8 | Envelope (house) |
| 5–6 | 5–6 | 8–10 | Pentagram, nested shapes |
| 7–9 | 6–7 | 10–14 | Complex graphs |
| 10+ | 7–8 | 14–18 | Dense interconnected graphs |

### Interaction

1. Tap any node to start (highlights with glow)
2. Tap adjacent node → edge animates as drawn (colored line replaces grey)
3. Invalid tap (no edge, already drawn, not adjacent) → shake animation + error flash
4. Complete all edges → level up
5. Stuck (no valid moves but edges remain) → counts as a fail, lose 1 life
6. "Undo last move" button available (doesn't cost a life)

### Visual

- Undrawn edges: grey/dashed
- Drawn edges: colored (using `gameBgColor`)
- Current node: pulsing glow
- Nodes: white circles with dark border, ~40px touch target

---

## Test 3: Tangram

**Mechanic**: 7 classic tangram pieces as SVG `<polygon>` elements. Player drags and rotates them to fill a target silhouette.

### The 7 Pieces (standard tangram set)

- 2 large right triangles
- 1 medium right triangle
- 2 small right triangles
- 1 square
- 1 parallelogram

### Interaction

- **Drag**: touch/mouse drag to move piece
- **Rotate**: tap piece to select, then tap rotate button (45° increments)
- **Flip**: parallelogram has a flip button (only asymmetric piece)
- **Snap**: within ~15px of correct position + rotation → snaps into place with animation
- Pieces rendered on a unit grid for clean snap math

### Progression

| Level | Pieces Used | Puzzle Type |
|---|---|---|
| 1–2 | 3 pieces | Simple shapes (arrow, house) |
| 3–4 | 4–5 pieces | Medium shapes (cat, boat) |
| 5–7 | 6 pieces | Complex shapes (running person, bird) |
| 8+ | All 7 pieces | Full tangram (swan, candle, etc.) |

### Puzzle Data

- Pre-defined in `tools/human-benchmark/data/tangram-puzzles.ts`
- Each puzzle: target silhouette path + solution positions/rotations for each piece
- Silhouette shown as filled grey shape, pieces are colored

### Scoring

- Score: level reached (higher = better)
- Time limit per puzzle: 60s (L1–3), 90s (L4–6), 120s (L7+)
- 3 timeouts = game over
- No penalty for moving pieces around

### Visual

- Target silhouette: semi-transparent grey fill
- Pieces: distinct colors (orange, blue, green, red, yellow, purple, teal)
- Placed piece: locks in place with subtle glow
- Piece tray: below puzzle on mobile, right side on desktop

---

## Integration

### New Files

```
tools/human-benchmark/tests/color-sensitivity.tsx
tools/human-benchmark/tests/one-stroke.tsx
tools/human-benchmark/tests/tangram.tsx
tools/human-benchmark/data/one-stroke-puzzles.ts
tools/human-benchmark/data/tangram-puzzles.ts
```

### Registry Changes

- `types.ts` — add TestIds: `color-sensitivity`, `one-stroke`, `tangram`
- `constants.ts` — add 3 TestConfig entries
- `app/tools/human-benchmark/page.tsx` — import + map in TEST_COMPONENTS

### Config

| Test | unit | lowerIsBetter | gameBgColor | Icon |
|---|---|---|---|---|
| Color Sensitivity | `level` | `false` | `#E8567F` (pink-red) | Eye / palette |
| One Stroke | `level` | `false` | `#4CAF50` (green) | Pen / path |
| Tangram | `level` | `false` | `#FF9800` (orange) | Puzzle piece |

### Dashboard Grouping

Add `category` field to `TestConfig`. All 3 new tests grouped under **"Spatial & Visual"**. Dashboard renders grouped sections. Existing 20 tests can be categorized retroactively or left ungrouped.

### No Backend

All client-side, localStorage scores, consistent with existing tests.
