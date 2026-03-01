# Human Benchmark — 4 New Tests Design

**Date:** 2026-03-01
**Status:** Approved
**Scope:** Add 4 new tests to the existing Human Benchmark tool (currently 8 tests → 12 tests)

---

## Overview

Add four new cognitive/perceptual tests to the Human Benchmark tool:

| # | Test | Chinese Name | Type | Score | Lower is Better |
|---|------|-------------|------|-------|-----------------|
| 1 | Pitch Identification | 听音测试 | Auditory | Level | No |
| 2 | Mental Rotation | 空间测试 | Spatial | Level | No |
| 3 | Schulte Grid | 注意力测试 (舒尔特方格) | Attention | Seconds | Yes |
| 4 | Rhythm Test | 节奏感测试 | Motor/Auditory | Accuracy % | No |

All tests follow the existing component pattern: `TestComponentProps`, phase-based state machine, `GameCard` wrapper, localStorage scoring via `useTestScores` hook.

---

## Test 1: Pitch Identification (听音测试)

**TestId:** `pitch-identification`
**Color:** Amber `#F59E0B`
**Icon:** Musical note / headphone

### Gameplay

1. **Intro** — "Put on headphones and click to start" with headphone emoji
2. **Playing** — A pure tone plays for 1 second via Web Audio API. 4 buttons show note names.
3. **Feedback** — Correct = green flash + advance. Wrong = red flash + lose 1 life (3 lives total).
4. **Result** — Score = highest level reached.

### Progression

| Levels | Difficulty | Options |
|--------|-----------|---------|
| 1-3 | Easy | Notes spaced by full steps (C4, E4, G4, B4) |
| 4-6 | Medium | Half steps (C4, C#4, D4, D#4) |
| 7+ | Hard | Close frequencies, chromatic neighbors |

### Technical

- **Audio:** `OscillatorNode` with sine wave. Frequency map from C3 (130.81Hz) to C6 (1046.50Hz).
- **Note table:** Standard equal temperament tuning, A4 = 440Hz.
- **Answer generation:** 1 correct note + 3 distractors from the current difficulty pool.
- **Scoring:** `lowerIsBetter: false`. Score = level number.

---

## Test 2: Mental Rotation (空间测试)

**TestId:** `mental-rotation`
**Color:** Cyan `#06B6D4`
**Icon:** Cube / 3D rotate

### Gameplay

1. **Intro** — "Identify the rotated shape" with cube emoji
2. **Active** — Reference shape displayed at top. 4 options below (1 correct rotation, 3 mirrored/distorted distractors).
3. **Feedback** — Correct = green border + advance. Wrong = red border + lose 1 life (3 lives).
4. **Result** — Score = highest level reached.

### Progression

| Levels | Shapes | Rotation |
|--------|--------|----------|
| 1-3 | Simple (L, T, arrow, zigzag) | 90° increments |
| 4-6 | Complex polygons (5-7 vertices) | 45° increments |
| 7+ | Complex with similar distractors | Arbitrary angles |

### Technical

- **Shapes:** ~15 predefined base shapes as SVG `<path>` data, centered on origin.
- **Correct answer:** Apply `transform: rotate(Xdeg)` to the base shape.
- **Distractors:** Apply `scaleX(-1)` (mirror) then different rotations. Ensures they look similar but are NOT valid rotations.
- **Rendering:** SVG elements with CSS transforms. All shapes render in a consistent viewport (100x100 SVG viewBox).
- **Scoring:** `lowerIsBetter: false`. Score = level number.

### Shape Data Structure

```typescript
interface Shape {
  id: string
  path: string        // SVG path d attribute
  difficulty: 1 | 2 | 3
  viewBox: string     // SVG viewBox
}
```

---

## Test 3: Schulte Grid (注意力测试 — 舒尔特方格)

**TestId:** `schulte-grid`
**Color:** Rose `#F43F5E`
**Icon:** Grid / hash

### Gameplay

1. **Intro** — "Find numbers 1 to 25 in order, as fast as you can" with grid emoji
2. **Active** — 5×5 grid with numbers 1-25 randomly placed. Current target displayed above grid.
3. **Correct tap** — Cell turns green with subtle checkmark. Target advances to next number.
4. **Wrong tap** — Cell flashes red for 200ms. No penalty, timer keeps running.
5. **Complete** — All 25 found. Score = elapsed time in seconds.

### Visual Details

- **Grid:** 5×5 equal cells, responsive sizing (min 60px per cell on mobile)
- **Target indicator:** "Find: **13**" above grid, large bold number
- **Badge:** "12/25" progress counter
- **Timer:** Visible elapsed time (ss.ss format) during play
- **Completed cells:** Fade to muted green, number replaced with ✓
- **Active cell (wrong):** Red flash 200ms

### Technical

- **Grid generation:** Shuffle array [1..25] using Fisher-Yates.
- **Timer:** `performance.now()` for high precision. Display updates via `requestAnimationFrame`.
- **Scoring:** `lowerIsBetter: true`. Score = total milliseconds (displayed as seconds to 2 decimal places).

---

## Test 4: Rhythm Test (节奏感测试)

**TestId:** `rhythm-test`
**Color:** Violet `#8B5CF6`
**Icon:** Drum / music beat

### Gameplay

1. **Intro** — "Listen to the rhythm, then tap it back" with drum emoji
2. **Listen phase** — Beat pattern plays with visual + audio feedback. Beat indicators (dots) light up in sequence.
3. **Record phase** — "Your turn!" — large circular tap button appears. User taps to recreate the rhythm.
4. **Analysis** — Visual comparison of original vs user timing.
5. **Result** — Score = average accuracy % across 3 rounds.

### Scoring Algorithm

```
For each original beat:
  1. Find closest user tap within ±200ms tolerance
  2. deviation = |original_timestamp - user_timestamp|
  3. beat_score = max(0, 1 - deviation / 200)

Extra taps (unmatched): penalty = -0.5 per extra tap
Missing taps (unmatched original beats): score = 0 for that beat

round_score = (sum of beat_scores - extra_penalties) / total_original_beats × 100
final_score = average of 3 round_scores (clamped 0-100)
```

### Pattern Library

```typescript
interface RhythmPattern {
  name: string
  beats: number[]    // timestamps in ms relative to start
  bpm: number        // for display purposes
  difficulty: 'easy' | 'medium' | 'hard'
}
```

| Difficulty | Beats | Spacing | Example |
|-----------|-------|---------|---------|
| Easy (rounds 1-3) | 4 | Even quarter notes | [0, 500, 1000, 1500] |
| Medium (rounds 4-6) | 6 | Mixed quarter + eighth | [0, 500, 750, 1250, 1500, 2000] |
| Hard (rounds 7+) | 8 | Syncopated/triplets | [0, 333, 666, 1000, 1500, 1750, 2000, 2500] |

### Technical

- **Audio:** Procedurally generated click/drum via Web Audio API. Short `AudioBufferSourceNode` with percussive envelope (attack 1ms, decay 50ms).
- **Visual:** Large circular button (200px) that pulses/scales on each beat. Beat indicator dots above show pattern progress.
- **Recording:** Capture `performance.now()` on each tap, normalize to pattern start time.
- **3 rounds:** One from each difficulty tier. Final score = average of all 3.
- **Scoring:** `lowerIsBetter: false`. Score = accuracy percentage (0-100).

---

## Integration Points

### constants.ts Updates

Add 4 new entries to `TEST_CONFIGS`:

```typescript
{
  id: 'pitch-identification',
  name: 'Pitch Identification',
  description: 'How well can you identify musical tones?',
  icon: '🎵',  // or SVG
  color: '#F59E0B',
  lowerIsBetter: false,
  unit: 'level'
}
// ... similar for other 3 tests
```

### types.ts Updates

Extend `TestId` union type with 4 new IDs.

### page.tsx Updates

Add 4 new entries to `TEST_COMPONENTS` map.

### data/tips.ts Updates

Add tips for each new test (4-5 tips each).

### New Files

```
tools/human-benchmark/tests/
├── pitch-identification.tsx
├── mental-rotation.tsx
├── schulte-grid.tsx
└── rhythm-test.tsx

tools/human-benchmark/data/
├── notes.ts          # frequency map for pitch test
├── shapes.ts         # SVG path data for rotation test
└── rhythms.ts        # beat patterns for rhythm test
```

---

## Accessibility

- **Pitch Test:** Visual frequency indicator alongside audio (colored bar showing pitch height) for hearing-impaired users to still see the mechanic, though the test inherently requires hearing.
- **Schulte Grid:** Large touch targets (min 44px), high contrast numbers, keyboard navigation (arrow keys + enter).
- **Mental Rotation:** All shapes have sufficient contrast, options clearly separated, keyboard selectable (1-4 keys).
- **Rhythm Test:** Visual beat indicator (pulsing circle) alongside audio. Spacebar as alternative to clicking the tap button.

## Performance

- Web Audio API `AudioContext` created once, reused across rounds.
- SVG shapes are lightweight, no canvas needed.
- `requestAnimationFrame` for timer display (Schulte Grid) instead of `setInterval`.
- Timeout cleanup on component unmount (existing pattern).
