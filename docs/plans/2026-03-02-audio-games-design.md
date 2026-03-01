# Human Benchmark — 4 New Audio Games Design

**Date:** 2026-03-02
**Status:** Approved
**Scope:** Add 4 new audio-based tests to the existing Human Benchmark tool (currently 12 tests → 16 tests)

---

## Overview

Add four new audio/ear-training tests alongside the existing Pitch Identification test:

| # | Test | Chinese Name | Type | Score | Lower is Better |
|---|------|-------------|------|-------|-----------------|
| 1 | Interval Recognition | 音程识别 | Auditory | Level | No |
| 2 | Chord Identification | 和弦识别 | Auditory | Level | No |
| 3 | Tone Memory | 音调记忆 | Auditory/Memory | Level | No |
| 4 | Higher or Lower | 高低音判断 | Auditory/Speed | Level | No |

All tests follow the existing component pattern: `TestComponentProps`, phase-based state machine, `GameCard` wrapper, localStorage scoring via `useTestScores` hook.

---

## Test 1: Interval Recognition (音程识别)

**TestId:** `interval-recognition`
**Color:** Teal `#14b8a6`
**Icon:** Two musical notes / ascending arrows

### Gameplay

1. **Intro** — "Identify the interval between two notes" with headphone emoji
2. **Playing** — Two notes play in sequence (500ms apart). 4 buttons show interval names.
3. **Feedback** — Correct = green flash + advance. Wrong = red flash + lose 1 life (3 lives total).
4. **Result** — Score = highest level reached.

### Progression

| Levels | Difficulty | Interval Pool |
|--------|-----------|---------------|
| 1-3 | Easy | Major 3rd, Perfect 5th, Octave (very distinct sounds) |
| 4-6 | Medium | Add Major 2nd, Perfect 4th, Major 6th, Major 7th |
| 7+ | Hard | Add minor variants (m2, m3, m6, m7), tritone |

### Technical

- **Audio:** Reuse existing `AudioContext` pattern. Play root note for 500ms, then interval note for 500ms.
- **Interval calculation:** Given a root frequency, multiply by the interval ratio (e.g., perfect 5th = 1.5, octave = 2.0).
- **Answer generation:** 1 correct interval + 3 distractors from the current difficulty pool.
- **Root note:** Random from C3-C5 range to keep intervals audible.
- **Scoring:** `lowerIsBetter: false`. Score = level number.

### Interval Ratios

```typescript
interface IntervalInfo {
  name: string        // "Major 3rd", "Perfect 5th"
  shortName: string   // "M3", "P5"
  ratio: number       // frequency ratio (e.g., 1.5 for P5)
  semitones: number   // semitones above root
  difficulty: 1 | 2 | 3
}
```

| Interval | Semitones | Ratio | Difficulty |
|----------|-----------|-------|------------|
| Minor 2nd | 1 | 1.0595 | 3 |
| Major 2nd | 2 | 1.1225 | 2 |
| Minor 3rd | 3 | 1.1892 | 3 |
| Major 3rd | 4 | 1.2599 | 1 |
| Perfect 4th | 5 | 1.3348 | 2 |
| Tritone | 6 | 1.4142 | 3 |
| Perfect 5th | 7 | 1.4983 | 1 |
| Minor 6th | 8 | 1.5874 | 3 |
| Major 6th | 9 | 1.6818 | 2 |
| Minor 7th | 10 | 1.7818 | 3 |
| Major 7th | 11 | 1.8877 | 2 |
| Octave | 12 | 2.0 | 1 |

---

## Test 2: Chord Identification (和弦识别)

**TestId:** `chord-identification`
**Color:** Pink `#ec4899`
**Icon:** Three stacked notes / chord symbol

### Gameplay

1. **Intro** — "Listen to the chord and identify its type" with piano emoji
2. **Playing** — A chord (3-4 notes simultaneously) plays for 1.5 seconds. 4 buttons show chord types.
3. **Feedback** — Correct = green flash + advance. Wrong = red flash + lose 1 life (3 lives total).
4. **Result** — Score = highest level reached.

### Progression

| Levels | Difficulty | Chord Pool |
|--------|-----------|------------|
| 1-3 | Easy | Major, Minor (very distinct emotional quality) |
| 4-6 | Medium | Add Diminished, Augmented |
| 7+ | Hard | Add Major 7th, Minor 7th, Dominant 7th |

### Technical

- **Audio:** Play all chord tones simultaneously using multiple `OscillatorNode` instances connected to a single `GainNode`.
- **Chord construction:** Given a root note, apply semitone offsets for each chord type.
- **Root note:** Random from C3-C4 range (lower range for richer chords).
- **Scoring:** `lowerIsBetter: false`. Score = level number.

### Chord Structures (semitone offsets from root)

```typescript
interface ChordInfo {
  name: string        // "Major", "Minor"
  symbol: string      // "maj", "min"
  offsets: number[]   // semitones from root [0, 4, 7] for major
  difficulty: 1 | 2 | 3
}
```

| Chord | Offsets | Difficulty |
|-------|---------|------------|
| Major | [0, 4, 7] | 1 |
| Minor | [0, 3, 7] | 1 |
| Diminished | [0, 3, 6] | 2 |
| Augmented | [0, 4, 8] | 2 |
| Major 7th | [0, 4, 7, 11] | 3 |
| Minor 7th | [0, 3, 7, 10] | 3 |
| Dominant 7th | [0, 4, 7, 10] | 3 |

---

## Test 3: Tone Memory (音调记忆)

**TestId:** `tone-memory`
**Color:** Emerald `#10b981`
**Icon:** Brain + musical note

### Gameplay

1. **Intro** — "Remember the tone sequence and play it back" with brain emoji
2. **Listen phase** — A sequence of tones plays, each with a corresponding colored button lighting up. Sequence starts at 2 notes, grows by 1 each level.
3. **Replay phase** — "Your turn!" — 4 colored tone buttons appear. Player clicks them in the correct order.
4. **Feedback** — Correct sequence = advance to next level. Wrong = lose 1 life (3 lives total).
5. **Result** — Score = highest level reached (= longest sequence remembered).

### Visual Design

- 4 colored tone buttons arranged in a 2×2 grid (like Simon Says)
- Colors: Red (#ef4444), Blue (#3b82f6), Green (#22c55e), Yellow (#eab308)
- Each button has a distinct frequency: C4, E4, G4, C5
- Active button: brightens + scales up slightly during playback
- Player turn: buttons respond to clicks with tone + visual feedback

### Technical

- **Audio:** 4 fixed tones mapped to 4 buttons. Each plays for 400ms with 200ms gap between notes in sequence.
- **Sequence generation:** Each level appends one random tone (from 4 options) to the existing sequence.
- **Playback speed:** Constant 400ms per note + 200ms gap.
- **Input validation:** Compare user's click sequence against the target sequence in real-time. Fail immediately on wrong click.
- **Scoring:** `lowerIsBetter: false`. Score = level number (= sequence length).

---

## Test 4: Higher or Lower (高低音判断)

**TestId:** `higher-or-lower`
**Color:** Sky `#0ea5e9`
**Icon:** Up/down arrows / frequency wave

### Gameplay

1. **Intro** — "Which tone was higher?" with wave emoji
2. **Playing** — Two tones play in quick succession (300ms each, 200ms gap). Two large buttons: "1st" and "2nd".
3. **Feedback** — Correct = green flash + advance. Wrong = red flash + lose 1 life (3 lives total).
4. **Result** — Score = highest level reached.

### Progression

| Levels | Difficulty | Frequency Gap |
|--------|-----------|---------------|
| 1-3 | Easy | > 100Hz gap (e.g., C4 vs G4) |
| 4-6 | Medium | 50-100Hz gap |
| 7-9 | Hard | 20-50Hz gap |
| 10+ | Very Hard | 5-20Hz gap (near-threshold discrimination) |

### Technical

- **Audio:** Play tone 1 for 300ms, 200ms silence, then tone 2 for 300ms.
- **Tone generation:** Pick a random base frequency (200-600Hz range), then add/subtract the gap amount. Randomly decide which tone is higher.
- **Gap calculation:** `baseGap = 150 / (1 + (level - 1) * 0.3)` — starts at 150Hz, decreases with level.
- **Answer:** Two large buttons — "1st was Higher" and "2nd was Higher".
- **Replay button:** Allow replaying the pair during the playing phase.
- **Scoring:** `lowerIsBetter: false`. Score = level number.

---

## Integration Points

### types.ts Updates

Extend `TestId` union type with 4 new IDs:
```typescript
| 'interval-recognition'
| 'chord-identification'
| 'tone-memory'
| 'higher-or-lower'
```

### constants.ts Updates

Add 4 new entries to `TEST_CONFIGS`.

### page.tsx Updates

Add 4 new entries to `TEST_COMPONENTS` map.

### data/tips.ts Updates

Add tips for each new test (4-5 tips each).

### New Files

```
tools/human-benchmark/tests/
├── interval-recognition.tsx
├── chord-identification.tsx
├── tone-memory.tsx
└── higher-or-lower.tsx

tools/human-benchmark/data/
├── intervals.ts      # interval definitions and ratios
└── chords.ts         # chord structures and semitone offsets
```

### Shared Audio Utilities

The existing `notes.ts` provides the frequency data. New data files for intervals and chords will reference frequencies via semitone math rather than duplicating the note table.

---

## Accessibility

- **All tests:** Replay button available during playing phase. Headphones recommended notice on intro screens.
- **Tone Memory:** Visual feedback (button colors light up) alongside audio. Keyboard shortcuts (1-4 keys) for the 4 tone buttons.
- **Higher or Lower:** Clear "1st" vs "2nd" labeling. Keyboard shortcuts (left/right arrows).
- **Interval/Chord:** Note names shown alongside interval/chord names after feedback for educational value.

## Performance

- Reuse single `AudioContext` instance per test (existing pattern).
- Multiple oscillators for chords connected through a single gain node to prevent clipping.
- All audio cleanup on component unmount (existing pattern).
