export interface RhythmPattern {
  name: string
  beats: number[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export const RHYTHM_PATTERNS: RhythmPattern[] = [
  { name: 'Steady Four', difficulty: 'easy', beats: [0, 500, 1000, 1500] },
  { name: 'Slow March', difficulty: 'easy', beats: [0, 600, 1200, 1800] },
  { name: 'Quick Pulse', difficulty: 'easy', beats: [0, 400, 800, 1200] },
  { name: 'Wide Four', difficulty: 'easy', beats: [0, 700, 1400, 2100] },
  { name: 'Standard Beat', difficulty: 'easy', beats: [0, 500, 1000, 1500] },
  { name: 'Swing Feel', difficulty: 'medium', beats: [0, 500, 750, 1250, 1500, 2000] },
  { name: 'Gallop', difficulty: 'medium', beats: [0, 250, 500, 1000, 1250, 1500] },
  { name: 'Shuffle', difficulty: 'medium', beats: [0, 333, 666, 1000, 1500, 2000] },
  { name: 'Dotted Rhythm', difficulty: 'medium', beats: [0, 750, 1000, 1750, 2000, 2500] },
  { name: 'Push Beat', difficulty: 'medium', beats: [0, 500, 1000, 1250, 1750, 2250] },
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
